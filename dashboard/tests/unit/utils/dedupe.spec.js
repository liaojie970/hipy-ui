import {
  mutationKey,
  acquireMutation,
  releaseMutation,
  isPending,
  resetPendingMutations
} from '@/utils/dedupe'

describe('utils/dedupe', () => {
  beforeEach(() => {
    resetPendingMutations()
  })

  describe('mutationKey', () => {
    it('幂等的查询方法不参与去重', () => {
      expect(mutationKey({ method: 'get', url: '/a' })).toBe('')
      expect(mutationKey({ method: 'GET', url: '/a' })).toBe('')
      expect(mutationKey({ method: 'head', url: '/a' })).toBe('')
      expect(mutationKey({ method: 'options', url: '/a' })).toBe('')
      expect(mutationKey({ url: '/a' })).toBe('') // 默认视为 get
      expect(mutationKey(null)).toBe('')
    })

    it('完全相同的写入请求产生相同键', () => {
      const a = mutationKey({ method: 'post', baseURL: '/api', url: '/curated/media', data: { a: 1 }})
      const b = mutationKey({ method: 'post', baseURL: '/api', url: '/curated/media', data: { a: 1 }})
      expect(a).not.toBe('')
      expect(a).toBe(b)
    })

    it('method / baseURL / url / params / data 任一不同则键不同', () => {
      const base = { method: 'post', baseURL: '/api', url: '/x', data: { a: 1 }}
      const key = mutationKey(base)
      expect(mutationKey({ ...base, method: 'put' })).not.toBe(key)
      expect(mutationKey({ ...base, baseURL: '/api2' })).not.toBe(key)
      expect(mutationKey({ ...base, url: '/y' })).not.toBe(key)
      expect(mutationKey({ ...base, params: { p: 1 }})).not.toBe(key)
      expect(mutationKey({ ...base, data: { a: 2 }})).not.toBe(key)
    })

    it('method 大小写不影响结果', () => {
      expect(mutationKey({ method: 'POST', url: '/x', data: 1 }))
        .toBe(mutationKey({ method: 'post', url: '/x', data: 1 }))
    })

    it('data 为空(null/undefined)时可正常得到键', () => {
      expect(mutationKey({ method: 'post', url: '/x' })).not.toBe('')
      expect(mutationKey({ method: 'post', url: '/x', data: null }))
        .toBe(mutationKey({ method: 'post', url: '/x', data: undefined }))
    })

    it('FormData / Blob / ArrayBuffer / URLSearchParams 跳过去重', () => {
      // 无法稳定序列化, 若参与去重会把“两个不同的上传”误判为重复
      expect(mutationKey({ method: 'post', url: '/x', data: new FormData() })).toBe('')
      expect(mutationKey({ method: 'post', url: '/x', data: new Blob(['a']) })).toBe('')
      expect(mutationKey({ method: 'post', url: '/x', data: new ArrayBuffer(8) })).toBe('')
      expect(mutationKey({ method: 'post', url: '/x', data: new URLSearchParams('a=1') })).toBe('')
    })

    it('数组载荷照常参与去重', () => {
      expect(mutationKey({ method: 'post', url: '/x', data: [1, 2] })).not.toBe('')
    })
  })

  describe('acquireMutation / releaseMutation', () => {
    const config = () => ({ method: 'post', baseURL: '/api', url: '/x', data: { a: 1 }})

    it('首次放行, 再次判定为重复', () => {
      const first = config()
      expect(acquireMutation(first)).toEqual({ key: expect.any(String), duplicated: false })
      expect(typeof first.__mutationKey).toBe('string') // 打上标记便于释放
      expect(acquireMutation(config()).duplicated).toBe(true)
    })

    it('请求成功结束后可再次提交', () => {
      const first = config()
      acquireMutation(first)
      releaseMutation({ config: first })
      expect(acquireMutation(config()).duplicated).toBe(false)
    })

    it('请求失败(error.config)同样释放', () => {
      const first = config()
      acquireMutation(first)
      releaseMutation({ message: 'boom', config: first })
      expect(acquireMutation(config()).duplicated).toBe(false)
    })

    it('重复请求不会叠加占位, 释放一次即彻底解锁', () => {
      const first = config()
      acquireMutation(first)
      expect(acquireMutation(config()).duplicated).toBe(true)
      releaseMutation({ config: first })
      expect(acquireMutation(config()).duplicated).toBe(false)
    })

    it('空/异常的 source 不会抛错', () => {
      expect(() => releaseMutation(undefined)).not.toThrow()
      expect(() => releaseMutation(null)).not.toThrow()
      expect(() => releaseMutation({})).not.toThrow()
      expect(() => releaseMutation({ config: {}})).not.toThrow()
    })

    it('查询请求不占用占位', () => {
      const query = { method: 'get', url: '/x' }
      expect(acquireMutation(query)).toEqual({ key: '', duplicated: false })
      expect(isPending(mutationKey(query))).toBe(false)
    })

    it('两次不同的上传不会被误判为重复', () => {
      expect(acquireMutation({ method: 'post', url: '/upload', data: new FormData() }).duplicated).toBe(false)
      expect(acquireMutation({ method: 'post', url: '/upload', data: new FormData() }).duplicated).toBe(false)
    })

    it('不同 url 的写入互不影响', () => {
      expect(acquireMutation(config()).duplicated).toBe(false)
      expect(acquireMutation({ method: 'post', url: '/y', data: { a: 1 }}).duplicated).toBe(false)
    })

    it('isPending / resetPendingMutations 可用', () => {
      const first = config()
      acquireMutation(first)
      expect(isPending(first.__mutationKey)).toBe(true)
      resetPendingMutations()
      expect(isPending(first.__mutationKey)).toBe(false)
    })
  })
})
