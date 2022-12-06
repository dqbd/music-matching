import { useMutation } from "@tanstack/react-query"
import { MediaRecorder, register } from "extendable-media-recorder"
import type { IBlobEvent } from "extendable-media-recorder"
import { connect } from "extendable-media-recorder-wav-encoder"
import { useRef } from "react"
import { ButtonLabel } from "./ButtonLabel"
import { Timer } from "./Timer"
import { CircleButton } from "./CircleButton"
import { MicrophoneIcon } from "./Icons"

const useMediaRecorder = (props: { onSuccess: (file: File) => void }) => {
  const initWav = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)

  const mutation = useMutation(
    async () => {
      // initialize WAV extentable-media-recorder
      initWav.current = true
      if (!initWav.current) {
        try {
          await register(await connect())
        } catch (err) {
          console.debug(err)
        }
      }

      const stream = (streamRef.current =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        }))

      return await new Promise<File>((resolve, reject) => {
        const chunks: Blob[] = []
        const recorder = new MediaRecorder(stream)

        const onDataAvailable = (e: IBlobEvent) => {
          if (e.data.size) chunks.push(e.data)
        }

        const onError = (e: ErrorEvent) => reject(e)
        const onStop = () => {
          recorder.removeEventListener("dataavailable", onDataAvailable)
          recorder.removeEventListener("error", onError)
          recorder.removeEventListener("stop", onStop)
          resolve(new File(chunks, "recording.wav", { type: "audio/wav" }))
        }

        recorder.addEventListener("dataavailable", onDataAvailable)
        recorder.addEventListener("error", onError)
        recorder.addEventListener("stop", onStop)
        recorder.start()
      })
    },
    { onSuccess: props.onSuccess }
  )

  function stop() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }

  return {
    mutation,
    start: () => mutation.mutateAsync(),
    stop,
  }
}
function ClientAudioRecorder(props: {
  onRecordStart: () => void
  onSubmit: (file: File) => void
  layoutId?: string
}) {
  const { mutation, start, stop } = useMediaRecorder({
    onSuccess: props.onSubmit,
  })

  return (
    <ButtonLabel
      title={
        mutation.isLoading || mutation.isSuccess ? <Timer /> : "Record Sample"
      }
    >
      <CircleButton
        layoutId={props.layoutId}
        isLoading={mutation.isLoading}
        onClick={() => {
          if (mutation.isLoading) {
            stop()
          } else {
            props.onRecordStart()
            start()
          }
        }}
      >
        <MicrophoneIcon />
      </CircleButton>
    </ButtonLabel>
  )
}

export default ClientAudioRecorder
