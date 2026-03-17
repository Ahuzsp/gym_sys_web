import request from '@/utils/request'

// 获取系统导航菜单
export function getSysNav() {
  return request({
    url: '/gym/menu/getSysNav',
    method: 'get'
  })
}

export function getAllMenus() {
  return request({
    url: '/gym/menu/getAllMenus',
    method: 'get'
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/gym/menu/add',
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(data) {
  return request({
    url: '/gym/menu/update',
    method: 'post',
    data
  })
}

// 删除菜单
export function deleteMenu(id) {
  return request({
    url: `/gym/menu/delete/${id}`,
    method: 'delete'
  })
}

// 获取菜单详情
export function getMenuDetail(id) {
  return request({
    url: `/gym/menu/detail/${id}`,
    method: 'get'
  })
}
