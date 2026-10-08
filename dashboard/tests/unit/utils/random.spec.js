import { generateRandomDigit, generateRandomString } from '@/utils/random'

describe('utils/random', () => {
  describe('generateRandomDigit', () => {
    it('生成指定范围内的随机整数', () => {
      for (let i = 0; i < 100; i++) {
        const n = generateRandomDigit(2, 2)
        expect(n).toBeGreaterThanOrEqual(10)
        expect(n).toBeLessThanOrEqual(99)
        expect(Number.isInteger(n)).toBe(true)
      }
    })

    it('位数区间生效', () => {
      for (let i = 0; i < 50; i++) {
        const n = generateRandomDigit(1, 3)
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(999)
      }
    })
  })

  describe('generateRandomString', () => {
    it('长度正确', () => {
      expect(generateRandomString(0)).toBe('')
      expect(generateRandomString(8)).toHaveLength(8)
      expect(generateRandomString(32)).toHaveLength(32)
    })

    it('只包含字母与数字', () => {
      const str = generateRandomString(200)
      expect(str).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('多次调用通常不同', () => {
      expect(generateRandomString(16)).not.toBe(generateRandomString(16))
    })
  })
})
