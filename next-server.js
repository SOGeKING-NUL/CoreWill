// Standard Next.js server entry point
const next = require('next')
const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = require('http').createServer(handle)
  
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
