import { css } from "@emotion/react"
import { useEffect, useState } from "react"

export const Timer = () => {
  const [now, setNow] = useState(Date.now())

  const [mount] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      css={css`
        color: #1e293b;
        font-weight: 700;
        padding: 8px 12px;

        display: flex;
        align-items: center;
        gap: 6px;

        background: #94a3b8;
        border-radius: 9999px;

        box-shadow: 0px 4px 16px rgba(15, 23, 42, 0.3);

        &:before {
          content: "";
          width: 12px;
          height: 12px;

          background: #dc2626;

          border-radius: 9999px;
          display: block;
        }
      `}
    >
      {Math.floor((now - mount) / 1000)}s
    </div>
  )
}
