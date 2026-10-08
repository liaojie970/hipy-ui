import { shallowMount } from '@vue/test-utils'
import PanThumb from '@/components/PanThumb/index.vue'

describe('components/PanThumb', () => {
  it('按 props 渲染尺寸与背景图', () => {
    const wrapper = shallowMount(PanThumb, {
      propsData: { image: 'http://a.com/x.png', width: '100px', height: '120px', zIndex: 9 }
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('z-index: 9')
    expect(style).toContain('height: 120px')
    expect(style).toContain('width: 100px')
    expect(wrapper.html()).toContain('http://a.com/x.png')
  })

  it('使用默认尺寸', () => {
    const wrapper = shallowMount(PanThumb, { propsData: { image: 'x.png' }})
    expect(wrapper.vm.width).toBe('150px')
    expect(wrapper.vm.height).toBe('150px')
    expect(wrapper.vm.zIndex).toBe(1)
  })
})
