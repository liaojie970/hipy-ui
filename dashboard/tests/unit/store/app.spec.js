import Cookies from 'js-cookie'
import app from '@/store/modules/app'

const freshState = () => ({
  sidebar: { opened: true, withoutAnimation: false },
  device: 'desktop',
  size: 'medium'
})

describe('store/modules/app', () => {
  beforeEach(() => {
    Cookies.remove('sidebarStatus')
    Cookies.remove('size')
  })

  describe('mutations', () => {
    it('TOGGLE_SIDEBAR 切换并写入 cookie', () => {
      const state = freshState()
      app.mutations.TOGGLE_SIDEBAR(state)
      expect(state.sidebar.opened).toBe(false)
      expect(state.sidebar.withoutAnimation).toBe(false)
      expect(Cookies.get('sidebarStatus')).toBe('0')

      app.mutations.TOGGLE_SIDEBAR(state)
      expect(state.sidebar.opened).toBe(true)
      expect(Cookies.get('sidebarStatus')).toBe('1')
    })

    it('CLOSE_SIDEBAR 关闭并记录动画标记', () => {
      const state = freshState()
      app.mutations.CLOSE_SIDEBAR(state, true)
      expect(state.sidebar.opened).toBe(false)
      expect(state.sidebar.withoutAnimation).toBe(true)
      expect(Cookies.get('sidebarStatus')).toBe('0')
    })

    it('TOGGLE_DEVICE 设置设备类型', () => {
      const state = freshState()
      app.mutations.TOGGLE_DEVICE(state, 'mobile')
      expect(state.device).toBe('mobile')
    })

    it('SET_SIZE 设置尺寸并写入 cookie', () => {
      const state = freshState()
      app.mutations.SET_SIZE(state, 'small')
      expect(state.size).toBe('small')
      expect(Cookies.get('size')).toBe('small')
    })
  })

  describe('actions', () => {
    it('toggleSideBar 提交 TOGGLE_SIDEBAR', () => {
      const commit = jest.fn()
      app.actions.toggleSideBar({ commit })
      expect(commit).toHaveBeenCalledWith('TOGGLE_SIDEBAR')
    })

    it('closeSideBar 提交 CLOSE_SIDEBAR 并透传参数', () => {
      const commit = jest.fn()
      app.actions.closeSideBar({ commit }, { withoutAnimation: true })
      expect(commit).toHaveBeenCalledWith('CLOSE_SIDEBAR', true)
    })

    it('toggleDevice 提交 TOGGLE_DEVICE', () => {
      const commit = jest.fn()
      app.actions.toggleDevice({ commit }, 'mobile')
      expect(commit).toHaveBeenCalledWith('TOGGLE_DEVICE', 'mobile')
    })

    it('setSize 提交 SET_SIZE', () => {
      const commit = jest.fn()
      app.actions.setSize({ commit }, 'mini')
      expect(commit).toHaveBeenCalledWith('SET_SIZE', 'mini')
    })
  })
})
