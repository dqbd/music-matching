const celery = require("celery-ts")

const client = celery.createClient({
  brokerUrl: "amqp://localhost",
  resultBackend: "redis://localhost",
})

const task = client.createTask("tasks.mfcc")
const result = task.applyAsync({
  args: [0, 1],
  kwargs: {},
})

const promise = result.get()

promise.then(console.log).catch(console.error)
