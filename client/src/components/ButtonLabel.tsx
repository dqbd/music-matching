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

        position: relative;
      `}
    >
      {props.children}

      <span
        css={css`
          font-size: 16px;
          color: #e2e8f0;
          text-align: center;

          position: absolute;

          top: 100%;
          margin-top: 24px;
        `}
      >
        {props.title}
      </span>
    </div>
  )
}
