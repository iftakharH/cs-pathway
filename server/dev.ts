import './env.js'
import { createApp } from './app.js'

const port = Number(process.env.API_PORT ?? 3101)
const app = createApp()
const server = app.listen(port, '127.0.0.1', () => {
  console.info(`API listening on http://127.0.0.1:${port}`, server.address())
})

// Keep the local process alive when a parent shell closes stdin.
setInterval(() => undefined, 60_000)
