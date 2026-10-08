import request from '@/utils/request'
import { cleanQuery } from '@/utils'

const api_url = '/curated/categories'

// 分类列表
export function listCategories(query) {
  return request({
    url: api_url,
    method: 'get',
    params: cleanQuery(query)
  })
}

// 分类详情
export function getCategory(id) {
  return request({
    url: api_url + '/' + id,
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: api_url,
    method: 'post',
    data: data
  })
}

// 修改分类
export function setCategory(id, data) {
  return request({
    url: api_url + '/' + id,
    method: 'put',
    data: data
  })
}

// 删除分类
export function delCategory(id) {
  return request({
    url: api_url + '/' + id,
    method: 'delete'
  })
}
