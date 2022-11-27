import { router } from "../trpc"
import { songRouter } from "./song"

export const appRouter = router({
  song: songRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
