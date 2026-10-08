jest.mock('element-ui/src/utils/resize-event', () => ({
  addResizeListener: jest.fn(),
  removeResizeListener: jest.fn()
}))

import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'
import adaptive from '@/directive/el-table/adaptive'

function makeVNode(over = {}) {
  return {
    componentInstance: {
      height: '100px',
      layout: { setHeight: jest.fn() },
      doLayout: jest.fn(),
      ...over
    }
  }
}

describe('directive/el-table/adaptive', () => {
  beforeEach(() => jest.clearAllMocks())

  it('bind 注册 resize 监听', () => {
    const el = document.createElement('div')
    const vnode = makeVNode()
    adaptive.bind(el, { value: {}}, vnode)
    expect(typeof el.resizeListener).toBe('function')
    expect(addResizeListener).toHaveBeenCalledWith(window.document.body, el.resizeListener)
  })

  it('inserted 根据可视高度设置表格高度', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ top: 100 })
    const vnode = makeVNode()
    adaptive.inserted(el, { value: { bottomOffset: 20 }}, vnode)
    const expected = window.innerHeight - 100 - 20
    expect(vnode.componentInstance.layout.setHeight).toHaveBeenCalledWith(expected)
    expect(vnode.componentInstance.doLayout).toHaveBeenCalled()
  })

  it('未设置 bottomOffset 时默认 30', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ top: 0 })
    const vnode = makeVNode()
    adaptive.inserted(el, { value: {}}, vnode)
    expect(vnode.componentInstance.layout.setHeight).toHaveBeenCalledWith(window.innerHeight - 30)
  })

  it('未设置 height 时抛出错误', () => {
    const el = document.createElement('div')
    const vnode = makeVNode({ height: '' })
    expect(() => adaptive.inserted(el, { value: {}}, vnode)).toThrow(/must set the height/)
  })

  it('unbind 移除 resize 监听', () => {
    const el = document.createElement('div')
    const vnode = makeVNode()
    adaptive.bind(el, { value: {}}, vnode)
    const listener = el.resizeListener
    adaptive.unbind(el)
    expect(removeResizeListener).toHaveBeenCalledWith(window.document.body, listener)
  })
})
