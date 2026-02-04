import { createReadStream, existsSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const PUBLIC_DIR = resolve(process.cwd(), 'public')

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.json': 'application/json',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export function serveStatic(req: IncomingMessage, res: ServerResponse): void {
  const urlPath = req.url?.split('?')[0] ?? '/'
  const safePath = urlPath === '/' ? '/index.html' : urlPath

  let filePath = resolve(PUBLIC_DIR, safePath.replace(/^\/+/, ''))
  let ext = extname(filePath)

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('Forbidden')
    return
  }

  if (!existsSync(filePath) || !ext) {
    filePath = join(PUBLIC_DIR, 'index.html')
    ext = '.html'
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
    return
  }

  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': contentType })

  const stream = createReadStream(filePath)
  stream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  })
  stream.pipe(res)
}
