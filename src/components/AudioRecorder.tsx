import { useMutation } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { ButtonLabel } from "./ButtonLabel"
import { Timer } from "./Timer"
import { CircleButton } from "./CircleButton"
import { MicrophoneIcon } from "./Icons"

import Recorder from "recorder-js"

export function AudioRecorder(props: {
  onRecordStart: () => void
  onSubmit: (file: File) => void
  layoutId?: string
}) {
  const [isRecording, setIsRecording] = useState(false)
  const ref = useRef<Recorder | null>(null)

  const start = useMutation(
    async () => {
      ref.current = new Recorder(new AudioContext())

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      await ref.current.init(stream)
      await ref.current.start()
    },
    {
      onSuccess: () => setIsRecording(true),
      onError: () => setIsRecording(false),
      onMutate: () => {
        props.onRecordStart()
        setIsRecording(false)
      },
    }
  )

  const stop = useMutation(
    async () => {
      const result = await ref.current?.stop()
      if (!result?.blob) throw new Error("No blob available")

      const file = new File([result.blob], "recording.wav", {
        type: "audio/wav",
      })

      return file
    },
    { onSuccess: props.onSubmit, onSettled: () => setIsRecording(false) }
  )

  const isLoading = start.isLoading || stop.isLoading

  return (
    <ButtonLabel
      title={
        isLoading || isRecording || stop.isSuccess ? <Timer /> : "Record Sample"
      }
    >
      <CircleButton
        layoutId={props.layoutId}
        isLoading={isLoading || isRecording || stop.isSuccess}
        onClick={() => {
          if (isRecording) {
            stop.mutate()
          } else {
            start.mutate()
          }
        }}
      >
        <MicrophoneIcon />
      </CircleButton>
    </ButtonLabel>
  )
}
