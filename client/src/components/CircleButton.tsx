import type { ReactNode } from "react"
import { css, keyframes } from "@emotion/react"

const breath = keyframes`
  from {
    transform: scale(var(--scaleStart));
  }
  to {
    transform: scale(var(--scaleEnd));
  }
`

export function CircleButton(props: {
  children?: ReactNode
  onClick?: () => void
  isLoading?: boolean
}) {
  return (
    <>
      <button
        css={css`
          all: unset;
          background: #94a3b8;
          color: #1e293b;

          box-shadow: 0px 4px 16px 0px #0f172a;

          width: 128px;
          height: 128px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9999px;

          position: relative;
        `}
        onClick={props.onClick}
      >
        {props.isLoading && (
          <>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <span
                  key={i}
                  css={css`
                    background: #94a3b8;
                    opacity: 0.1;
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;

                    border-radius: 9999px;
                    box-shadow: 0px 4px 16px #0f172a;

                    --scaleStart: 1;
                    --scaleEnd: ${1 + 0.8 * (i + 1)};

                    animation-name: ${breath};
                    animation-duration: 2s;
                    animation-direction: alternate;
                    animation-iteration-count: infinite;
                    animation-delay: ${0.2 * i}s;
                  `}
                />
              ))}
          </>
        )}

        {props.children}
      </button>
    </>
  )
}
