import path from "node:path"
import { z } from "zod"
import {
  DATASET_DIR_PATH,
  PYTHON_BIN_PATH,
  TMP_DIR_PATH,
  WORKER_FINGERPRINT_PATH,
  WORKER_MATCH_PATH,
} from "../../constants"

import { promises as fs } from "node:fs"
import { router, publicProcedure } from "../trpc"
import { spawn } from "node:child_process"
import type { SpawnOptionsWithoutStdio } from "node:child_process"

const FingerprintSchema = z.array(
  z.object({
    hash: z.string(),
    time: z.number(),
  })
)

const spawnAsync = (
  command: string,
  args?: readonly string[],
  options?: SpawnOptionsWithoutStdio
) => {
  return new Promise<{ stdout: Buffer; stderr: Buffer }>((resolve, reject) => {
    const stdout: Buffer[] = []
    const stderr: Buffer[] = []

    const child = spawn(command, args, options)

    child.on("error", (err) => reject(err))
    child.stdout?.on("error", (err) => reject(err))
    child.stderr?.on("error", (err) => reject(err))
    child.stdin?.on("error", (err) => reject(err))

    child.stdout?.on("data", (data: Buffer) => stdout.push(data))
    child.stderr?.on("data", (data: Buffer) => stderr.push(data))

    child.on("close", (code) => {
      if (code === 0)
        return resolve({
          stdout: Buffer.concat(stdout),
          stderr: Buffer.concat(stderr),
        })
      return reject(new Error(`Command exited with code: ${code}`))
    })
  })
}

const spawnWorker = async <T extends z.ZodType>(
  worker: string,
  args: readonly string[],
  output: T
): Promise<z.infer<T>> => {
  const exec = await spawnAsync(PYTHON_BIN_PATH, [worker, ...args])
  return output.parse(JSON.parse(exec.stdout.toString("utf-8")))
}

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
          coverImg: item.thumbnails.reduce<
            IndexObjectWithFile["thumbnails"][number] | null
          >((memo, item) => {
            if (!memo || item.width > memo.width || item.height > memo.height)
              return item
            return memo
          }, null)?.url,
          fingerprints: {
            create: fingerprints,
          },
        },
      })
    }

    return { index }
  }),
})
