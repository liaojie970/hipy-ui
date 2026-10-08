jest.mock('axios', () => jest.fn())
jest.mock('file-saver', () => ({ saveAs: jest.fn() }))
jest.mock('element-ui', () => ({
  Loading: { service: jest.fn(() => ({ close: jest.fn() })) },
  Message: { error: jest.fn() }
}))
jest.mock('@/utils/auth', () => ({ getToken: jest.fn(() => 'token-123') }))
jest.mock('@/utils/ruoyi', () => ({ blobValidate: jest.fn(() => true) }))

import axios from 'axios'
import { saveAs } from 'file-saver'
import { Loading, Message } from 'element-ui'
import { getToken } from '@/utils/auth'
import { blobValidate } from '@/utils/ruoyi'
import download from '@/plugins/download'

const flush = () => new Promise(resolve => setTimeout(resolve, 10))

describe('plugins/download', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getToken.mockReturnValue('token-123')
    blobValidate.mockReturnValue(true)
    axios.mockResolvedValue({
      data: { type: 'application/zip' },
      headers: { 'download-filename': encodeURIComponent('a.zip') }
    })
  })

  it('saveAs 透传 file-saver', () => {
    download.saveAs('blob', 'name.zip', { autoBom: true })
    expect(saveAs).toHaveBeenCalledWith('blob', 'name.zip', { autoBom: true })
  })

  it('printErrMsg 使用 errorCode 映射错误信息', async() => {
    await download.printErrMsg({ text: () => Promise.resolve(JSON.stringify({ code: '401' })) })
    expect(Message.error).toHaveBeenCalledWith('认证失败，无法访问系统资源')
  })

  it('printErrMsg 回退到 msg 或 default', async() => {
    await download.printErrMsg({ text: () => Promise.resolve(JSON.stringify({ code: '9999', msg: '自定义错误' })) })
    expect(Message.error).toHaveBeenCalledWith('自定义错误')

    jest.clearAllMocks()
    await download.printErrMsg({ text: () => Promise.resolve(JSON.stringify({})) })
    expect(Message.error).toHaveBeenCalledWith('系统未知错误，请反馈给管理员')
  })

  it('name 下载 blob 文件', async() => {
    download.name('test.txt', true)
    await flush()
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({ responseType: 'blob' }))
    expect(saveAs).toHaveBeenCalled()
  })

  it('resource 下载资源文件', async() => {
    download.resource('a/b/c.png')
    await flush()
    expect(axios).toHaveBeenCalled()
    expect(saveAs).toHaveBeenCalled()
  })

  it('zip 下载并关闭 loading', async() => {
    download.zip('/common/download/zip', 'all.zip')
    await flush()
    expect(Loading.service).toHaveBeenCalled()
    expect(saveAs).toHaveBeenCalled()
    const instance = Loading.service.mock.results[0].value
    expect(instance.close).toHaveBeenCalled()
  })

  it('zip 非 blob 响应时走 printErrMsg', async() => {
    blobValidate.mockReturnValue(false)
    const spy = jest.spyOn(download, 'printErrMsg').mockResolvedValue()
    download.zip('/common/download/zip', 'all.zip')
    await flush()
    expect(spy).toHaveBeenCalled()
    expect(saveAs).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
