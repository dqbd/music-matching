import { type NextApiRequest, type NextApiResponse } from "next"

import fs from "node:fs/promises"

import { prisma } from "../../../server/db/client"
import { contentType } from "mime-types"

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const queryId = Number.parseInt(req.query.songId as string, 10)
    const song = await prisma.song.findFirstOrThrow({ where: { id: queryId } })

    if (song.filepath == null) {
      res.status(404).end()
      return
    }

    const mime = contentType(song.filepath)
    if (!mime) throw new Error("Invalid mime type")

    res.setHeader("Content-Type", mime)
    res.status(200).send(await fs.readFile(song.filepath))
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
}

export default handler
