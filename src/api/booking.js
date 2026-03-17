import request from '@/utils/request'

// 分页查询预约记录
export function getBookingList(params) {
  return request({
    url: '/gym/bookings/list',
    method: 'post',
    data: params
  })
}

// 新增或更新预约
export function saveOrUpdateBooking(data) {
  return request({
    url: '/gym/bookings/addOrUpdateBooking',
    method: 'post',
    data
  })
}

// 取消预约
export function cancelBooking(id) {
  return request({
    url: `/gym/bookings/${id}/cancel`,
    method: 'put'
  })
}

// 删除预约
export function deleteBooking(id) {
  return request({
    url: `/gym/bookings/${id}`,
    method: 'delete'
  })
}
