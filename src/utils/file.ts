import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export const useFileUploadMutation = () => {
  return useMutation(async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return await (
      await axios.putForm<{ result: string }>("/api/upload", formData)
    ).data.result
  })
}
