import { shallowMount } from '@vue/test-utils'
import GithubCorner from '@/components/GithubCorner/index.vue'

describe('components/GithubCorner', () => {
  it('渲染指向项目仓库的链接', () => {
    const wrapper = shallowMount(GithubCorner)
    const link = wrapper.find('a.github-corner')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://github.com/hjdhnx/hipy-ui')
    expect(link.attributes('target')).toBe('_blank')
  })
})
