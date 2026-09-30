import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { acquireMutation, releaseMutation } from '@/utils/dedupe'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

/**
 * 防重复提交：同一时间出现的“完全相同”的写入请求(双击确定键、回车重复触发、
 * 网络慢时反复点击等)只放行第一个，后续的直接丢弃并提示，避免重复下单/重复新增。
 * 具体实现见 @/utils/dedupe。
 */

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    const token = getToken()
    if (token && token !== '') {
      config.headers['Token'] = getToken()
    }

    // 防重复提交(实现见 @/utils/dedupe)
    const { duplicated } = acquireMutation(config)
    if (duplicated) {
      Message({
        message: '请求正在处理中，请勿重复提交',
        type: 'warning',
        duration: 2000
      })
      // 返回一个永不落定的 promise：既不重复发请求，也不触发调用方的 then/catch
      return new Promise(() => {})
    }

    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 请求结束后释放占位(成功传 response, 失败传 error, 两者都带 config)
const releaseKey = releaseMutation

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    releaseKey(response)
    const res = response.data
    // console.log(res);

    // 二进制数据则直接返回
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      return response
    }
    if (response.request.responseType === 'text') {
      return response.request.responseText
    }
    if (response.request.responseType === 'json') {
      return res
    }
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 0) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }

      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    releaseKey(error)
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
