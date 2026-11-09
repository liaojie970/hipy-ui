/**
 * 手机端 el-table 卡片化
 * -----------------------------------------------------------------------------
 * 问题：后端管理页的表格普遍 6~12 列，桌面端依赖横向滚动；在 390px 宽的手机上
 *      表格内容动辄 1000~2700px，用户要左右滑三四屏才能看完一条记录，
 *      而且滑到右边就看不到左边的标题了（表头已滚出视野）。
 *
 * 做法：只在窄屏（<= 992px，与 layout/mixin/ResizeHandler.js 的断点一致）时，
 *      给 el-table 挂上 `m-card-table` 类，并把每个 td 对应的表头文字写进
 *      `data-label` 属性；样式层（styles/mobile.scss）据此把每行重排成一张
 *      「字段名 + 值」的竖排卡片，一屏就能看完整条记录。
 *
 * 为什么不逐页改模板：全站 31 个 el-table / 28 个页面，逐页写移动端模板维护
 *      成本极高且容易和桌面端逻辑漂移。这里只在 DOM 层加一个属性，不碰业务。
 *
 * 逃生舱：给任意 el-table 加 `class-name` / `class` 里含 `no-card`
 *      （如 <el-table class="no-card">）即可让该表保持桌面样式。
 */
const CARD_CLASS = 'm-card-table'
const LABEL_ATTR = 'data-label'
const SHORT_ATTR = 'data-short'
const BREAKPOINT = 992
const SKIP_CLASS = 'no-card'

let observer = null
let scheduled = false

function isNarrow() {
  return window.innerWidth <= BREAKPOINT
}

function shouldSkip(table) {
  return table.classList.contains(SKIP_CLASS) ||
    !!table.closest('.no-card')
}

/** 取表头文字（按列顺序），选择列/展开列没有文字，留空以便隐藏标签 */
function readHeaders(table) {
  let ths = table.querySelectorAll('.el-table__header-wrapper thead th')
  if (!ths.length) ths = table.querySelectorAll('thead th')
  return Array.prototype.map.call(ths, function(th) {
    return (th.textContent || '').replace(/\s+/g, ' ').trim()
  })
}

/**
 * 判断这个单元格能不能只占半行。
 * 表格里经常有「是否显示 / 可搜索 / 排序号」这类短值，一条一行太浪费屏；
 * 半宽并排能把 12 列的卡片高度从 490px 压到 300px 左右。
 */
function isShortCell(td) {
  const cell = td.querySelector('.cell')
  if (!cell) return false
  if (cell.querySelector('.el-switch, .el-checkbox, .el-radio')) return true
  const text = (cell.textContent || '').replace(/\s+/g, '')
  if (!text) return false
  if (cell.querySelector('.el-tag, .el-button, img')) return text.length <= 8
  return text.length <= 6
}

function decorate(table) {
  if (shouldSkip(table) || !isNarrow()) {
    table.classList.remove(CARD_CLASS)
    Array.prototype.forEach.call(table.querySelectorAll('td[' + LABEL_ATTR + ']'), function(td) {
      td.removeAttribute(LABEL_ATTR)
      td.removeAttribute(SHORT_ATTR)
    })
    return
  }

  const labels = readHeaders(table)
  table.classList.add(CARD_CLASS)

  const wrapper = table.querySelector('.el-table__body-wrapper')
  if (!wrapper) return

  // 只处理主表 body：fixed 层在卡片模式下被 CSS 隐藏，不必重复处理
  const rows = wrapper.querySelectorAll('tbody > tr')
  Array.prototype.forEach.call(rows, function(tr) {
    const tds = Array.prototype.filter.call(tr.children, function(n) {
      return n.tagName === 'TD'
    })
    tds.forEach(function(td, i) {
      const label = labels[i] == null ? '' : labels[i]
      if (td.getAttribute(LABEL_ATTR) !== label) {
        td.setAttribute(LABEL_ATTR, label)
      }
      // 短值标记成半宽，样式层据此两列并排
      const short = isShortCell(td) ? '1' : '0'
      if (td.getAttribute(SHORT_ATTR) !== short) {
        td.setAttribute(SHORT_ATTR, short)
      }
    })
  })
}

function scan() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(function() {
    scheduled = false
    const tables = document.querySelectorAll('.el-table')
    Array.prototype.forEach.call(tables, decorate)
  })
}

/**
 * 安装全局监听：表格重渲染（翻页、查询、行增删）后自动补 data-label。
 * 只监听 childList/attributes 里的 class 变化，不会因为自己写 data-label 而循环。
 */
export function installMobileTable() {
  if (observer) return
  if (typeof window === 'undefined' || !window.MutationObserver) return

  observer = new MutationObserver(function(mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i]
      // 自己写 data-label / data-short 引起的变化直接忽略，避免无谓重扫
      if (m.type === 'attributes' && (m.attributeName === LABEL_ATTR || m.attributeName === SHORT_ATTR)) continue
      scan()
      return
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  })
  window.addEventListener('resize', scan)
  window.addEventListener('orientationchange', scan)
  scan()
}

export default installMobileTable
