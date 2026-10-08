import {
  timeAgo,
  numberFormatter,
  toThousandFilter,
  uppercaseFirst,
  parseTime,
  formatTime
} from '@/filters/index'

describe('filters/index', () => {
  describe('timeAgo', () => {
    const nowSec = () => Date.now() / 1000

    it('小于一小时显示分钟', () => {
      expect(timeAgo(nowSec() - 60)).toBe('1 minute')
      expect(timeAgo(nowSec() - 120)).toBe('2 minutes')
    })

    it('小于一天显示小时', () => {
      expect(timeAgo(nowSec() - 3600)).toBe('1 hour')
      expect(timeAgo(nowSec() - 7200)).toBe('2 hours')
    })

    it('超过一天显示天数', () => {
      expect(timeAgo(nowSec() - 86400)).toBe('1 day')
      expect(timeAgo(nowSec() - 172800)).toBe('2 days')
    })
  })

  describe('numberFormatter', () => {
    it('千/百万等单位缩写', () => {
      expect(numberFormatter(999, 0)).toBe('999')
      expect(numberFormatter(1000, 0)).toBe('1k')
      expect(numberFormatter(10000, 0)).toBe('10k')
      expect(numberFormatter(1000000, 0)).toBe('1M')
      expect(numberFormatter(1000000000, 0)).toBe('1G')
    })

    it('支持小数位', () => {
      expect(numberFormatter(1500, 1)).toBe('1.5k')
    })
  })

  describe('toThousandFilter', () => {
    it('千分位分隔', () => {
      expect(toThousandFilter(10000)).toBe('10,000')
      expect(toThousandFilter(1000000)).toBe('1,000,000')
      expect(toThousandFilter(-10000)).toBe('-10,000')
    })

    it('非法值按 0 处理', () => {
      expect(toThousandFilter('abc')).toBe('0')
    })
  })

  describe('uppercaseFirst', () => {
    it('首字母大写', () => {
      expect(uppercaseFirst('hello')).toBe('Hello')
      expect(uppercaseFirst('world')).toBe('World')
    })
  })

  it('re-export parseTime / formatTime', () => {
    const d = new Date('2018-07-13 17:54:01')
    expect(parseTime(d, '{y}-{m}-{d}')).toBe('2018-07-13')
    expect(typeof formatTime).toBe('function')
  })
})
