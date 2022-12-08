import fs from "node:fs/promises"

export async function tmpRemove<T extends readonly string[], R>(
  files: T,
  cb: (files: T) => R
) {
  try {
    return await cb(files)
  } finally {
    console.log("Deleting files", files)
    await Promise.all(files.map((item) => fs.unlink(item)))
  }
}
