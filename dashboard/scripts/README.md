# 移动端适配的验证脚本

这两个脚本只用于**开发期人工验证**，不参与构建，也不进生产包。

## 依赖

```bash
npm i -D playwright --no-save
```

若本机已装的 playwright 与缓存里的 chromium 版本不匹配，用 `CHROME_EXE` 指向任意可用的
Chromium 可执行文件即可（Playwright 默认会找自己期望的版本号）。

## mobile-audit.js —— 全站移动端体检

自动登录后遍历侧边栏全部菜单，逐页量化三件事：

- **横向溢出**：`document.scrollWidth - innerWidth`，任何一页 > 0 都说明有元素顶出屏幕；
- **点不到的元素**：宽或高 < 32px 的 `input/button/a/.el-button/.el-checkbox/.el-switch/.el-select`；
- **表格**：容器宽 vs 内容宽。卡片化生效后两者应该相等（不需要横向滚动）。

```bash
# 指向 dev server 或任意预览地址
MSYS_NO_PATHCONV=1 \
UI_BASE="http://127.0.0.1:8080" \
CHROME_EXE="J:/Develop/Users/LJ/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe" \
node scripts/mobile-audit.js
```

改造后的期望值：28 个菜单页**全部** 横向溢出 0、小目标 0（`/vod/web/category` 是前端模板预览页，
里面的 footer 链接属于被预览的页面本身，可以忽略），表格全部 `容器 == 内容`。

## mobile-preview.js —— 本地预览构建产物

`npm run build:prod` 出的是纯静态包，直接用 `file://` 打开会因为没有 `/api` 而白屏。
这个脚本静态服务 `dist/` 并把后端接口反代过去，用来在手机上验证**生产包**：

```bash
npm run build:prod
BACK="http://192.168.1.101:5707" PORT=8091 node scripts/mobile-preview.js
# 手机访问 http://<你的电脑 IP>:8091
```

## 注意

- Git Bash 下 `UI_BASE` 若含路径会被误转成 Windows 路径，务必带 `MSYS_NO_PATHCONV=1`；
- 脚本默认用 iPhone 12 视口（390x664），即 `styles/mobile.scss` 的断点内；
- 桌面端跑这两个脚本看到的是桌面布局，属于预期行为（卡片化只在 ≤992px 生效）。
