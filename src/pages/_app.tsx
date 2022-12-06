import { type AppType } from "next/app"

import { trpc } from "../utils/trpc"

import { MantineProvider } from "@mantine/core"
import { css, Global } from "@emotion/react"
import Head from "next/head"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>VMM Audio Matching</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Global
        styles={css`
          *,
          *:before,
          *:after {
            box-sizing: border-box;

            font-family: system-ui;
          }

          body {
            margin: 0;
            padding: 0;
          }
        `}
      />
      <MantineProvider theme={{ colorScheme: "light" }}>
        <Component {...pageProps} />
      </MantineProvider>
    </>
  )
}

export default trpc.withTRPC(MyApp)
