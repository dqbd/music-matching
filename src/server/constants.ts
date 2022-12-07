/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from "node:path"

export const WORKER_MATCH_PATH = path.resolve(
  process.env.ROOT!,
  "worker/tasks/shazam_match.py"
)

export const WORKER_FINGERPRINT_PATH = path.resolve(
  process.env.ROOT!,
  "worker/tasks/shazam_fingerprint.py"
)

export const TMP_DIR_PATH = path.resolve(process.env.ROOT!, "tmp")

export const DATASET_DIR_PATH = path.resolve(process.env.ROOT!, "dataset")

export const PYTHON_BIN_PATH = `/opt/homebrew/bin/python3`
