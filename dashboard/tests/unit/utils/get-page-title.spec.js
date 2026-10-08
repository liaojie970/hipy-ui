import getPageTitle from '@/utils/get-page-title'
import defaultSettings from '@/settings'

describe('utils/get-page-title', () => {
  it('带页面标题时拼接站点标题', () => {
    expect(getPageTitle('登录')).toBe(`登录 - ${defaultSettings.title}`)
  })

  it('无页面标题时仅返回站点标题', () => {
    expect(getPageTitle()).toBe(defaultSettings.title)
    expect(getPageTitle('')).toBe(defaultSettings.title)
  })
})
