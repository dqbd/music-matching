import { css } from "@emotion/react"
import { Badge, Button, Checkbox } from "@mantine/core"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import type { RouterOutputs } from "../utils/trpc"
import { trpc } from "../utils/trpc"

type SelectedItemList = Exclude<RouterOutputs["import"]["list"], undefined>

export default function Page() {
  const list = trpc.import.list.useQuery()

  const [selected, setItems] = useState<SelectedItemList>([])

  const reset = trpc.import.reset.useMutation()

  const selectedJson = selected.map((i) => JSON.stringify(i))

  const [loading, setLoading] = useState<
    Record<string, "loading" | "success" | "error">
  >({})

  const process = trpc.import.process.useMutation({
    onMutate: (variables) => {
      setLoading((record) => ({
        ...record,
        [JSON.stringify(variables)]: "loading",
      }))
    },
    onSuccess: (_, variables) => {
      setLoading((record) => ({
        ...record,
        [JSON.stringify(variables)]: "success",
      }))
    },
    onError: (_, variables) => {
      setLoading((record) => ({
        ...record,
        [JSON.stringify(variables)]: "error",
      }))
    },
  })

  const processAll = useMutation(
    async (selected: SelectedItemList) => {
      for (const i of selected) {
        await process.mutateAsync(i)
      }
    },
    {
      onMutate() {
        setLoading({})
      },
    }
  )

  const isLoading = reset.isLoading || processAll.isLoading

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 32px;
      `}
    >
      <h1>Import songs</h1>

      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: 12px;
        `}
      >
        {list.data?.map((item) => {
          const serialized = JSON.stringify(item)
          const isChecked = selectedJson.includes(serialized)

          return (
            <div
              key={item.filepath}
              css={css`
                padding: 8px 0;
              `}
            >
              <Checkbox
                value={item.filepath}
                checked={isChecked}
                disabled={isLoading}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    setItems([...selected, item])
                  } else {
                    setItems(
                      selected.filter(
                        (item) => JSON.stringify(item) !== serialized
                      )
                    )
                  }
                }}
                label={
                  <div>
                    <div>
                      <div
                        css={{ display: "flex", gap: 8, alignItems: "center" }}
                      >
                        <strong>{item.title}</strong>
                        {loading[serialized] === "loading" && (
                          <Badge>Loading</Badge>
                        )}
                        {loading[serialized] === "error" && (
                          <Badge color="red">Error</Badge>
                        )}
                        {loading[serialized] === "success" && (
                          <Badge color="green">Success</Badge>
                        )}
                      </div>
                      <div>{item.artists}</div>

                      <div css={{ display: "flex", gap: 12 }}>
                        <div>{item.album}</div>
                      </div>

                      <i>{item.coverUrl ? "With URL Image" : "No URL Image"}</i>
                    </div>
                  </div>
                }
              />
            </div>
          )
        })}

        <Button
          onClick={() => processAll.mutate(selected)}
          disabled={isLoading}
        >
          Import and fingerprint songs
        </Button>

        <Button color="red" onClick={() => reset.mutate()} disabled={isLoading}>
          Reset all
        </Button>
      </div>
    </div>
  )
}
