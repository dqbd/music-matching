import path from "node:path"
import { z } from "zod"
import { PYTHON_BIN_PATH, UPLOAD_DIR_PATH, WORKER_PATH } from "../../constants"

import { promises as fs } from "node:fs"
import { router, publicProcedure } from "../trpc"
import { spawnSync } from "node:child_process"

const HashParser = z.array(
  z.object({
    hash: z.string(),
    time: z.number(),
  })
)

export const songRouter = router({
  upload: publicProcedure
    .input(z.object({ fileName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const targetFile = path.resolve(UPLOAD_DIR_PATH, input.fileName)
      await fs.stat(targetFile)

      // obtain the file hashes
      const exec = spawnSync(PYTHON_BIN_PATH, [WORKER_PATH, targetFile])

      const fingerprints = HashParser.parse(
        JSON.parse(exec.stdout.toString("utf-8"))
      )

      const song = await ctx.prisma.song.create({
        data: {
          author: "David Duong",
          fileName: input.fileName,
          fingerprints: {
            create: fingerprints,
          },
        },
      })

      return { song }
    }),
})
