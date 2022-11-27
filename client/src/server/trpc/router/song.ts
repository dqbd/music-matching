import path from "node:path"
import { z } from "zod"
import {
  DATASET_DIR_PATH,
  TMP_DIR_PATH,
  WORKER_FINGERPRINT_PATH,
  WORKER_MATCH_PATH,
} from "../../constants"

import { promises as fs } from "node:fs"
import { router, publicProcedure } from "../trpc"
import { spawnWorker } from "../../spawn"
import { extension } from "mime-types"
import { wait } from "../../time"

const FingerprintSchema = z.array(
  z.object({
    hash: z.string(),
    time: z.number(),
  })
)

const IndexSchema = z.array(
  z.object({
    videoId: z.string(),
    title: z.string(),
    artists: z.array(z.object({ name: z.string(), id: z.string().nullish() })),
    album: z.object({ name: z.string(), id: z.string().nullish() }).nullish(),
    thumbnails: z.array(
      z.object({
        url: z.string(),
        width: z.number(),
        height: z.number(),
      })
    ),
    duration: z.string().nullish(),
    duration_seconds: z.number().nullish(),
  })
)

type IndexObject = z.infer<typeof IndexSchema>[number]
interface IndexObjectWithFile extends IndexObject {
  filepath: string
}

export const songRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.song.findFirstOrThrow({ where: { id: input.id } })
    }),
  match: publicProcedure
    .input(z.object({ fileName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const targetFile = path.resolve(TMP_DIR_PATH, input.fileName)
      await fs.stat(targetFile)

      // obtain the file hashes
      const recordFingerprints = await spawnWorker(
        WORKER_FINGERPRINT_PATH,
        [targetFile],
        FingerprintSchema
      )

      const matchFingerprints = await ctx.prisma.fingerprint.findMany({
        where: {
          hash: {
            in: recordFingerprints.map((i) => i.hash),
          },
        },
      })

      // run through the pattern matching
      const recordFilePath = path.resolve(
        TMP_DIR_PATH,
        `${input.fileName}.record.json`
      )
      const matchFilePath = path.resolve(
        TMP_DIR_PATH,
        `${input.fileName}.matched.json`
      )

      await Promise.all([
        fs.writeFile(recordFilePath, JSON.stringify(recordFingerprints)),
        fs.writeFile(matchFilePath, JSON.stringify(matchFingerprints)),
      ])

      // compare the file hashes
      return await spawnWorker(
        WORKER_MATCH_PATH,
        [recordFilePath, matchFilePath],
        z.array(
          z.object({
            songId: z.string(),
            matches: z.number(),
          })
        )
      )
    }),

  import: publicProcedure.mutation(async ({ ctx }) => {
    const filepaths = (await fs.readdir(DATASET_DIR_PATH))
      .filter((i) => path.extname(i).endsWith("wav"))
      .map((i) => path.resolve(DATASET_DIR_PATH, i))

    const index = IndexSchema.parse(
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
          filepath: filepaths.find((file) =>
            file.includes(`[${song.videoId}]`)
          ),
        })
      )
      .filter((x): x is IndexObjectWithFile => x.filepath != null)
      .slice(0, 3)

    await ctx.prisma.fingerprint.deleteMany()
    await ctx.prisma.song.deleteMany()

    for (const item of index) {
      const coverUrl = item.thumbnails.reduce<
        IndexObjectWithFile["thumbnails"][number] | null
      >((memo, item) => {
        if (!memo || item.width > memo.width || item.height > memo.height)
          return item
        return memo
      }, null)?.url

      let coverImg = null

      if (coverUrl != null) {
        while (coverImg == null) {
          let attempt = 0
          try {
            attempt += 1

            // attempt to get cover image
            const req = await fetch(coverUrl, {
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

            const filename = [item.videoId, extension(contentType)].join(".")
            const filepath = path.resolve(TMP_DIR_PATH, filename)

            await fs.writeFile(filepath, Buffer.from(await req.arrayBuffer()))

            coverImg = filename
          } catch (err) {
            console.error(err)
            await wait(1000 * attempt)
          }
        }
      }

      const fingerprints = await spawnWorker(
        WORKER_FINGERPRINT_PATH,
        [item.filepath],
        FingerprintSchema
      )

      await ctx.prisma.song.create({
        data: {
          id: item.videoId,
          filepath: item.filepath,
          artists: item.artists.map((i) => i.name).join(", "),
          title: item.title,
          album: item.album?.name,
          coverImg: coverImg,
          fingerprints: {
            create: fingerprints,
          },
        },
      })
    }

    return { index }
  }),
})
