/**
 * @/utils/ruoyi.js 单元测试
 * 说明: ruoyi.js 顶部 import 了 @/utils/request, 而 request 又 import 了 @/store,
 *       store 中使用了 webpack 专有的 require.context, jest 下无法直接加载,
 *       这里用 factory mock 掉(本用例不关心 store)。
 */
jest.mock('@/store', () => ({ default: { dispatch: jest.fn() }}))

import {
  parseTime,
  resetForm,
  addDateRange,
  selectDictLabel,
  sprintf,
  praseStrEmpty,
  handleTree,
  blobValidate
} from '@/utils/ruoyi'

describe('utils/ruoyi', () => {
  describe('parseTime', () => {
    const d = new Date('2018-07-13 17:54:01')

    it('空参数返回 null', () => {
      expect(parseTime()).toBeNull()
      expect(parseTime(null)).toBeNull()
      expect(parseTime('')).toBeNull()
      expect(parseTime(0)).toBeNull()
    })

    it('Date 对象使用默认格式', () => {
      expect(parseTime(d)).toBe('2018-07-13 17:54:01')
    })

    it('支持 10 位秒级时间戳', () => {
      expect(parseTime(Math.floor(d.getTime() / 1000))).toBe('2018-07-13 17:54:01')
    })

    it('支持数字字符串时间戳', () => {
      expect(parseTime(String(d.getTime()))).toBe('2018-07-13 17:54:01')
    })

    it('支持带 "-" 的日期字符串(safari 兼容)', () => {
      expect(parseTime('2018-07-13 17:54:01')).toBe('2018-07-13 17:54:01')
    })

    it('支持自定义格式', () => {
      expect(parseTime(d, '{y}-{m}-{d}')).toBe('2018-07-13')
      expect(parseTime(d, '{y}/{m}/{d} {h}:{i}')).toBe('2018/07/13 17:54')
    })

    it('支持星期', () => {
      expect(parseTime(d, '{a}')).toBe('五')
    })
  })

  describe('resetForm', () => {
    it('存在 ref 时调用 resetFields', () => {
      const resetFields = jest.fn()
      const ctx = { $refs: { form: { resetFields } }}
      resetForm.call(ctx, 'form')
      expect(resetFields).toHaveBeenCalledTimes(1)
    })

    it('不存在 ref 时不做任何操作', () => {
      const ctx = { $refs: {}}
      expect(() => resetForm.call(ctx, 'nope')).not.toThrow()
    })
  })

  describe('addDateRange', () => {
    it('dateRange 非空时写入起止时间', () => {
      const ctx = { dateRange: ['2020-01-01', '2020-01-31'] }
      const params = { name: 'x' }
      const result = addDateRange.call(ctx, params)
      expect(result).toBe(params) // 原对象被修改
      expect(result.begin_time).toBe('2020-01-01')
      expect(result.end_time).toBe('2020-01-31')
    })

    it('dateRange 为空时清空起止时间', () => {
      const ctx = { dateRange: [] }
      const result = addDateRange.call(ctx, { begin_time: 'old', end_time: 'old' }, null)
      expect(result.begin_time).toBe('')
      expect(result.end_time).toBe('')
    })
  })

  describe('selectDictLabel', () => {
    const datas = [
      { value: '0', label: '正常' },
      { value: '1', label: '停用' }
    ]

    it('返回匹配的 label', () => {
      expect(selectDictLabel(datas, '1')).toBe('停用')
    })

    it('无匹配返回空字符串', () => {
      expect(selectDictLabel(datas, '9')).toBe('')
    })
  })

  describe('sprintf', () => {
    it('按顺序替换 %s', () => {
      expect(sprintf('%s-%s', 'a', 'b')).toBe('a-b')
    })

    it('参数不足时返回空字符串', () => {
      expect(sprintf('%s-%s', 'a')).toBe('')
    })

    it('无占位符原样返回', () => {
      expect(sprintf('hello')).toBe('hello')
    })
  })

  describe('praseStrEmpty', () => {
    it('空值 / "null" / "undefined" 转为空串', () => {
      expect(praseStrEmpty(null)).toBe('')
      expect(praseStrEmpty(undefined)).toBe('')
      expect(praseStrEmpty('')).toBe('')
      expect(praseStrEmpty('null')).toBe('')
      expect(praseStrEmpty('undefined')).toBe('')
    })

    it('正常值原样返回', () => {
      expect(praseStrEmpty('abc')).toBe('abc')
      expect(praseStrEmpty(123)).toBe(123)
    })
  })

  describe('handleTree', () => {
    const data = [
      { id: 1, parent_id: 0, label: 'a' },
      { id: 2, parent_id: 1, label: 'b' },
      { id: 3, parent_id: 1, label: 'c' },
      { id: 4, parent_id: 2, label: 'd' }
    ]

    it('构造默认字段的树', () => {
      const tree = handleTree(data)
      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe(1)
      expect(tree[0].children).toHaveLength(2)
      expect(tree[0].children[0].id).toBe(2)
      expect(tree[0].children[0].children[0].id).toBe(4)
    })

    it('不修改原始数据(深度克隆)', () => {
      handleTree(data)
      expect(data[0].children).toBeUndefined()
    })

    it('支持自定义 id / parent_id 字段与 rootId', () => {
      const list = [
        { key: 10, pid: -1, name: 'root' },
        { key: 11, pid: 10, name: 'child' }
      ]
      const tree = handleTree(list, 'key', 'pid', null, -1)
      expect(tree).toHaveLength(1)
      // 注意: 源码中 children 字段名被硬编码为 'children'
      expect(tree[0].children[0].key).toBe(11)
    })
  })

  describe('blobValidate', () => {
    it('非 json 视为 blob', () => {
      expect(blobValidate({ type: 'application/octet-stream' })).toBe(true)
      expect(blobValidate({ type: '' })).toBe(true)
    })

    it('application/json 不是 blob', () => {
      expect(blobValidate({ type: 'application/json' })).toBe(false)
    })
  })
})
