import dynamic from "next/dynamic"

export const AudioRecorder = dynamic(() => import("./AudioRecorder.utils"), {
  ssr: false,
})
