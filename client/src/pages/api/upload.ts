import { type NextApiRequest, type NextApiResponse } from "next"

import type { File } from "formidable"
import formidable from "formidable"

import { TMP_DIR_PATH } from "../../server/constants"

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new formidable.IncomingForm({
    uploadDir: TMP_DIR_PATH,
    keepExtensions: true,
  })

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

    res.status(200).json({ result: file.newFilename })
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
}

export default handler
