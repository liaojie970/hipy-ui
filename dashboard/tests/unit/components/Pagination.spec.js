jest.mock('@/utils/scroll-to', () => ({ scrollTo: jest.fn() }))

import { shallowMount } from '@vue/test-utils'
import { scrollTo } from '@/utils/scroll-to'
import Pagination from '@/components/Pagination/index.vue'

const mountPagination = (props = {}) => shallowMount(Pagination, {
  propsData: { total: 100, ...props }
})

describe('components/Pagination', () => {
  beforeEach(() => jest.clearAllMocks())

  it('currentPage 读取 page, 写入时 emit update:page', () => {
    const wrapper = mountPagination({ page: 2 })
    expect(wrapper.vm.currentPage).toBe(2)
    wrapper.vm.currentPage = 5
    expect(wrapper.emitted('update:page')[0]).toEqual([5])
  })

  it('pageSize 读取 limit, 写入时 emit update:limit', () => {
    const wrapper = mountPagination({ limit: 20 })
    expect(wrapper.vm.pageSize).toBe(20)
    wrapper.vm.pageSize = 50
    expect(wrapper.emitted('update:limit')[0]).toEqual([50])
  })

  it('handleSizeChange 触发 pagination 并滚动到顶部', () => {
    const wrapper = mountPagination({ page: 3 })
    wrapper.vm.handleSizeChange(30)
    expect(wrapper.emitted('pagination')[0]).toEqual([{ page: 3, limit: 30 }])
    expect(scrollTo).toHaveBeenCalledWith(0, 800)
  })

  it('handleCurrentChange 触发 pagination 并滚动到顶部', () => {
    const wrapper = mountPagination({ limit: 20 })
    wrapper.vm.handleCurrentChange(4)
    expect(wrapper.emitted('pagination')[0]).toEqual([{ page: 4, limit: 20 }])
    expect(scrollTo).toHaveBeenCalledWith(0, 800)
  })

  it('autoScroll 为 false 时不滚动', () => {
    const wrapper = mountPagination({ autoScroll: false })
    wrapper.vm.handleCurrentChange(2)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('hidden 添加 hidden 类', () => {
    const wrapper = mountPagination({ hidden: true })
    expect(wrapper.classes()).toContain('hidden')
  })

  it('使用默认 pageSizes', () => {
    const wrapper = mountPagination()
    expect(wrapper.vm.pageSizes).toEqual([10, 20, 30, 50])
  })
})
