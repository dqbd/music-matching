import { css } from "@emotion/react"
import { useMutation } from "@tanstack/react-query"
import { type NextPage } from "next"
import { Fragment } from "react"
import { AudioMatch } from "../components/AudioMatch"
import { useFileUploadMutation } from "../utils/file"
import { trpc } from "../utils/trpc"
import { ButtonController } from "../components/ButtonController"
import { AnimatePresence } from "framer-motion"
import { motion } from "framer-motion"

const Home: NextPage = () => {
  const fileMutation = useFileUploadMutation()
  const matchMutation = trpc.song.match.useMutation()

  const mutation = useMutation(
    async (data: { source: "upload" | "record"; file: File }) => {
      const fileName = await fileMutation.mutateAsync(data.file)
      return await matchMutation.mutateAsync({ fileName })
    }
  )

  return (
    <>
      <main
        css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          background: radial-gradient(
              252.57% 100% at 50% 100%,
              rgba(100, 116, 139, 0.2) 0%,
              rgba(0, 0, 0, 0) 100%
            ),
            #1f2937;

          min-height: 100vh;
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 72px;

            width: 100%;
            max-width: 430px;
          `}
        >
          <ButtonController
            key={matchMutation.isLoading ? "loading" : "not-loading"}
            source={mutation.variables?.source ?? "upload"}
            isLoading={matchMutation.isLoading}
            onClear={() => matchMutation.reset()}
            onFile={(source, file) => mutation.mutate({ source, file })}
          />

          <AnimatePresence>
            {matchMutation.isSuccess && (
              <motion.div
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                css={css`
                  width: 100%;

                  

                  background: rgba(0, 0, 0, 0.15);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 16px;
                  min-height: 180px;

                  max-height: 500px;
                  overflow-y: auto;
                `}
              >
                <div css={css`
                  display: flex;
                  flex-direction: column;
                  align-items: stretch;

                  padding: 24px;
                  padding-left: 36px;
                  justify-content: center;
                  gap: 12px;
                `}>
                  {matchMutation.data.length > 0 ? (
                    <>
                      {matchMutation.data.map((i, idx) => (
                        <Fragment key={i.songId}>
                          <AudioMatch
                            songId={i.songId}
                            matches={i.matches}
                            index={idx < 3 ? idx + 1 : undefined}
                          />
                        </Fragment>
                      ))}
                    </>
                  ) : (
                    <span
                      css={css`
                        color: #475569;
                        text-align: center;
                      `}
                    >
                      No Data
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}

export default Home
