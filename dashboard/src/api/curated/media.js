import request from '@/utils/request'

const api_url = '/curated/media'

// 媒体列表
export function listMedia(query) {
  return request({
    url: api_url,
    method: 'get',
    params: query
  })
}

// 媒体详情(含选集)
export function getMedia(id) {
  return request({
    url: api_url + '/' + id,
    method: 'get'
  })
}

// 修改媒体
export function setMedia(id, data) {
  return request({
    url: api_url + '/' + id,
    method: 'put',
    data: data
  })
}

// 删除媒体
export function delMedia(id) {
  return request({
    url: api_url + '/' + id,
    method: 'delete'
  })
}

// 批量入库
export function batchImport(data) {
  return request({
    url: api_url + '/batch',
    method: 'post',
    data: data,
    timeout: 120 * 1000
  })
}

// 批量设置审核状态 (status: 0待审 1通过 2拒绝)
export function batchStatus(ids, status) {
  return request({
    url: api_url + '/status/batch',
    method: 'put',
    data: {ids: ids, status: status}
  })
}

// 批量设置是否可见
export function batchVisible(ids, status) {
  return request({
    url: api_url + '/visible/batch',
    method: 'post',
    data: {ids: ids, status: status}
  })
}

// 批量删除
export function batchRemove(ids) {
  return request({
    url: api_url + '/remove/batch',
    method: 'post',
    data: {ids: ids, status: 0}
  })
}

// 批量校验可见性与可播放
export function checkMedia(ids) {
  return request({
    url: api_url + '/check/batch',
    method: 'post',
    data: {ids: ids},
    timeout: 300 * 1000
  })
}

// 生成儿童专用配置地址
export function kidConfig(params) {
  return request({
    url: '/curated/kid_config',
    method: 'get',
    params: params
  })
}
