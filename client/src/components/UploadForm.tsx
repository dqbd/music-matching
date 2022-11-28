import { css } from "@emotion/react"
import { CircleButton } from "./CircleButton"
import { UploadIcon } from "./Icons"
import { ButtonLabel } from "./ButtonLabel"

export const UploadForm = (props: {
  onChange: (file: File) => void
  layoutId?: string
}) => (
  <ButtonLabel title="Identify track">
    <CircleButton layoutId={props.layoutId}>
      <UploadIcon />
      <input
        type="file"
        css={css`
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          opacity: 0;
        `}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file != null) props.onChange(file)
        }}
      />
    </CircleButton>
  </ButtonLabel>
)
