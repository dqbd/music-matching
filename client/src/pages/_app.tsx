import { type AppType } from "next/app"

import { trpc } from "../utils/trpc"

import { MantineProvider } from "@mantine/core"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <MantineProvider theme={{ colorScheme: "light" }}>
      <Component {...pageProps} />
    </MantineProvider>
  )
}

export default trpc.withTRPC(MyApp)
