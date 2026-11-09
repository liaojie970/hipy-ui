// 本地预览：静态服务 dist_mobile + 把 /api,/files,/config 等转到手机后端
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const ROOT = process.env.ROOT || path.join(__dirname, '..', 'dist')
const BACK = process.env.BACK || 'http://192.168.1.101:5707'
const PORT = +(process.env.PORT || 8090)
const MIME = { '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.map':'application/json' }
const PROXY_PREFIX = ['/api/', '/files/', '/config', '/version', '/database_update', '/media/', '/socket.io']
const backUrl = new URL(BACK)

http.createServer((req, res) => {
  if (PROXY_PREFIX.some(p => req.url.startsWith(p))) {
    const opts = {
      hostname: backUrl.hostname, port: backUrl.port || 80, path: req.url,
      method: req.method,
      headers: { ...req.headers, host: backUrl.host }
    }
    const pr = http.request(opts, pres => {
      res.writeHead(pres.statusCode, pres.headers)
      pres.pipe(res)
    })
    pr.on('error', e => { res.writeHead(502); res.end('proxy error: ' + e.message) })
    req.pipe(pr)
    return
  }
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html')
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('404') }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' })
    res.end(d)
  })
}).listen(PORT, () => console.log('预览 http://127.0.0.1:' + PORT + ' -> ' + BACK))
