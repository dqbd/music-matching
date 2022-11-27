import { css } from "@emotion/react"
import type { ReactNode } from "react"

export const ButtonLabel = (props: {
  children?: ReactNode
  title?: ReactNode
}) => {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 24px;
      `}
    >
      {props.children}

      <span
        css={css`
          font-size: 16px;
          color: #e2e8f0;
          text-align: center;
        `}
      >
        {props.title}
      </span>
    </div>
  )
}
