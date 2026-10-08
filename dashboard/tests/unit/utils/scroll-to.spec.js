describe('utils/scroll-to', () => {
  let scrollTo

  beforeEach(() => {
    // 禁用原生 requestAnimationFrame，强制走 setTimeout fallback，便于假定时器驱动
    jest.useFakeTimers()
    window.requestAnimationFrame = undefined
    window.webkitRequestAnimationFrame = undefined
    window.mozRequestAnimationFrame = undefined
    jest.resetModules()
    scrollTo = require('@/utils/scroll-to').scrollTo
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('Math.easeInOutQuad 边界与中点', () => {
    expect(Math.easeInOutQuad(0, 0, 100, 500)).toBe(0)
    expect(Math.easeInOutQuad(500, 0, 100, 500)).toBeCloseTo(100)
    expect(Math.easeInOutQuad(250, 0, 100, 500)).toBeCloseTo(50)
  })

  it('滚动到目标位置并触发回调', () => {
    const callback = jest.fn()
    scrollTo(100, 40, callback)
    jest.runAllTimers()
    expect(callback).toHaveBeenCalled()
    expect(document.documentElement.scrollTop).toBeCloseTo(100)
  })

  it('未传 duration 时使用默认 500ms', () => {
    const callback = jest.fn()
    scrollTo(50, undefined, callback)
    // 未到 500ms 时回调不应触发
    jest.advanceTimersByTime(300)
    expect(callback).not.toHaveBeenCalled()
    jest.runAllTimers()
    expect(callback).toHaveBeenCalled()
  })

  it('未传 callback 时动画仍可完成且不报错', () => {
    expect(() => {
      scrollTo(20, 40)
      jest.runAllTimers()
    }).not.toThrow()
  })
})
