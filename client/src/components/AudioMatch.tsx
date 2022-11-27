/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react"
import { css } from "@emotion/react"
import { Text } from "@mantine/core"
import { trpc } from "../utils/trpc"

export const AudioMatch = (props: {
  songId: string
  matches?: number
  index?: ReactNode
}) => {
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
            {props.matches} matches
          </Text>
          <Text
            css={css`
              line-height: 1.4em;
              color: #94a3b8;
              text-align: right;

              display: flex;
              align-items: center;
              gap: 6px;

              justify-content: flex-end;
            `}
          >
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.33334 11.5L11 8.5L6.33334 5.5V11.5ZM8.00001 15.1667C7.07779 15.1667 6.21112 14.9916 5.40001 14.6413C4.5889 14.2916 3.88334 13.8167 3.28334 13.2167C2.68334 12.6167 2.20845 11.9111 1.85868 11.1C1.50845 10.2889 1.33334 9.42222 1.33334 8.5C1.33334 7.57778 1.50845 6.71111 1.85868 5.9C2.20845 5.08889 2.68334 4.38334 3.28334 3.78334C3.88334 3.18334 4.5889 2.70822 5.40001 2.358C6.21112 2.00822 7.07779 1.83334 8.00001 1.83334C8.92223 1.83334 9.7889 2.00822 10.6 2.358C11.4111 2.70822 12.1167 3.18334 12.7167 3.78334C13.3167 4.38334 13.7916 5.08889 14.1413 5.9C14.4916 6.71111 14.6667 7.57778 14.6667 8.5C14.6667 9.42222 14.4916 10.2889 14.1413 11.1C13.7916 11.9111 13.3167 12.6167 12.7167 13.2167C12.1167 13.8167 11.4111 14.2916 10.6 14.6413C9.7889 14.9916 8.92223 15.1667 8.00001 15.1667ZM8.00001 13.8333C9.4889 13.8333 10.75 13.3167 11.7833 12.2833C12.8167 11.25 13.3333 9.98889 13.3333 8.5C13.3333 7.01111 12.8167 5.75 11.7833 4.71667C10.75 3.68334 9.4889 3.16667 8.00001 3.16667C6.51112 3.16667 5.25001 3.68334 4.21668 4.71667C3.18334 5.75 2.66668 7.01111 2.66668 8.5C2.66668 9.98889 3.18334 11.25 4.21668 12.2833C5.25001 13.3167 6.51112 13.8333 8.00001 13.8333Z"
                fill="#94A3B8"
              />
            </svg>
            Play
          </Text>
        </div>
      </div>
    </div>
  )
}
