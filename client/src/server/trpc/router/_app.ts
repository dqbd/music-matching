import { router } from "../trpc"
import { importRouter } from "./import"
import { songRouter } from "./song"

export const appRouter = router({
  song: songRouter,
  import: importRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
