import * as Celery from "celery-ts"
import { env } from "../../env/server.mjs"

declare global {
  // eslint-disable-next-line no-var
  var celery: Celery.Client | undefined
}

export const celery =
  global.celery ||
  Celery.createClient({
    brokerUrl: "amqp://localhost",
    resultBackend: "redis://localhost",
  })

if (env.NODE_ENV !== "production") {
  global.celery = celery
}
