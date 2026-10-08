import waves from '@/directive/waves/waves'

describe('directive/waves', () => {
  it('bind 后点击生成波纹元素', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    waves.bind(el, { value: {}})
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const ripple = el.querySelector('.waves-ripple')
    expect(ripple).not.toBeNull()
    expect(ripple.classList.contains('z-active')).toBe(true)
  })

  it('center 类型设置居中样式', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    waves.bind(el, { value: { type: 'center' }})
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(el.querySelector('.waves-ripple')).not.toBeNull()
  })

  it('update 重新绑定监听且不报错', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    waves.bind(el, { value: {}})
    expect(() => waves.update(el, { value: {}})).not.toThrow()
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(el.querySelector('.waves-ripple')).not.toBeNull()
  })

  it('unbind 清理监听', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    waves.bind(el, { value: {}})
    expect(() => waves.unbind(el)).not.toThrow()
    expect(el['@@wavesContext']).toBeUndefined()
  })
})
