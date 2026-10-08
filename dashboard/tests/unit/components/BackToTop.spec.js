import { shallowMount } from '@vue/test-utils'
import BackToTop from '@/components/BackToTop/index.vue'

describe('components/BackToTop', () => {
  let scrollTo

  beforeEach(() => {
    scrollTo = jest.fn()
    window.scrollTo = scrollTo
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true, configurable: true })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('handleScroll 根据 pageYOffset 控制可见性', () => {
    const wrapper = shallowMount(BackToTop, { propsData: { visibilityHeight: 400 }})
    window.pageYOffset = 100
    wrapper.vm.handleScroll()
    expect(wrapper.vm.visible).toBe(false)
    window.pageYOffset = 500
    wrapper.vm.handleScroll()
    expect(wrapper.vm.visible).toBe(true)
  })

  it('默认不可见', () => {
    const wrapper = shallowMount(BackToTop)
    expect(wrapper.vm.visible).toBe(false)
  })

  it('easeInOutQuad 边界值', () => {
    const wrapper = shallowMount(BackToTop)
    expect(wrapper.vm.easeInOutQuad(0, 0, 100, 500)).toBe(0)
    expect(wrapper.vm.easeInOutQuad(500, 0, 100, 500)).toBeCloseTo(100)
  })

  it('backToTop 在回到顶部后停止动画', () => {
    window.pageYOffset = 0
    const wrapper = shallowMount(BackToTop, { propsData: { backPosition: 0 }})
    wrapper.vm.backToTop()
    expect(wrapper.vm.isMoving).toBe(true)
    jest.advanceTimersByTime(20)
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    expect(wrapper.vm.isMoving).toBe(false)
  })

  it('动画进行中重复点击被忽略', () => {
    window.pageYOffset = 0
    const wrapper = shallowMount(BackToTop)
    wrapper.vm.isMoving = true
    wrapper.vm.backToTop()
    expect(wrapper.vm.interval).toBeNull()
  })
})
