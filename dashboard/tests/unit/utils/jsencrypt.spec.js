import { encrypt, decrypt, base64Encode, base64Decode, md5 } from '@/utils/jsencrypt'

describe('utils/jsencrypt', () => {
  it('RSA 加密后可以解密还原', () => {
    const plain = 'hello-hipy-123'
    const cipher = encrypt(plain)
    expect(cipher).toBeTruthy()
    expect(cipher).not.toBe(plain)
    expect(decrypt(cipher)).toBe(plain)
  })

  it('base64 编解码可逆', () => {
    const text = '测试abc123'
    const encoded = base64Encode(text)
    expect(encoded).not.toBe(text)
    expect(base64Decode(encoded)).toBe(text)
  })

  it('md5 结果稳定且为 32 位十六进制', () => {
    const hash = md5('password')
    expect(hash).toMatch(/^[0-9a-f]{32}$/)
    expect(md5('password')).toBe(hash)
    expect(md5('password1')).not.toBe(hash)
  })
})
