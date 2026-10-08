import { shallowMount } from '@vue/test-utils'
import DictTag from '@/components/DictTag/index.vue'

const options = [
  { value: '0', label: '正常', raw: { listClass: 'primary', cssClass: '' }},
  { value: '1', label: '停用', raw: { listClass: 'danger', cssClass: '' }},
  { value: '2', label: '默认', raw: { listClass: 'default', cssClass: '' }}
]

const mountDictTag = (props = {}) => shallowMount(DictTag, {
  propsData: { options, ...props }
})

describe('components/DictTag', () => {
  describe('values 计算', () => {
    it('单值', () => {
      expect(mountDictTag({ value: '1' }).vm.values).toEqual(['1'])
    })

    it('数组值', () => {
      expect(mountDictTag({ value: ['0', '1'] }).vm.values).toEqual(['0', '1'])
    })

    it('逗号分隔字符串', () => {
      expect(mountDictTag({ value: '0,1' }).vm.values).toEqual(['0', '1'])
    })

    it('支持自定义分隔符', () => {
      const wrapper = mountDictTag({ value: '0;1', separator: ';' })
      expect(wrapper.vm.values).toEqual(['0', '1'])
    })

    it('空值返回空数组', () => {
      expect(mountDictTag({ value: null }).vm.values).toEqual([])
      expect(mountDictTag({ value: undefined }).vm.values).toEqual([])
      expect(mountDictTag({ value: '' }).vm.values).toEqual([])
    })
  })

  describe('渲染', () => {
    it('匹配的字典项渲染对应标签', () => {
      const wrapper = mountDictTag({ value: '1' })
      expect(wrapper.text()).toContain('停用')
      expect(wrapper.find('el-tag').exists()).toBe(true)
    })

    it('default 类型渲染为 span 而非 el-tag', () => {
      const wrapper = mountDictTag({ value: '2' })
      expect(wrapper.text()).toContain('默认')
      expect(wrapper.find('el-tag').exists()).toBe(false)
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('多值全部渲染', () => {
      const wrapper = mountDictTag({ value: ['0', '1'] })
      expect(wrapper.text()).toContain('正常')
      expect(wrapper.text()).toContain('停用')
    })
  })

  describe('unmatch 未匹配', () => {
    it('存在未匹配项时返回 true 并记录', () => {
      const wrapper = mountDictTag({ value: '9' })
      expect(wrapper.vm.unmatch).toBe(true)
      expect(wrapper.vm.unmatchArray).toEqual(['9'])
    })

    it('全部匹配时返回 false', () => {
      const wrapper = mountDictTag({ value: '0' })
      expect(wrapper.vm.unmatch).toBe(false)
      expect(wrapper.vm.unmatchArray).toEqual([])
    })

    it('选项为空时不判定未匹配', () => {
      const wrapper = mountDictTag({ options: [], value: '9' })
      expect(wrapper.vm.unmatch).toBe(false)
    })

    it('showValue 为 true 时展示未匹配的原始值', () => {
      const wrapper = mountDictTag({ value: '9', showValue: true })
      expect(wrapper.text()).toContain('9')
    })
  })
})
