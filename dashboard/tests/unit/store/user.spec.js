jest.mock('@/api/user', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getInfo: jest.fn(),
  getRouters: jest.fn()
}))
jest.mock('@/utils/auth', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn()
}))
jest.mock('@/router', () => ({
  __esModule: true,
  default: { addRoutes: jest.fn() },
  resetRouter: jest.fn()
}))
jest.mock('js-md5', () => ({ __esModule: true, default: jest.fn(p => 'md5-' + p) }))

import { login as loginApi, logout as logoutApi, getInfo as getInfoApi, getRouters as getRoutersApi } from '@/api/user'
import { setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import user from '@/store/modules/user'

const commit = () => jest.fn()

describe('store/modules/user', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('mutations', () => {
    it('基础 setter 正确赋值', () => {
      const state = { token: '', username: '', nickname: '', avatar: '', sex: undefined, phone: '', email: '', roles: [], roles_name: [], permissions: [] }
      user.mutations.SET_TOKEN(state, 't')
      user.mutations.SET_USERNAME(state, 'u')
      user.mutations.SET_NICKNAME(state, 'n')
      user.mutations.SET_EMAIL(state, 'e')
      user.mutations.SET_PHONE(state, 'p')
      user.mutations.SET_SEX(state, 1)
      user.mutations.SET_AVATAR(state, 'a')
      user.mutations.SET_ROLES(state, ['admin'])
      user.mutations.SET_ROLES_NAME(state, ['管理员'])
      user.mutations.SET_PERMISSIONS(state, ['*:*:*'])
      expect(state).toMatchObject({
        token: 't', username: 'u', nickname: 'n', email: 'e', phone: 'p', sex: 1,
        avatar: 'a', roles: ['admin'], roles_name: ['管理员'], permissions: ['*:*:*']
      })
    })
  })

  describe('login', () => {
    it('对密码做 md5 后调用接口并保存 token', async() => {
      loginApi.mockResolvedValue({ data: { token: 't1' }})
      const c = commit()
      const res = await user.actions.login({ commit: c }, { user: 'u', password: 'pwd', key: 'k', code: 'c' })
      expect(loginApi).toHaveBeenCalledWith({ user: 'u', password: 'md5-pwd', key: 'k', code: 'c' })
      expect(c).toHaveBeenCalledWith('SET_TOKEN', 't1')
      expect(setToken).toHaveBeenCalledWith('t1')
      expect(res).toEqual({ data: { token: 't1' }})
    })

    it('接口失败时 reject', async() => {
      loginApi.mockRejectedValue(new Error('boom'))
      await expect(user.actions.login({ commit: commit() }, { password: 'x' })).rejects.toThrow('boom')
    })
  })

  describe('getInfo', () => {
    const info = {
      roles: ['admin'], roles_name: ['管理员'], permissions: ['*:*:*'], nickname: 'n',
      avatar: 'a', username: 'u', email: 'e', phone: 'p', sex: 1
    }

    it('保存用户信息并 resolve', async() => {
      getInfoApi.mockResolvedValue({ data: info })
      const c = commit()
      const res = await user.actions.getInfo({ commit: c, state: { token: 't' }})
      expect(getInfoApi).toHaveBeenCalledWith('t')
      expect(c).toHaveBeenCalledWith('SET_ROLES', ['admin'])
      expect(c).toHaveBeenCalledWith('SET_PERMISSIONS', ['*:*:*'])
      expect(c).toHaveBeenCalledWith('SET_NICKNAME', 'n')
      expect(res).toEqual(info)
    })

    it('无数据时 reject', async() => {
      getInfoApi.mockResolvedValue({ data: null })
      await expect(user.actions.getInfo({ commit: commit(), state: {}})).rejects.toBe('Verification failed, please Login again.')
    })

    it('roles 为空数组时 reject', async() => {
      getInfoApi.mockResolvedValue({ data: { ...info, roles: [] }})
      await expect(user.actions.getInfo({ commit: commit(), state: {}})).rejects.toBe('getInfo: roles must be a non-null array!')
    })
  })

  describe('getAuthMenu', () => {
    it('返回菜单数据', async() => {
      getRoutersApi.mockResolvedValue({ data: { menus: [1, 2] }})
      const res = await user.actions.getAuthMenu({ commit: commit() })
      expect(res).toEqual({ menus: [1, 2] })
    })
  })

  describe('logout', () => {
    it('清空 token、角色、路由与标签页', async() => {
      logoutApi.mockResolvedValue({})
      const c = commit()
      const dispatch = jest.fn()
      await user.actions.logout({ commit: c, state: { token: 't' }, dispatch })
      expect(logoutApi).toHaveBeenCalledWith('t')
      expect(c).toHaveBeenCalledWith('SET_TOKEN', '')
      expect(c).toHaveBeenCalledWith('SET_ROLES', [])
      expect(removeToken).toHaveBeenCalled()
      expect(resetRouter).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith('tagsView/delAllViews', null, { root: true })
    })
  })

  describe('resetToken', () => {
    it('重置 token 与角色', async() => {
      const c = commit()
      await user.actions.resetToken({ commit: c })
      expect(c).toHaveBeenCalledWith('SET_TOKEN', '')
      expect(c).toHaveBeenCalledWith('SET_ROLES', [])
      expect(removeToken).toHaveBeenCalled()
    })
  })

  describe('changeRoles', () => {
    it('切换角色并动态注册路由', async() => {
      const c = commit()
      const dispatch = jest.fn(type => {
        if (type === 'getInfo') return Promise.resolve({ roles: ['admin'] })
        if (type === 'permission/generateRoutes') return Promise.resolve([{ path: '/x' }])
        return Promise.resolve()
      })
      await user.actions.changeRoles({ commit: c, dispatch }, 'admin')
      expect(setToken).toHaveBeenCalledWith('admin-token')
      expect(c).toHaveBeenCalledWith('SET_TOKEN', 'admin-token')
      expect(resetRouter).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith('permission/generateRoutes', ['admin'], { root: true })
      expect(router.addRoutes).toHaveBeenCalledWith([{ path: '/x' }])
    })
  })
})
