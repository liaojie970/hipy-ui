import settings from '@/store/modules/settings'
import defaultSettings from '@/settings'

describe('store/modules/settings', () => {
  it('初始 state 来自默认配置', () => {
    expect(settings.state.showSettings).toBe(defaultSettings.showSettings)
    expect(settings.state.tagsView).toBe(defaultSettings.tagsView)
    expect(settings.state.fixedHeader).toBe(defaultSettings.fixedHeader)
    expect(settings.state.sidebarLogo).toBe(defaultSettings.sidebarLogo)
  })

  it('CHANGE_SETTING 修改已存在的键', () => {
    const state = { showSettings: true, tagsView: true }
    settings.mutations.CHANGE_SETTING(state, { key: 'tagsView', value: false })
    expect(state.tagsView).toBe(false)
  })

  it('CHANGE_SETTING 忽略不存在的键', () => {
    const state = { showSettings: true }
    settings.mutations.CHANGE_SETTING(state, { key: 'notExist', value: 1 })
    expect(state.notExist).toBeUndefined()
  })

  it('changeSetting action 提交 CHANGE_SETTING', () => {
    const commit = jest.fn()
    const payload = { key: 'tagsView', value: false }
    settings.actions.changeSetting({ commit }, payload)
    expect(commit).toHaveBeenCalledWith('CHANGE_SETTING', payload)
  })
})
