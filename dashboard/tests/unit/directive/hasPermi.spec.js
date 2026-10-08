jest.mock('@/store', () => ({
  __esModule: true,
  default: { getters: { permissions: [] }}
}))

import store from '@/store'
import hasPermi from '@/directive/button_permission/hasPermi'

function attached() {
  const parent = document.createElement('div')
  const el = document.createElement('span')
  parent.appendChild(el)
  return { parent, el }
}

describe('directive/button_permission/hasPermi', () => {
  beforeEach(() => {
    store.getters.permissions = []
  })

  it('拥有指定权限时保留元素', () => {
    store.getters.permissions = ['system:user:add']
    const { parent, el } = attached()
    hasPermi.inserted(el, { value: ['system:user:add'] })
    expect(parent.contains(el)).toBe(true)
  })

  it('通配权限 *:*:* 保留元素', () => {
    store.getters.permissions = ['*:*:*']
    const { parent, el } = attached()
    hasPermi.inserted(el, { value: ['system:user:add'] })
    expect(parent.contains(el)).toBe(true)
  })

  it('没有权限时移除元素', () => {
    store.getters.permissions = ['system:user:list']
    const { parent, el } = attached()
    hasPermi.inserted(el, { value: ['system:user:add'] })
    expect(parent.contains(el)).toBe(false)
  })

  it('未设置权限标签值时抛出错误', () => {
    const { el } = attached()
    expect(() => hasPermi.inserted(el, { value: [] })).toThrow(/操作权限/)
    const { el: el2 } = attached()
    expect(() => hasPermi.inserted(el2, { value: 'x' })).toThrow(/操作权限/)
  })
})
