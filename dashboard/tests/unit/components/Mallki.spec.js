import { shallowMount } from '@vue/test-utils'
import Mallki from '@/components/TextHoverEffect/Mallki.vue'

describe('components/TextHoverEffect/Mallki', () => {
  it('渲染文本并携带 className', () => {
    const wrapper = shallowMount(Mallki, {
      propsData: { text: 'Hello', className: 'my-link' }
    })
    const link = wrapper.find('a')
    expect(link.classes()).toContain('link--mallki')
    expect(link.classes()).toContain('my-link')
    expect(link.text()).toContain('Hello')
  })

  it('默认文本', () => {
    const wrapper = shallowMount(Mallki)
    expect(wrapper.vm.text).toBe('vue-element-admin')
  })

  it('两个装饰 span 携带 data-letters', () => {
    const wrapper = shallowMount(Mallki, { propsData: { text: 'Abc' }})
    const spans = wrapper.findAll('span')
    expect(spans.length).toBe(2)
    expect(spans.at(0).attributes('data-letters')).toBe('Abc')
  })
})
