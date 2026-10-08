jest.mock('@/store', () => ({
  __esModule: true,
  default: { getters: { roles: [] }}
}))

import store from '@/store'
import permission from '@/directive/permission/permission'

function attached() {
  const parent = document.createElement('div')
  const el = document.createElement('span')
  parent.appendChild(el)
  return { parent, el }
}

describe('directive/permission', () => {
  beforeEach(() => {
    store.getters.roles = []
  })

  it('角色匹配时不移除元素', () => {
    store.getters.roles = ['admin']
    const { parent, el } = attached()
    permission.inserted(el, { value: ['admin', 'editor'] })
    expect(parent.contains(el)).toBe(true)
  })

  it('角色不匹配时移除元素', () => {
    store.getters.roles = ['visitor']
    const { parent, el } = attached()
    permission.inserted(el, { value: ['admin'] })
    expect(parent.contains(el)).toBe(false)
  })

  it('update 同样执行校验并移除', () => {
    store.getters.roles = ['visitor']
    const { parent, el } = attached()
    permission.update(el, { value: ['admin'] })
    expect(parent.contains(el)).toBe(false)
  })

  it('空数组不做处理', () => {
    const { parent, el } = attached()
    permission.inserted(el, { value: [] })
    expect(parent.contains(el)).toBe(true)
  })

  it('非数组值抛出错误', () => {
    const { el } = attached()
    expect(() => permission.inserted(el, { value: 'admin' })).toThrow(/need roles/)
  })
})
