/**
 * @/utils/index.js 中除 parseTime/formatTime/param2Obj 之外的通用函数测试
 * (parseTime/formatTime/param2Obj 已有单独测试文件)
 */
import {
  getQueryObject,
  byteLength,
  cleanArray,
  param,
  cleanQuery,
  html2Text,
  objectMerge,
  toggleClass,
  getTime,
  debounce,
  deepClone,
  uniqueArr,
  createUniqueString,
  hasClass,
  addClass,
  removeClass,
  makeMap,
  titleCase,
  camelCase,
  isNumberStr,
  getFormatTime,
  parseTime
} from '@/utils/index'

describe('utils/index 通用函数', () => {
  describe('getQueryObject', () => {
    it('解析 url query', () => {
      expect(getQueryObject('http://a.com?name=bill&age=29')).toEqual({ name: 'bill', age: '29' })
    })

    it('解码转义字符', () => {
      expect(getQueryObject('http://a.com?key=%E6%B5%8B%E8%AF%95')).toEqual({ key: '测试' })
    })
  })

  describe('byteLength', () => {
    it('ASCII 与中文按 utf8 计算', () => {
      expect(byteLength('abc')).toBe(3)
      expect(byteLength('中')).toBe(3)
      expect(byteLength('é')).toBe(2) // 2 字节字符
    })
  })

  describe('cleanArray', () => {
    it('过滤 falsy 值', () => {
      expect(cleanArray([1, '', null, 0, false, undefined, 'a'])).toEqual([1, 'a'])
    })
  })

  describe('param', () => {
    it('序列化对象', () => {
      expect(param({ a: 1, b: 'x y' })).toBe('a=1&b=x%20y')
    })

    it('忽略 undefined', () => {
      expect(param({ a: undefined, b: 2 })).toBe('b=2')
    })

    it('空对象或 null 返回空串', () => {
      expect(param(null)).toBe('')
    })
  })

  describe('cleanQuery', () => {
    it('剔除空串/null/undefined, 保留 0 与 false', () => {
      const result = cleanQuery({ a: '', b: null, c: undefined, d: 0, e: false, f: 'x' })
      expect(result).toEqual({ d: 0, e: false, f: 'x' })
    })

    it('空入参返回空对象', () => {
      expect(cleanQuery()).toEqual({})
    })
  })

  describe('html2Text', () => {
    it('提取纯文本', () => {
      expect(html2Text('<div>hello <b>world</b></div>')).toBe('hello world')
    })
  })

  describe('objectMerge', () => {
    it('合并两个对象, 后者覆盖前者', () => {
      expect(objectMerge({ a: 1, b: 1 }, { b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('递归合并嵌套对象', () => {
      expect(objectMerge({ a: { x: 1 }}, { a: { y: 2 }})).toEqual({ a: { x: 1, y: 2 }})
    })

    it('source 为数组时返回浅拷贝', () => {
      const src = [1, 2]
      const merged = objectMerge({}, src)
      expect(merged).toEqual([1, 2])
      expect(merged).not.toBe(src)
    })

    it('target 非对象时重置为对象', () => {
      expect(objectMerge('x', { a: 1 })).toEqual({ a: 1 })
    })
  })

  describe('toggleClass', () => {
    it('无则添加, 有则移除', () => {
      const el = document.createElement('div')
      el.className = 'base'
      toggleClass(el, 'active')
      expect(el.className).toContain('active')
      toggleClass(el, 'active')
      expect(el.className).not.toContain('active')
    })

    it('元素或类名为空时安全返回', () => {
      expect(() => toggleClass(null, 'x')).not.toThrow()
      const el = document.createElement('div')
      expect(() => toggleClass(el, '')).not.toThrow()
    })
  })

  describe('getTime', () => {
    it('start 返回 90 天前的毫秒时间戳', () => {
      const now = Date.now()
      const start = getTime('start')
      expect(typeof start).toBe('number')
      expect(now - start).toBeGreaterThanOrEqual(90 * 24 * 3600 * 1000 - 1000)
    })

    it('非 start 返回当天 0 点的 Date', () => {
      const date = getTime()
      expect(date).toBeInstanceOf(Date)
      expect(date.getHours()).toBe(0)
      expect(date.getMinutes()).toBe(0)
    })
  })

  describe('debounce', () => {
    // 说明: 该 debounce 内部用 `+new Date()` 判断时间间隔, 而 jest23 的 legacy
    // fake timers 不会 mock Date, 因此这里使用真实定时器验证去抖行为。
    it('连续调用只在停止后执行一次(尾部)', done => {
      const fn = jest.fn()
      const debounced = debounce(fn, 20)
      debounced(1)
      debounced(2)
      expect(fn).not.toHaveBeenCalled()
      setTimeout(() => {
        expect(fn).toHaveBeenCalledTimes(1)
        done()
      }, 100)
    })

    it('immediate 模式首次立即执行', () => {
      const fn = jest.fn()
      const debounced = debounce(fn, 200, true)
      debounced('a')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('a')
    })
  })

  describe('deepClone', () => {
    it('深拷贝嵌套对象', () => {
      const src = { a: 1, b: { c: [1, 2] }}
      const clone = deepClone(src)
      expect(clone).toEqual(src)
      expect(clone.b).not.toBe(src.b)
      expect(clone.b.c).not.toBe(src.b.c)
    })

    it('深拷贝数组', () => {
      const src = [{ a: 1 }]
      const clone = deepClone(src)
      expect(clone).toEqual(src)
      expect(clone[0]).not.toBe(src[0])
    })
  })

  describe('uniqueArr', () => {
    it('数组去重', () => {
      expect(uniqueArr([1, 1, 2, 3, 3])).toEqual([1, 2, 3])
    })
  })

  describe('createUniqueString', () => {
    it('返回非空且大概率唯一的字符串', () => {
      const a = createUniqueString()
      const b = createUniqueString()
      expect(typeof a).toBe('string')
      expect(a.length).toBeGreaterThan(0)
      expect(a).not.toBe(b)
    })
  })

  describe('hasClass / addClass / removeClass', () => {
    it('类名判断与增删', () => {
      const el = document.createElement('div')
      el.className = 'a'
      expect(hasClass(el, 'a')).toBe(true)
      expect(hasClass(el, 'b')).toBe(false)

      addClass(el, 'b')
      expect(hasClass(el, 'b')).toBe(true)
      addClass(el, 'b') // 重复添加不叠加
      expect(el.className.match(/b/g)).toHaveLength(1)

      removeClass(el, 'b')
      expect(hasClass(el, 'b')).toBe(false)
    })
  })

  describe('makeMap', () => {
    it('生成查表函数', () => {
      const map = makeMap('a,b,c')
      expect(map('a')).toBe(true)
      expect(map('d')).toBeFalsy()
    })

    it('expectsLowerCase 会先小写查询键(表中键需为小写)', () => {
      const map = makeMap('a,b', true)
      expect(map('A')).toBe(true)
      expect(map('a')).toBe(true)
      expect(map('C')).toBeFalsy()
      // 表中键为大写时, 小写查询会落空(源码如此)
      expect(makeMap('A,B', true)('a')).toBeFalsy()
    })
  })

  describe('titleCase / camelCase', () => {
    it('首字母大写', () => {
      expect(titleCase('hello world')).toBe('Hello World')
    })

    it('下划线转驼峰', () => {
      expect(camelCase('a_b_c')).toBe('aBC')
    })
  })

  describe('isNumberStr', () => {
    it('数字字符串判定', () => {
      expect(isNumberStr('123')).toBe(true)
      expect(isNumberStr('-1.5')).toBe(true)
      expect(isNumberStr('+2')).toBe(true)
      expect(isNumberStr('abc')).toBe(false)
      expect(isNumberStr('12a')).toBe(false)
    })
  })

  describe('getFormatTime', () => {
    it('null 返回空串', () => {
      expect(getFormatTime(null)).toBe('')
    })

    it('按本地时间格式化(秒级时间戳)', () => {
      const ts = Math.floor(new Date(2020, 0, 2, 3, 4, 5).getTime() / 1000)
      expect(getFormatTime(ts)).toBe('2020-01-02')
      expect(getFormatTime(ts, true)).toBe('2020-01-02 03:04:05')
    })
  })

  describe('parseTime(补充分支)', () => {
    it('字符串数字视为时间戳', () => {
      const d = new Date('2018-07-13 17:54:01')
      expect(parseTime(String(d.getTime()))).toBe('2018-07-13 17:54:01')
    })
  })
})
