jest.mock('@/settings', () => ({ errorLog: 'test' }))
jest.mock('@/store', () => ({ __esModule: true, default: { dispatch: jest.fn(), getters: {} }}))

import Vue from 'vue'
import store from '@/store'
// 该模块在导入时（NODE_ENV=test 且 settings.errorLog='test'）会注册全局错误处理
import '@/utils/error-log'

describe('utils/error-log', () => {
  let originalHandler

  beforeAll(() => {
    originalHandler = Vue.config.errorHandler
  })

  afterAll(() => {
    Vue.config.errorHandler = originalHandler
  })

  it('在匹配的环境下注册全局错误处理', () => {
    expect(typeof Vue.config.errorHandler).toBe('function')
  })

  it('捕获错误后通过 store 派发日志', done => {
    const err = new Error('boom')
    Vue.config.errorHandler(err, { $el: null }, 'render')
    Vue.nextTick(() => {
      expect(store.dispatch).toHaveBeenCalledWith('errorLog/addErrorLog', expect.objectContaining({
        err,
        info: 'render'
      }))
      done()
    })
  })
})
