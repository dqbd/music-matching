import { css } from "@emotion/react"
import { AnimatePresence } from "framer-motion"
import { useState } from "react"
import { AudioRecorder } from "./AudioRecorder"
import { CircleButton } from "./CircleButton"
import { SearchIcon } from "./Icons"
import { UploadForm } from "./UploadForm"

export const ButtonController = (props: {
  onFile: (source: "upload" | "record", file: File) => void
  source: "upload" | "record"
  onClear: () => void
  isLoading: boolean
}) => {
  const [recordingActive, setRecordingActive] = useState(false)
  const [type, setType] = useState<"upload" | "record">(props.source)

  const handleChange = (type: "upload" | "record", file: File) => {
    props.onFile(type, file)
    setType(type)
  }

  return (
    <AnimatePresence>
      <div
        css={css`
          display: flex;
          gap: 56px;

          align-items: flex-start;
          justify-content: center;
        `}
      >
        {props.isLoading ? (
          <CircleButton isLoading layoutId={type}>
            <SearchIcon />
          </CircleButton>
        ) : (
          <>
            {!recordingActive && (
              <UploadForm
                onChange={(file) => handleChange("upload", file)}
                layoutId={type === "upload" ? "upload" : undefined}
              />
            )}
            <AudioRecorder
              layoutId={type === "record" ? "record" : undefined}
              onRecordStart={() => {
                setRecordingActive(true)
                props.onClear()
              }}
              onSubmit={(file) => handleChange("record", file)}
            />
          </>
        )}
      </div>
    </AnimatePresence>
  )
}
