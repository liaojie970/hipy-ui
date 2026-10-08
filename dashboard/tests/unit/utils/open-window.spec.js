import openWindow from '@/utils/open-window'

describe('utils/open-window', () => {
  it('以居中位置打开新窗口并聚焦', () => {
    const focus = jest.fn()
    const originalOpen = window.open
    window.open = jest.fn(() => ({ focus }))
    openWindow('https://example.com', 'title', 800, 600)
    expect(window.open).toHaveBeenCalled()
    const [url, title, features] = window.open.mock.calls[0]
    expect(url).toBe('https://example.com')
    expect(title).toBe('title')
    expect(features).toContain('width=800')
    expect(features).toContain('height=600')
    expect(features).toContain('top=')
    expect(features).toContain('left=')
    expect(focus).toHaveBeenCalled()
    window.open = originalOpen
  })

  it('window.focus 不可用时跳过聚焦且不报错', () => {
    const originalOpen = window.open
    const originalFocus = window.focus
    window.open = jest.fn(() => ({}))
    window.focus = undefined
    expect(() => openWindow('https://example.com', 't', 100, 100)).not.toThrow()
    window.open = originalOpen
    window.focus = originalFocus
  })
})
