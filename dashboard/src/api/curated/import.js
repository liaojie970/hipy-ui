import request from '@/utils/request'

const api_url = '/curated'

// 搜索站点内容
export function searchMedia(data) {
  return request({
    url: api_url + '/search',
    method: 'post',
    data: data,
    timeout: 30 * 1000
  })
}

// 解析粘贴链接
export function resolveUrl(data) {
  return request({
    url: api_url + '/resolve',
    method: 'post',
    data: data,
    timeout: 30 * 1000
  })
}

// 解析播放直链
export function resolvePlay(query) {
  return request({
    url: api_url + '/play',
    method: 'get',
    params: query,
    timeout: 30 * 1000
  })
}

// 精选库快照(调试用)
export function catalog() {
  return request({
    url: api_url + '/catalog',
    method: 'get'
  })
}
