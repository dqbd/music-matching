import { type NextApiRequest, type NextApiResponse } from "next"

import type { File } from "formidable"
import formidable from "formidable"
import path from "node:path"

import { celery } from "../../server/celery/client"

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const uploadDir = path.resolve(process.env.ROOT!, "../tmp")
  const form = new formidable.IncomingForm({ uploadDir, keepExtensions: true })

  try {
    const file = await new Promise<File>((resolve, reject) => {
      form.parse(req, (err, _, { file: fileObj }) => {
        if (err) return reject(err)
        if (fileObj == null) return reject(new Error("Missing file descriptor"))

        const file = Array.isArray(fileObj) ? fileObj[0] : fileObj
        if (file == null) return reject(new Error("Missing file"))
        resolve(file)
      })
    })

    const task = celery.createTask("tasks.mfcc")
    const apply = task.applyAsync({ args: [file.newFilename], kwargs: {} })
    const result = await apply.get()

    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
}

export default handler
