import { shallowMount } from '@vue/test-utils'
import RightToolbar from '@/components/RightToolbar/index.vue'

const columns = [
  { key: 0, label: '名称', visible: true },
  { key: 1, label: '状态', visible: false }
]

const mountToolbar = (props = {}) => shallowMount(RightToolbar, {
  propsData: { columns: JSON.parse(JSON.stringify(columns)), ...props }
})

describe('components/RightToolbar', () => {
  it('style 根据 gutter 计算右边距', () => {
    expect(mountToolbar({ gutter: 20 }).vm.style).toEqual({ marginRight: '10px' })
    expect(mountToolbar({ gutter: 0 }).vm.style).toEqual({})
  })

  it('toggleSearch 取反并 emit update:showSearch', () => {
    const wrapper = mountToolbar({ showSearch: true })
    wrapper.vm.toggleSearch()
    expect(wrapper.emitted('update:showSearch')[0]).toEqual([false])
  })

  it('refresh emit queryTable', () => {
    const wrapper = mountToolbar()
    wrapper.vm.refresh()
    expect(wrapper.emitted('queryTable')).toHaveLength(1)
  })

  it('showColumn 打开弹窗', () => {
    const wrapper = mountToolbar()
    expect(wrapper.vm.open).toBe(false)
    wrapper.vm.showColumn()
    expect(wrapper.vm.open).toBe(true)
  })

  it('checkboxChange 修改对应列可见性', () => {
    const wrapper = mountToolbar()
    wrapper.vm.checkboxChange(false, '名称')
    expect(wrapper.vm.columns[0].visible).toBe(false)
    wrapper.vm.checkboxChange(true, '状态')
    expect(wrapper.vm.columns[1].visible).toBe(true)
  })

  it('dataChange 根据穿梭结果设置可见性', () => {
    const wrapper = mountToolbar({ showColumnsType: 'transfer' })
    wrapper.vm.dataChange([0])
    expect(wrapper.vm.columns[0].visible).toBe(false)
    expect(wrapper.vm.columns[1].visible).toBe(true)
  })

  it('transfer 模式 created 时收集初始隐藏列', () => {
    const wrapper = mountToolbar({ showColumnsType: 'transfer' })
    expect(wrapper.vm.value).toEqual([1])
  })
})
