import request from '@/utils/request'

// 员工登录
export function login(data) {
  return request({
    url: '/gym/staff/login',
    method: 'post',
    data
  })
}

// 员工注册
export function register(data) {
  return request({
    url: '/gym/staff/register',
    method: 'post',
    data
  })
}

// 获取所有员工类型
export function getAllStaffTypes() {
  return request({
    url: '/gym/staff/getAllStaffTypes',
    method: 'get'
  })
}

// 获取员工列表
export function getStaffList(params) {
  return request({
    url: '/gym/staff/getAllStaffs',
    method: 'post',
    data: params
  })
}

// 新增员工
export function addStaff(data) {
  return request({
    url: '/gym/staff/add',
    method: 'post',
    data
  })
}

// 更新员工
export function addOrUpdateStaff(data) {
  return request({
    url: '/gym/staff/addOrUpdate',
    method: 'post',
    data
  })
}

// 删除员工
export function deleteStaff(id) {
  return request({
    url: `/gym/staff/delete/${id}`,
    method: 'delete'
  })
}

// 获取员工详情
export function getStaffDetail(id) {
  return request({
    url: `/gym/staff/detail/${id}`,
    method: 'get'
  })
}