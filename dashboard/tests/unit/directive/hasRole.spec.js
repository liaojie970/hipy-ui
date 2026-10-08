jest.mock('@/store', () => ({
  __esModule: true,
  default: { getters: { roles: [] }}
}))

import store from '@/store'
import hasRole from '@/directive/button_permission/hasRole'

function attached() {
  const parent = document.createElement('div')
  const el = document.createElement('span')
  parent.appendChild(el)
  return { parent, el }
}

describe('directive/button_permission/hasRole', () => {
  beforeEach(() => {
    store.getters.roles = []
  })

  it('拥有指定角色时保留元素', () => {
    store.getters.roles = ['editor']
    const { parent, el } = attached()
    hasRole.inserted(el, { value: ['editor'] })
    expect(parent.contains(el)).toBe(true)
  })

  it('超级管理员 admin 保留元素', () => {
    store.getters.roles = ['admin']
    const { parent, el } = attached()
    hasRole.inserted(el, { value: ['anything'] })
    expect(parent.contains(el)).toBe(true)
  })

  it('没有角色时移除元素', () => {
    store.getters.roles = ['visitor']
    const { parent, el } = attached()
    hasRole.inserted(el, { value: ['editor'] })
    expect(parent.contains(el)).toBe(false)
  })

  it('未设置角色标签值时抛出错误', () => {
    const { el } = attached()
    expect(() => hasRole.inserted(el, { value: [] })).toThrow(/角色权限/)
  })
})
