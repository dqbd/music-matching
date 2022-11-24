/* eslint-disable @next/next/no-img-element */
import { css } from "@emotion/react"
import { Text } from "@mantine/core"

export const AudioMatch = (props: {
  image: string
  name: string
  author: string
}) => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 12px;
      `}
    >
      <img src={props.image} alt={props.name} css={{ borderRadius: 4 }} />
      <div>
        <Text css={{ fontWeight: 700, lineHeight: "1.2em" }}>{props.name}</Text>
        <Text>{props.author}</Text>
      </div>
    </div>
  )
}
