import path from "node:path"
import { z } from "zod"
import { TMP_DIR_PATH, WORKER_PATH } from "../../constants"

import { promises as fs } from "node:fs"
import { router, publicProcedure } from "../trpc"
import { spawnWorker } from "../../spawn"
import { tmpRemove } from "../../tmp"

const FingerprintSchema = z.array(
  z.object({
    hash: z.string(),
    time: z.number(),
  })
)

export const songRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.number() }))
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
        WORKER_PATH,
        ["fingerprint", targetFile],
        FingerprintSchema
      )

      console.log("Matching fingerprint for file", targetFile)

      const matchFingerprints = await ctx.prisma.fingerprint.findMany({
        where: {
          hash: {
            in: recordFingerprints.map((i) => i.hash),
          },
        },
      })

      console.log("Database returned fingerprints", matchFingerprints.length)

      // run through the pattern matching
      return await tmpRemove(
        [
          path.resolve(TMP_DIR_PATH, `${input.fileName}.record.json`),
          path.resolve(TMP_DIR_PATH, `${input.fileName}.matched.json`),
          targetFile,
        ] as const,
        async ([recordFilePath, matchFilePath]) => {
          console.log("Saving fingerprints for Python")

          await Promise.all([
            fs.writeFile(recordFilePath, JSON.stringify(recordFingerprints)),
            fs.writeFile(matchFilePath, JSON.stringify(matchFingerprints)),
          ])

          console.log("Launching Python")

          // compare the file hashes
          return await spawnWorker(
            WORKER_PATH,
            ["match", recordFilePath, matchFilePath],
            z.array(
              z.object({
                songId: z.number(),
                matches: z.number(),
                ratio: z.number(),
              })
            )
          )
        }
      )
    }),
})
