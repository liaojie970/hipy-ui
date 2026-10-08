jest.mock('@/store', () => ({
  __esModule: true,
  default: { dispatch: jest.fn(), getters: {}}
}))

import plugins from '@/plugins/index'

describe('plugins/index', () => {
  it('install 注册所有原型方法', () => {
    const Vue = { prototype: {}}
    plugins.install(Vue)
    expect(Vue.prototype.$tab).toBeDefined()
    expect(Vue.prototype.$auth).toBeDefined()
    expect(Vue.prototype.$cache).toBeDefined()
    expect(Vue.prototype.$modal).toBeDefined()
    expect(Vue.prototype.$download).toBeDefined()
  })
})
