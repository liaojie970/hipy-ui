jest.mock('element-ui', () => ({
  Message: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  },
  MessageBox: {
    alert: jest.fn(),
    confirm: jest.fn(() => Promise.resolve()),
    prompt: jest.fn(() => Promise.resolve())
  },
  Notification: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  },
  Loading: {
    service: jest.fn(() => ({ close: jest.fn() }))
  }
}))

import { Message, MessageBox, Notification, Loading } from 'element-ui'
import modal from '@/plugins/modal'

describe('plugins/modal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('msg / msgError / msgSuccess / msgWarning', () => {
    modal.msg('a')
    modal.msgError('b')
    modal.msgSuccess('c')
    modal.msgWarning('d')
    expect(Message.info).toHaveBeenCalledWith('a')
    expect(Message.error).toHaveBeenCalledWith('b')
    expect(Message.success).toHaveBeenCalledWith('c')
    expect(Message.warning).toHaveBeenCalledWith('d')
  })

  it('alert 系列', () => {
    modal.alert('a')
    modal.alertError('b')
    modal.alertSuccess('c')
    modal.alertWarning('d')
    expect(MessageBox.alert).toHaveBeenNthCalledWith(1, 'a', '系统提示')
    expect(MessageBox.alert).toHaveBeenNthCalledWith(2, 'b', '系统提示', { type: 'error' })
    expect(MessageBox.alert).toHaveBeenNthCalledWith(3, 'c', '系统提示', { type: 'success' })
    expect(MessageBox.alert).toHaveBeenNthCalledWith(4, 'd', '系统提示', { type: 'warning' })
  })

  it('notify 系列', () => {
    modal.notify('a')
    modal.notifyError('b')
    modal.notifySuccess('c')
    modal.notifyWarning('d')
    expect(Notification.info).toHaveBeenCalledWith('a')
    expect(Notification.error).toHaveBeenCalledWith('b')
    expect(Notification.success).toHaveBeenCalledWith('c')
    expect(Notification.warning).toHaveBeenCalledWith('d')
  })

  it('confirm / prompt 返回 promise', () => {
    expect(modal.confirm('sure')).toBeInstanceOf(Promise)
    expect(MessageBox.confirm).toHaveBeenCalledWith('sure', '系统提示', expect.objectContaining({
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }))
    expect(modal.prompt('input')).toBeInstanceOf(Promise)
    expect(MessageBox.prompt).toHaveBeenCalled()
  })

  it('loading / closeLoading', () => {
    modal.loading('加载中')
    expect(Loading.service).toHaveBeenCalledWith(expect.objectContaining({ text: '加载中' }))
    expect(() => modal.closeLoading()).not.toThrow()
  })
})
