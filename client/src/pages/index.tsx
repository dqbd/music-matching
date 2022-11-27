import { css } from "@emotion/react"
import { Button, Divider, Text, Title } from "@mantine/core"
import { useMutation } from "@tanstack/react-query"
import { type NextPage } from "next"
import { Fragment } from "react"
import { AudioMatch } from "../components/AudioMatch"
import { UploadForm } from "../components/UploadForm"
import { useFileUploadMutation } from "../utils/file"
import { trpc } from "../utils/trpc"

const Home: NextPage = () => {
  const fileMutation = useFileUploadMutation()
  const matchMutation = trpc.song.match.useMutation()

  const importMutation = trpc.song.import.useMutation()

  const mutation = useMutation(async (file: File) => {
    const fileName = await fileMutation.mutateAsync(file)
    return await matchMutation.mutateAsync({ fileName })
  })

  return (
    <>
      <main
        css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #1f2937;

          min-height: 100vh;
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 16px;

            width: 100%;
            max-width: 420px;
          `}
        >
          <Title
            order={2}
            css={css`
              color: white;
              text-align: center;
            `}
          >
            NI-VMM Audio Podobnost
          </Title>
          <div
            css={css`
              background: white;
              padding: 16px;
              padding-top: 14px;
              border-radius: 12px;

              width: 100%;

              box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);

              display: flex;
              flex-direction: column;
              gap: 8px;
            `}
          >
            <Text>Nahrát audio nahrávku</Text>
            <UploadForm
              onSubmit={(file) => mutation.mutate(file)}
              isLoading={mutation.isLoading}
            />
          </div>

          <Button onClick={() => importMutation.mutate()}>Import songs</Button>

          {matchMutation.isSuccess && (
            <div
              css={css`
                background: white;
                padding: 16px;
                border-radius: 12px;
                width: 100%;

                display: flex;
                flex-direction: column;
                gap: 12px;
              `}
            >
              {matchMutation.data.map((i, idx) => (
                <Fragment key={i.songId}>
                  <AudioMatch songId={i.songId} />
                  {idx + 1 !== matchMutation.data.length && <Divider />}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default Home
