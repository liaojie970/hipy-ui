jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn(() => Promise.resolve()) }))

import request from '@/utils/request'
import {
  login,
  getInfo,
  logout,
  register,
  verifyRegister,
  confirmRegister,
  forgetPassword,
  verifyForgetPwd,
  confirmForgetPwd,
  getRouters,
  changeAvatar,
  changeInfo,
  changePwd,
  getCaptchaCode
} from '@/api/user'

describe('api/user', () => {
  beforeEach(() => jest.clearAllMocks())

  it('login', () => {
    const data = { user: 'u', password: 'p' }
    login(data)
    expect(request).toHaveBeenCalledWith({ url: '/user/login', method: 'post', data })
  })

  it('getInfo', () => {
    getInfo()
    expect(request).toHaveBeenCalledWith({ url: '/user/info', method: 'get' })
  })

  it('logout', () => {
    logout()
    expect(request).toHaveBeenCalledWith({ url: '/user/logout', method: 'post' })
  })

  it('register', () => {
    const data = { user: 'u' }
    register(data)
    expect(request).toHaveBeenCalledWith({ url: '/user/register', method: 'post', data })
  })

  it('verifyRegister', () => {
    verifyRegister('abc')
    expect(request).toHaveBeenCalledWith({ url: '/user/register/abc', method: 'get' })
  })

  it('confirmRegister', () => {
    confirmRegister('abc')
    expect(request).toHaveBeenCalledWith({ url: '/user/register/abc', method: 'put' })
  })

  it('forgetPassword', () => {
    const data = { user: 'u' }
    forgetPassword(data)
    expect(request).toHaveBeenCalledWith({ url: '/user/forget-password', method: 'post', data })
  })

  it('verifyForgetPwd', () => {
    verifyForgetPwd('abc')
    expect(request).toHaveBeenCalledWith({ url: '/user/forget-password/abc', method: 'get' })
  })

  it('confirmForgetPwd', () => {
    const data = { password: 'p' }
    confirmForgetPwd('abc', data)
    expect(request).toHaveBeenCalledWith({ url: '/user/forget-password/abc', method: 'put', data })
  })

  it('getRouters', () => {
    getRouters()
    expect(request).toHaveBeenCalledWith({ url: '/user/routers', method: 'get' })
  })

  it('changeAvatar', () => {
    const data = { avatar: 'a' }
    changeAvatar(data)
    expect(request).toHaveBeenCalledWith({ url: '/user/avatar', method: 'post', data })
  })

  it('changeInfo', () => {
    const data = { nickname: 'n' }
    changeInfo(data)
    expect(request).toHaveBeenCalledWith({ url: '/user/info', method: 'put', data })
  })

  it('changePwd', () => {
    const data = { password: 'p' }
    changePwd(data)
    expect(request).toHaveBeenCalledWith({ url: '/user/password', method: 'put', data })
  })

  it('getCaptchaCode', () => {
    getCaptchaCode()
    expect(request).toHaveBeenCalledWith({ url: '/user/captcha-code', method: 'get' })
  })
})
