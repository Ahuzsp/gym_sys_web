import request from '@/utils/request'

// 分页查询会员
export function getMemberPage(params) {
  return request({
    url: '/gym/user/page',
    method: 'post',
    data: params
  })
}

// 新增或更新会员
export function saveOrUpdateMember(data) {
  return request({
    url: '/gym/user/saveOrUpdate',
    method: 'post',
    data
  })
}

// 删除会员
export function deleteMember(id) {
  return request({
    url: `/gym/user/${id}`,
    method: 'delete'
  })
}

// 更新余额
export function updateBalance(data) {
  return request({
    url: '/gym/user/updateBalance',
    method: 'post',
    data
  })
}

// 更新积分
export function updatePoints(data) {
  return request({
    url: '/gym/user/updatePoints',
    method: 'post',
    data
  })
}
