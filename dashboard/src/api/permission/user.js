import request from '@/utils/request'
import md5 from 'js-md5'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/permission/user',
    method: 'get',
    params: query
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/permission/user/' + userId,
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/permission/user',
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateUser(userId, data) {
  return request({
    url: '/permission/user/' + userId,
    method: 'put',
    data: data
  })
}

// 删除用户
export function delUser(userId) {
  return request({
    url: '/permission/user/' + userId,
    method: 'delete'
  })
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  return request({
    url: '/permission/user/' + userId + '/password',
    method: 'put',
    data: { 'password': md5(password) }
  })
}

// 修改用户活跃
export function changeUserIsActive(userId, is_active) {
  return request({
    url: '/permission/user/' + userId + '/active',
    method: 'put',
    data: { 'is_active': is_active }
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/permission/user/file/avatar',
    method: 'post',
    data: data
  })
}

