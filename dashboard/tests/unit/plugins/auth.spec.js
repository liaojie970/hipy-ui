jest.mock('@/store', () => ({
  __esModule: true,
  default: { getters: {}}
}))

import store from '@/store'
import auth from '@/plugins/auth'

describe('plugins/auth', () => {
  beforeEach(() => {
    store.getters.permissions = []
    store.getters.roles = []
  })

  describe('权限', () => {
    it('拥有指定权限返回 true', () => {
      store.getters.permissions = ['system:user:list']
      expect(auth.hasPermi('system:user:list')).toBe(true)
    })

    it('通配权限 *:*:* 通过', () => {
      store.getters.permissions = ['*:*:*']
      expect(auth.hasPermi('any:thing:here')).toBe(true)
    })

    it('没有权限返回 false', () => {
      store.getters.permissions = ['system:user:list']
      expect(auth.hasPermi('system:role:list')).toBe(false)
    })

    it('空权限返回 false', () => {
      expect(auth.hasPermi('')).toBe(false)
      expect(auth.hasPermi(null)).toBe(false)
    })

    it('hasPermiOr 满足其一即可', () => {
      store.getters.permissions = ['a']
      expect(auth.hasPermiOr(['a', 'b'])).toBe(true)
      expect(auth.hasPermiOr(['b', 'c'])).toBe(false)
    })

    it('hasPermiAnd 必须全部满足', () => {
      store.getters.permissions = ['a', 'b']
      expect(auth.hasPermiAnd(['a', 'b'])).toBe(true)
      expect(auth.hasPermiAnd(['a', 'c'])).toBe(false)
    })
  })

  describe('角色', () => {
    it('拥有指定角色返回 true', () => {
      store.getters.roles = ['editor']
      expect(auth.hasRole('editor')).toBe(true)
    })

    it('超级管理员 admin 通过', () => {
      store.getters.roles = ['admin']
      expect(auth.hasRole('anything')).toBe(true)
    })

    it('没有角色返回 false', () => {
      store.getters.roles = ['editor']
      expect(auth.hasRole('other')).toBe(false)
    })

    it('空角色返回 false', () => {
      expect(auth.hasRole('')).toBe(false)
    })

    it('hasRoleOr / hasRoleAnd', () => {
      store.getters.roles = ['a', 'b']
      expect(auth.hasRoleOr(['a', 'z'])).toBe(true)
      expect(auth.hasRoleAnd(['a', 'b'])).toBe(true)
      expect(auth.hasRoleAnd(['a', 'z'])).toBe(false)
    })
  })
})
