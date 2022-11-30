import path from "node:path"
import { z } from "zod"
import {
  TMP_DIR_PATH,
  WORKER_FINGERPRINT_PATH,
  WORKER_MATCH_PATH,
} from "../../constants"

import { promises as fs } from "node:fs"
import { router, publicProcedure } from "../trpc"
import { spawnWorker } from "../../spawn"

const FingerprintSchema = z.array(
  z.object({
    hash: z.string(),
    time: z.number(),
  })
)

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
})
