jest.mock('@/store', () => ({
  __esModule: true,
  default: { getters: { roles: [] }}
}))

import store from '@/store'
import checkPermission from '@/utils/permission'

describe('utils/permission', () => {
  beforeEach(() => {
    store.getters.roles = []
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  it('角色匹配返回 true', () => {
    store.getters.roles = ['admin']
    expect(checkPermission(['admin', 'editor'])).toBe(true)
  })

  it('角色不匹配返回 false', () => {
    store.getters.roles = ['visitor']
    expect(checkPermission(['admin'])).toBe(false)
  })

  it('非法入参返回 false 并打印错误', () => {
    expect(checkPermission([])).toBe(false)
    expect(checkPermission('admin')).toBe(false)
    expect(console.error).toHaveBeenCalled()
  })
})
