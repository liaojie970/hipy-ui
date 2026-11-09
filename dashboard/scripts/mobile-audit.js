// 遍历侧边栏全部菜单，对每个页面做移动端审计，抓出真正有问题的页
const { chromium, devices } = require('playwright')
const BASE = process.env.UI_BASE || 'http://127.0.0.1:8091'
const CH = process.env.CHROME_EXE

;(async () => {
  const b = await chromium.launch({ executablePath: CH })
  const c = await b.newContext({ ...devices['iPhone 12'] })
  const p = await c.newPage()
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await p.fill('input[placeholder="用户名/邮箱"]', 'admin')
  await p.fill('input[placeholder="密码"]', '123456')
  await p.click('button:has-text("登 录"), button:has-text("登录")')
  await p.waitForTimeout(3500)

  // 展开所有菜单收集链接
  const links = new Set()
  await p.click('#hamburger-container')
  await p.waitForTimeout(600)
  for (let i = 0; i < 3; i++) {
    const subs = p.locator('.sidebar-container .el-submenu__title')
    const n = await subs.count()
    for (let j = 0; j < n; j++) {
      try { await subs.nth(j).click({ timeout: 1500 }); await p.waitForTimeout(200) } catch (e) {}
    }
    await p.waitForTimeout(300)
  }
  const hrefs = await p.evaluate(() =>
    [...document.querySelectorAll('.sidebar-container a')].map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/') && h !== '/'))
  hrefs.forEach(h => links.add(h))
  console.log('菜单项 ' + links.size + ' 个')

  const rows = []
  for (const r of [...links]) {
    try {
      await p.goto(BASE + r, { waitUntil: 'networkidle', timeout: 45000 })
      await p.waitForTimeout(900)
      const res = await p.evaluate(() => {
        const vw = innerWidth
        const doc = document.documentElement
        let small = 0, smallSample = []
        document.querySelectorAll('input,button,a,.el-button,.el-checkbox,.el-switch,.el-select').forEach(el => {
          const b = el.getBoundingClientRect()
          if (!b.width || !b.height) return
          if (b.height >= 32 && b.width >= 32) return
          small++
          if (smallSample.length < 3) smallSample.push((el.className || el.tagName).toString().slice(0, 30) + ` ${Math.round(b.width)}x${Math.round(b.height)}`)
        })
        const tbl = [...document.querySelectorAll('.el-table')].map(t => {
          const body = t.querySelector('.el-table__body-wrapper')
          return { w: Math.round(t.getBoundingClientRect().width), cw: body ? Math.round(body.scrollWidth) : 0 }
        })
        return {
          path: location.pathname,
          overflow: Math.max(doc.scrollWidth, document.body.scrollWidth) - vw,
          small, smallSample, tbl,
          rows: document.querySelectorAll('.el-table__row').length,
          isLogin: location.pathname === '/login'
        }
      })
      rows.push(res)
    } catch (e) { rows.push({ path: r, error: e.message.slice(0, 60) }) }
  }
  console.log('\n路径'.padEnd(34) + '溢出'.padEnd(7) + '小目标'.padEnd(8) + '表格(容器/内容)')
  rows.forEach(r => {
    if (r.error) return console.log((r.path + ' ERR ' + r.error).slice(0, 100))
    const t = r.tbl.length ? r.tbl.map(x => `${x.w}/${x.cw}`).join(' ') : '-'
    console.log(r.path.padEnd(34) + String(r.overflow).padEnd(7) + String(r.small).padEnd(8) + t + (r.isLogin ? '  << 跳到登录页!' : ''))
    if (r.small > 8) console.log('      样例: ' + r.smallSample.join(' | '))
  })
  await b.close()
})()
