jest.mock('screenfull', () => ({
  enabled: true,
  isFullscreen: false,
  on: jest.fn(),
  off: jest.fn(),
  toggle: jest.fn()
}))

import { shallowMount } from '@vue/test-utils'
import screenfull from 'screenfull'
import Screenfull from '@/components/Screenfull/index.vue'

describe('components/Screenfull', () => {
  let $message

  beforeEach(() => {
    jest.clearAllMocks()
    screenfull.enabled = true
    screenfull.isFullscreen = false
    $message = jest.fn()
  })

  const mount = () => shallowMount(Screenfull, { mocks: { $message }})

  it('mounted 时注册 change 监听', () => {
    mount()
    expect(screenfull.on).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('可用时点击调用 toggle', () => {
    const wrapper = mount()
    wrapper.vm.click()
    expect(screenfull.toggle).toHaveBeenCalled()
    expect($message).not.toHaveBeenCalled()
  })

  it('不可用时弹出提示且不 toggle', () => {
    screenfull.enabled = false
    const wrapper = mount()
    wrapper.vm.click()
    expect($message).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }))
    expect(screenfull.toggle).not.toHaveBeenCalled()
  })

  it('change 同步全屏状态', () => {
    const wrapper = mount()
    screenfull.isFullscreen = true
    wrapper.vm.change()
    expect(wrapper.vm.isFullscreen).toBe(true)
  })

  it('beforeDestroy 注销监听', () => {
    const wrapper = mount()
    wrapper.destroy()
    expect(screenfull.off).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
