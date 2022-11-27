import { Button } from "@mantine/core"
import { useMutation } from "@tanstack/react-query"
import { MediaRecorder, register } from "extendable-media-recorder"
import type { IBlobEvent } from "extendable-media-recorder"
import { connect } from "extendable-media-recorder-wav-encoder"
import { useRef } from "react"

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
    isRecording: mutation.isLoading,
    start: () => mutation.mutateAsync(),
    stop,
  }
}
export function AudioRecorder(props: { onSubmit: (file: File) => void }) {
  const { isRecording, start, stop } = useMediaRecorder({
    onSuccess: props.onSubmit,
  })

  return (
    <div>
      {isRecording ? (
        <Button onClick={stop} variant="subtle">
          Stop
        </Button>
      ) : (
        <Button onClick={start}>Start</Button>
      )}
    </div>
  )
}

export default AudioRecorder
