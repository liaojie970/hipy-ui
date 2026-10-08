import request from '@/utils/request'
import { cleanQuery } from '@/utils'

const api_url = '/curated/providers'

// 可用的站点类型
export function availableProviders() {
  return request({
    url: api_url + '/available',
    method: 'get'
  })
}

// 站点列表
export function listProviders(query) {
  return request({
    url: api_url,
    method: 'get',
    params: cleanQuery(query)
  })
}

// 站点详情
export function getProvider(id) {
  return request({
    url: api_url + '/' + id,
    method: 'get'
  })
}

// 新增站点
export function addProvider(data) {
  return request({
    url: api_url,
    method: 'post',
    data: data
  })
}

// 修改站点
export function setProvider(id, data) {
  return request({
    url: api_url + '/' + id,
    method: 'put',
    data: data
  })
}

// 删除站点
export function delProvider(id) {
  return request({
    url: api_url + '/' + id,
    method: 'delete'
  })
}

// 测试站点配置(可传 config 而不入库)
export function testProvider(data) {
  return request({
    url: api_url + '/test',
    method: 'post',
    data: data,
    timeout: 30 * 1000
  })
}
