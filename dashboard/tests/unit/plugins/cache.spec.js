import cache from '@/plugins/cache'

describe('plugins/cache', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  describe('session 会话缓存', () => {
    it('set / get', () => {
      cache.session.set('k', 'v')
      expect(cache.session.get('k')).toBe('v')
    })

    it('setJSON / getJSON', () => {
      cache.session.setJSON('obj', { a: 1, b: [2, 3] })
      expect(cache.session.getJSON('obj')).toEqual({ a: 1, b: [2, 3] })
    })

    it('null 值不写入', () => {
      cache.session.set('n', null)
      expect(cache.session.get('n')).toBeNull()
    })

    it('getJSON 无值时返回 undefined', () => {
      expect(cache.session.getJSON('missing')).toBeUndefined()
    })

    it('remove 删除键', () => {
      cache.session.set('k', 'v')
      cache.session.remove('k')
      expect(cache.session.get('k')).toBeNull()
    })
  })

  describe('local 本地缓存', () => {
    it('set / get', () => {
      cache.local.set('k', 'v')
      expect(cache.local.get('k')).toBe('v')
    })

    it('setJSON / getJSON', () => {
      cache.local.setJSON('arr', [1, 2])
      expect(cache.local.getJSON('arr')).toEqual([1, 2])
    })

    it('key 为 null 时不写入', () => {
      cache.local.set(null, 'v')
      expect(cache.local.get(null)).toBeNull()
    })

    it('remove 删除键', () => {
      cache.local.set('k', 'v')
      cache.local.remove('k')
      expect(cache.local.get('k')).toBeNull()
    })
  })
})
