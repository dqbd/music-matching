import { css } from "@emotion/react"
import { useState } from "react"
import { AudioRecorder } from "./AudioRecorder"
import { CircleButton } from "./CircleButton"
import { SearchIcon } from "./Icons"
import { UploadForm } from "./UploadForm"

export const ButtonController = (props: {
  onFile: (file: File) => void
  onClear: () => void
  isLoading: boolean
}) => {
  const [recordingActive, setRecordingActive] = useState(false)

  const handleChange = (file: File) => {
    props.onFile(file)
  }

  return (
    <div
      css={css`
        display: flex;
        gap: 56px;

        align-items: flex-start;
        justify-content: center;
      `}
    >
      {props.isLoading ? (
        <CircleButton isLoading>
          <SearchIcon />
        </CircleButton>
      ) : (
        <>
          {!recordingActive && <UploadForm onChange={handleChange} />}
          <AudioRecorder
            onRecordStart={() => {
              setRecordingActive(true)
              props.onClear()
            }}
            onSubmit={handleChange}
          />
        </>
      )}
    </div>
  )
}
