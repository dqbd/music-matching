/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from "node:path"

export const WORKER_PATH = path.resolve(
  process.env.ROOT!,
  "../worker/tasks/shazam.py"
)

export const UPLOAD_DIR_PATH = path.resolve(process.env.ROOT!, "../tmp")

export const PYTHON_BIN_PATH = `/opt/homebrew/bin/python3`
