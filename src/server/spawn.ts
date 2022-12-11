import { spawn } from "node:child_process"
import type { z } from "zod"
import type { SpawnOptionsWithoutStdio } from "node:child_process"
import { env } from "../env/server.mjs"

export const spawnAsync = (
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
    child.stderr?.on("data", (data: Buffer) => {
      process.stderr.write(data)
      stderr.push(data)
    })

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

export const spawnWorker = async <T extends z.ZodType>(
  worker: string,
  args: readonly string[],
  output: T
): Promise<z.infer<T>> => {
  const exec = await spawnAsync(env.PYTHON3_PATH, [worker, ...args])
  return output.parse(JSON.parse(exec.stdout.toString("utf-8")))
}
