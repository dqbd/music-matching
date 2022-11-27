/* eslint-disable @next/next/no-img-element */
import { css } from "@emotion/react"
import { Text } from "@mantine/core"
import { trpc } from "../utils/trpc"

export const AudioMatch = (props: { songId: string }) => {
  const music = trpc.song.get.useQuery({ id: props.songId })

  if (music.isLoading || music.data == null) return null
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 12px;
      `}
    >
      {music.data.coverImg && (
        <img
          src={music.data.coverImg}
          alt={music.data.title}
          css={{ borderRadius: 4 }}
          width={64}
          height={64}
        />
      )}
      <div>
        <Text css={{ fontWeight: 700, lineHeight: "1.2em" }}>
          {music.data.title}
        </Text>
        <Text>{music.data.artists}</Text>
      </div>
    </div>
  )
}
