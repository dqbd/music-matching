/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from "node:path"
import { z } from "zod"
import { DATASET_DIR_PATH, TMP_DIR_PATH, WORKER_PATH } from "../../constants"

import { promises as fs } from "node:fs"
import { router, publicProcedure } from "../trpc"
import { spawnAsync, spawnWorker } from "../../spawn"
import { extension } from "mime-types"
import { wait } from "../../time"
import { env } from "../../../env/server.mjs"

const ImportSchema = z.array(
  z.object({
    filename: z.string(),
    title: z.string(),
    artists: z.array(z.object({ name: z.string(), id: z.string().nullish() })),
    album: z.object({ name: z.string(), id: z.string().nullish() }).nullish(),
    thumbnails: z.array(
      z.object({
        url: z.string(),
        width: z.number().nullish(),
        height: z.number().nullish(),
      })
    ),
  })
)

const ItemSchema = z.object({
  title: z.string(),
  artists: z.string(),
  album: z.string().nullish(),
  filepath: z.string(),
  coverUrl: z.string().nullish(),
})

const FingerprintSchema = z.array(
  z.object({
    hash: z.string(),
    time: z.number(),
  })
)

type IndexObject = z.infer<typeof ImportSchema>[number]
interface IndexObjectWithFile extends IndexObject {
  filepath: string
}

export const importRouter = router({
  list: publicProcedure.query(async () => {
    const filepaths = (await fs.readdir(DATASET_DIR_PATH))
      .filter((i) => path.extname(i).endsWith("wav"))
      .map((i) => path.resolve(DATASET_DIR_PATH, i))

    const index = ImportSchema.parse(
      JSON.parse(
        await fs.readFile(path.resolve(DATASET_DIR_PATH, "index.json"), {
          encoding: "utf-8",
        })
      )
    )
      .map(
        (
          song
        ): Omit<IndexObjectWithFile, "filepath"> & {
          filepath: string | undefined
        } => ({
          ...song,
          filepath: filepaths.find((file) => file.includes(`${song.filename}`)),
        })
      )
      .filter((x): x is IndexObjectWithFile => x.filepath != null)

    return await Promise.all(
      index.map(async (item) => {
        const fingerprints = path.resolve(
          TMP_DIR_PATH,
          [path.basename(item.filepath), "fingerprint.json"].join(".")
        )

        let isFingerprinted = false
        try {
          await fs.stat(fingerprints)
          isFingerprinted = true
        } catch {}

        const coverUrl = item.thumbnails.reduce<
          IndexObjectWithFile["thumbnails"][number] | null
        >((memo, item) => {
          if (
            !memo ||
            (item?.width ?? 0) > (memo?.width ?? 0) ||
            (item?.height ?? 0) > (memo?.height ?? 0)
          )
            return item
          return memo
        }, null)?.url

        return {
          title: item.title,
          artists: item.artists.map((i) => i.name).join(", "),
          album: item.album?.name,
          filepath: item.filepath,
          isFingerprinted,
          coverUrl,
        }
      })
    )
  }),

  fingerprint: publicProcedure.input(ItemSchema).mutation(async ({ input }) => {
    let coverImg: string | null = null

    if (input.coverUrl != null) {
      while (coverImg == null) {
        let attempt = 0
        try {
          attempt += 1

          // attempt to get cover image
          const req = await fetch(input.coverUrl, {
            headers: {
              accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
              "accept-encoding": `gzip, deflate, br`,
              "accept-language": `en-US,en;q=0.9`,
              "cache-control": `no-cache`,
              dnt: `1`,
              pragma: `no-cache`,
              "sec-ch-ua": `"Chromium";v="107", "Not=A?Brand";v="24"`,
              "sec-ch-ua-arch": `"arm"`,
              "sec-ch-ua-bitness": `"64"`,
              "sec-ch-ua-full-version-list": `"Chromium";v="107.0.5304.122", "Not=A?Brand";v="24.0.0.0"`,
              "sec-ch-ua-mobile": `?0`,
              "sec-ch-ua-model": `""`,
              "sec-ch-ua-platform": `"macOS"`,
              "sec-ch-ua-platform-version": `"13.0.1"`,
              "sec-ch-ua-wow64": `?0`,
              "sec-fetch-dest": `document`,
              "sec-fetch-mode": `navigate`,
              "sec-fetch-site": `none`,
              "sec-fetch-user": `?1`,
              "upgrade-insecure-requests": `1`,
              "user-agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36`,
            },
          })
          if (!req.ok) throw new Error("Failed to fetch cover image")

          const contentType = req.headers.get("Content-Type")
          if (!contentType) throw new Error("Missing content type")

          const filename = [
            path.basename(input.filepath),
            extension(contentType),
          ].join(".")
          const filepath = path.resolve(TMP_DIR_PATH, filename)

          await fs.writeFile(filepath, Buffer.from(await req.arrayBuffer()))

          coverImg = filename
        } catch (err) {
          console.error(err)
          await wait(1000 * attempt)
        }
      }
    }

    const fingerprintPath = path.resolve(
      TMP_DIR_PATH,
      [path.basename(input.filepath), "fingerprint.json"].join(".")
    )

    const fingerprints = await spawnWorker(
      WORKER_PATH,
      ["fingerprint", input.filepath],
      FingerprintSchema
    )
    await fs.writeFile(fingerprintPath, JSON.stringify(fingerprints))

    return {
      ...input,
      coverImg,
      fingerprintPath,
    }
  }),

  database: publicProcedure
    .input(z.array(ItemSchema))
    .mutation(async ({ input: files, ctx }) => {
      // coverImg and fingerprintPath
      const richFiles = files.map((input) => {
        const fingerprintPath = path.resolve(
          TMP_DIR_PATH,
          [path.basename(input.filepath), "fingerprint.json"].join(".")
        )

        const coverImg = path.resolve(
          TMP_DIR_PATH,
          [path.basename(input.filepath), "jpeg"].join(".")
        )

        return { ...input, fingerprintPath, coverImg }
      })

      // database path from prisma folder
      const databasePath = path.resolve(
        process.env.ROOT!,
        "prisma",
        env.DATABASE_URL.split(":")[1]!
      )

      for (const input of richFiles) {
        console.log(`Importing file ${input.title}`)
        const fingerprints = FingerprintSchema.parse(
          JSON.parse(
            await fs.readFile(input.fingerprintPath, { encoding: "utf-8" })
          )
        )

        await ctx.prisma.song.deleteMany({
          where: { filepath: input.filepath },
        })

        const song = await ctx.prisma.song.create({
          data: {
            filepath: input.filepath,
            artists: input.artists,
            title: input.title,
            album: input.album,
            coverImg: input.coverImg,
          },
        })

        const fingerprintCsv = path.resolve(
          TMP_DIR_PATH,
          path.basename(input.fingerprintPath).replace(".json", ".csv")
        )

        await fs.writeFile(
          fingerprintCsv,
          fingerprints.map((i) => `${i.hash}|${i.time}|${song.id}`).join("\n") +
            "\n"
        )

        await spawnAsync(env.SQLITE3_PATH, [
          databasePath,
          `.mode csv`,
          `.separator |`,
          `.import "${fingerprintCsv}" Fingerprint`,
        ])
      }

      return richFiles
    }),
  reset: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.$executeRaw`DELETE FROM Fingerprint`
    await ctx.prisma.$executeRaw`DELETE FROM Song`
  }),
})
