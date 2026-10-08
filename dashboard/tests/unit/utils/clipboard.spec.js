jest.mock('clipboard', () => jest.fn())

import Vue from 'vue'
import Clipboard from 'clipboard'
import handleClipboard from '@/utils/clipboard'

describe('utils/clipboard', () => {
  let instance

  beforeEach(() => {
    jest.clearAllMocks()
    Vue.prototype.$message = jest.fn()
    instance = { on: jest.fn(), destroy: jest.fn(), onClick: jest.fn() }
    Clipboard.mockImplementation(() => instance)
  })

  it('创建 Clipboard 实例并绑定 text', () => {
    const event = { target: document.body }
    handleClipboard('hello', event)
    expect(Clipboard).toHaveBeenCalledWith(document.body, expect.objectContaining({ text: expect.any(Function) }))
    expect(Clipboard.mock.calls[0][1].text()).toBe('hello')
    expect(instance.onClick).toHaveBeenCalledWith(event)
  })

  it('success 回调提示成功并销毁实例', () => {
    handleClipboard('hello', { target: document.body })
    const handler = instance.on.mock.calls.find(c => c[0] === 'success')[1]
    handler()
    expect(Vue.prototype.$message).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    expect(instance.destroy).toHaveBeenCalled()
  })

  it('error 回调提示失败并销毁实例', () => {
    handleClipboard('hello', { target: document.body })
    const handler = instance.on.mock.calls.find(c => c[0] === 'error')[1]
    handler()
    expect(Vue.prototype.$message).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    expect(instance.destroy).toHaveBeenCalled()
  })
})
