/**
 * 防重复提交 - 与 axios 拦截器的集成测试。
 *
 * 说明: @/store 里用了 webpack 专有的 require.context, jest 下无法直接加载,
 *       这里用 factory mock 掉(本用例也不关心 store)。
 */
jest.mock('@/store', () => ({ default: { dispatch: jest.fn() }}))

import request from '@/utils/request'
import { resetPendingMutations } from '@/utils/dedupe'

describe('utils/request 防重复提交(集成)', () => {
  let calls

  const okResponse = config => ({
    data: { code: 0, msg: 'ok', data: 1 },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: { responseType: '' }
  })

  const flush = () => new Promise(resolve => setTimeout(resolve, 20))

  beforeEach(() => {
    resetPendingMutations()
    calls = []
    request.defaults.adapter = config => {
      calls.push(config)
      return new Promise(resolve => {
        setTimeout(() => resolve(okResponse(config)), 5)
      })
    }
  })

  it('并发两次完全相同的 POST 只会真正发出一次', async() => {
    const first = request.post('/curated/media', { a: 1 })
    request.post('/curated/media', { a: 1 }) // 被拦截, 返回永不落定的 promise

    await first
    await flush()

    expect(calls.length).toBe(1)
  })

  it('前一个请求结束后可以再次提交(占位已释放)', async() => {
    await request.post('/curated/media', { a: 1 })
    await request.post('/curated/media', { a: 1 })

    expect(calls.length).toBe(2)
  })

  it('body 不同的写请求互不影响', async() => {
    await Promise.all([
      request.post('/curated/media', { a: 1 }),
      request.post('/curated/media', { a: 2 })
    ])

    expect(calls.length).toBe(2)
  })

  it('并发 GET 不会被去重', async() => {
    await Promise.all([
      request.get('/curated/media'),
      request.get('/curated/media')
    ])

    expect(calls.length).toBe(2)
  })

  it('form-data 上传不会被误判为重复', async() => {
    await request.post('/upload', new FormData())
    await request.post('/upload', new FormData())

    expect(calls.length).toBe(2)
  })

  it('请求失败后占位会被释放', async() => {
    request.defaults.adapter = config => {
      calls.push(config)
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(Object.assign(new Error('boom'), { config })), 5)
      })
    }

    await expect(request.post('/curated/media', { a: 1 })).rejects.toBeTruthy()
    await flush()
    await expect(request.post('/curated/media', { a: 1 })).rejects.toBeTruthy()

    expect(calls.length).toBe(2)
  })
})
