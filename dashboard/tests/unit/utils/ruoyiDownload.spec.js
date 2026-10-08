jest.mock('@/store', () => ({ default: { dispatch: jest.fn() }}))
jest.mock('element-ui', () => ({
  Notification: jest.fn(),
  MessageBox: { confirm: jest.fn() },
  Message: jest.fn(),
  Loading: { service: jest.fn() }
}))
jest.mock('js-file-download', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('@/utils/auth', () => ({ getToken: jest.fn() }))

import request from '@/utils/request'
import fileDownload from 'js-file-download'
import { Loading } from 'element-ui'
import { download } from '@/utils/ruoyi'

describe('utils/ruoyi download', () => {
  beforeEach(() => jest.clearAllMocks())

  it('请求 excel 接口并解析 content-disposition 文件名', async() => {
    const close = jest.fn()
    Loading.service.mockReturnValue({ close })
    request.mockResolvedValue({
      data: 'BINARY',
      headers: { 'content-disposition': 'attachment; filename=report.xlsx;' }
    })

    await download('gen', { a: 1 })

    expect(Loading.service).toHaveBeenCalled()
    expect(request).toHaveBeenCalledWith({
      url: '/report/excel_generate/gen',
      method: 'get',
      responseType: 'arraybuffer',
      params: { a: 1 }
    })
    expect(fileDownload).toHaveBeenCalledWith('BINARY', 'report.xlsx')
    expect(close).toHaveBeenCalled()
  })

  it('显式传入 filename 时优先使用', async() => {
    Loading.service.mockReturnValue({ close: jest.fn() })
    request.mockResolvedValue({
      data: 'DATA',
      headers: { 'content-disposition': 'attachment; filename=server.xlsx;' }
    })

    await download('gen', null, 'custom.xlsx')
    expect(fileDownload).toHaveBeenCalledWith('DATA', 'custom.xlsx')
  })
})
