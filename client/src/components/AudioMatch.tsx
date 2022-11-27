/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react"
import { css } from "@emotion/react"
import { Text } from "@mantine/core"
import { trpc } from "../utils/trpc"

export const AudioMatch = (props: { songId: string; index?: ReactNode }) => {
  const music = trpc.song.get.useQuery({ id: props.songId })

  if (music.isLoading || music.data == null) return null
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 16px;
      `}
    >
      {music.data.coverImg && (
        <div
          css={css`
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <img
            src={`/api/image/${music.data.id}`}
            alt={music.data.title}
            width={72}
            height={72}
            css={css`
              border-radius: 6px;
              border: 1px solid rgba(255, 255, 255, 0.05);
            `}
          />
          {props.index != null && (
            <span
              css={css`
                width: 32px;
                height: 32px;

                display: flex;
                align-items: center;
                justify-content: center;

                background: #94a3b8;

                border-radius: 9999px;

                font-size: 16px;
                font-weight: 700;
                color: #1e293b;

                position: absolute;
                left: -16px;
                top: 50%;
                margin-top: -16px;

                box-shadow: 0px 4px 16px #0f172a;
              `}
            >
              {props.index}
            </span>
          )}
        </div>
      )}

      <div css={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Text
            css={{ lineHeight: "1.4em", fontWeight: 700, color: "#F1F5F9" }}
          >
            {music.data.title}
          </Text>
          <Text css={{ lineHeight: "1.4em", color: "#94A3B8" }}>
            {music.data.artists}
          </Text>
        </div>

        <div>
          <Text
            css={{
              lineHeight: "1.4em",
              fontWeight: 700,
              textAlign: "right",
              color: "#94A3B8",
            }}
          >
            {music.data.title}
          </Text>
          <Text
            css={{ lineHeight: "1.4em", color: "#94A3B8", textAlign: "right" }}
          >
            {music.data.artists}
          </Text>
        </div>
      </div>
    </div>
  )
}
