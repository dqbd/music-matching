/* eslint-disable @typescript-eslint/no-unused-vars */
import { css } from "@emotion/react"
import { Badge, Button, Checkbox } from "@mantine/core"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import type { RouterOutputs } from "../utils/trpc"
import { trpc } from "../utils/trpc"

type SelectedItemList = Exclude<RouterOutputs["import"]["list"], undefined>

const serialize = ({ isImported, ...a }: Record<string, unknown>) =>
  JSON.stringify(a)

export default function Page() {
  const [selected, setItems] = useState<SelectedItemList>([])

  const reset = trpc.import.reset.useMutation()

  const selectedJson = selected.map((i) => serialize(i))

  const [loading, setLoading] = useState<
    Record<string, "loading" | "success" | "error">
  >({})

  const database = trpc.import.database.useMutation()
  const process = trpc.import.fingerprint.useMutation({
    onMutate: (variables) => {
      setLoading((record) => ({
        ...record,
        [serialize(variables)]: "loading",
      }))
    },
    onSuccess: (_, variables) => {
      setLoading((record) => ({
        ...record,
        [serialize(variables)]: "success",
      }))
    },
    onError: (_, variables) => {
      setLoading((record) => ({
        ...record,
        [serialize(variables)]: "error",
      }))
    },
  })

  const processAll = useMutation(
    async (selected: SelectedItemList) => {
      const slices: SelectedItemList[] = []

      for (let i = 0; i < selected.length; i += 8) {
        slices.push(selected.slice(i, i + 8))
      }

      for (const slice of slices) {
        await Promise.all(slice.map((i) => process.mutateAsync(i)))
      }
    },
    {
      onMutate() {
        setLoading({})
      },
    }
  )

  const isLoading =
    reset.isLoading || processAll.isLoading || database.isLoading

  const list = trpc.import.list.useQuery(undefined, { enabled: !isLoading })

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
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;

          background: white;
          position: sticky;
          top: 0;

          z-index: 1;
        `}
      >
        <h1>Manage songs</h1>

        <div
          css={css`
            display: flex;
            gap: 8px;
          `}
        >
          <Button
            onClick={() =>
              setItems((curr) => (curr.length ? [] : list.data ?? []))
            }
            disabled={isLoading}
            variant="subtle"
          >
            Select all
          </Button>

          <Button
            onClick={() =>
              setItems((curr) =>
                curr.length
                  ? []
                  : list.data?.filter((i) => !i.isFingerprinted) ?? []
              )
            }
            disabled={isLoading}
            variant="subtle"
          >
            Select missing
          </Button>

          <Button
            onClick={() => processAll.mutate(selected)}
            disabled={isLoading}
          >
            Fingerprint
          </Button>

          <Button
            onClick={() => database.mutate(selected)}
            disabled={isLoading}
          >
            Insert
          </Button>

          <Button
            color="red"
            onClick={() => reset.mutate()}
            disabled={isLoading}
          >
            Truncate
          </Button>
        </div>
      </div>

      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: 12px;
        `}
      >
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          `}
        >
          {list.data?.map((item) => {
            const serialized = serialize(item)
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
                          (item) => serialize(item) !== serialized
                        )
                      )
                    }
                  }}
                  label={
                    <div>
                      <div>
                        <div
                          css={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <strong>{item.title}</strong>

                          <div>
                            {item.isFingerprinted && (
                              <Badge color="green">Fingerprinted</Badge>
                            )}
                            {loading[serialized] === "loading" && (
                              <Badge>Loading</Badge>
                            )}
                            {loading[serialized] === "error" && (
                              <Badge color="red">Error</Badge>
                            )}
                          </div>
                        </div>

                        <div>{item.artists}</div>

                        <div css={{ display: "flex", gap: 12 }}>
                          <div>{item.album}</div>
                        </div>

                        <i>
                          {item.coverUrl ? "With URL Image" : "No URL Image"}
                        </i>
                      </div>
                    </div>
                  }
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
