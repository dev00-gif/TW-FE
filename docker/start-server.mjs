import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import startServer from '../dist/server/server.js'

const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 3000)
const publicDir = resolve('dist/client')
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    if (req.method === 'GET' || req.method === 'HEAD') {
      const filePath = resolve(publicDir, `.${decodeURIComponent(url.pathname)}`)
      if (filePath.startsWith(`${publicDir}${sep}`)) {
        const file = await stat(filePath).catch((error) => {
          if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null
          throw error
        })
        if (file?.isFile()) {
          res.writeHead(200, {
            'content-type': contentTypes[extname(filePath)] || 'application/octet-stream',
            'content-length': file.size,
            'cache-control': url.pathname.startsWith('/assets/')
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=0, must-revalidate',
          })
          if (req.method === 'HEAD') res.end()
          else await pipeline(createReadStream(filePath), res)
          return
        }
      }
    }

    const headers = new Headers()
    for (const [name, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((item) => headers.append(name, item))
      else if (value !== undefined) headers.set(name, value)
    }
    const init = { method: req.method, headers }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = Readable.toWeb(req)
      init.duplex = 'half'
    }
    const response = await startServer.fetch(new Request(url, init))
    res.statusCode = response.status
    response.headers.forEach((value, name) => {
      if (name !== 'set-cookie') res.setHeader(name, value)
    })
    const cookies = response.headers.getSetCookie()
    if (cookies.length) res.setHeader('set-cookie', cookies)
    if (response.body && req.method !== 'HEAD') {
      await pipeline(Readable.fromWeb(response.body), res)
    } else {
      await response.body?.cancel()
      res.end()
    }
  } catch (error) {
    console.error(error)
    if (res.headersSent) res.destroy()
    else {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Internal Server Error')
    }
  }
}).listen(port, host, () => {
  console.log(`SOMICS Admin Web listening on http://${host}:${port}`)
})

