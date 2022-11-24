import { css } from "@emotion/react"
import { Button, FileInput } from "@mantine/core"
import { useState } from "react"

export const UploadForm = (props: {
  onSubmit: (file: File) => void
  isLoading: boolean
}) => {
  const [file, setFile] = useState<File | null>(null)

  return (
    <form
      css={css`
        display: grid;
        gap: 12px;
        grid-template-columns: minmax(200px, 1fr) auto;
      `}
      onSubmit={(e) => {
        e.preventDefault()
        if (file != null) props.onSubmit(file)
      }}
    >
      <FileInput onChange={setFile} value={file} />
      <Button type="submit" disabled={props.isLoading}>
        Nahrát
      </Button>
    </form>
  )
}
