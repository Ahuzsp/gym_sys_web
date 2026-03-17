import request from '@/utils/request'

// 获取月度统计
export function getMonthStatistics(year, month) {
  return request({
    url: '/gym/schedule/statistics',
    method: 'get',
    params: { year, month }
  })
}

// 查询某天所有排班
export function getScheduleByDate(date) {
  return request({
    url: `/gym/schedule/date/${date}`,
    method: 'get'
  })
}

// 条件查询某天排班
export function queryScheduleByDate(data) {
  return request({
    url: '/gym/schedule/date',
    method: 'post',
    data
  })
}

// 查询排班详情
export function getScheduleDetail(id) {
  return request({
    url: `/gym/schedule/${id}`,
    method: 'get'
  })
}

// 新增排班
export function addSchedule(data) {
  return request({
    url: '/gym/schedule/save',
    method: 'post',
    data
  })
}

// 更新排班
export function updateSchedule(data) {
  return request({
    url: '/gym/schedule/update',
    method: 'post',
    data
  })
}

// 删除排班
export function deleteSchedule(id) {
  return request({
    url: `/gym/schedule/${id}`,
    method: 'delete'
  })
}

// 更新参与人数
export function updateParticipants(data) {
  return request({
    url: '/gym/schedule/updateParticipants',
    method: 'post',
    data
  })
}

// 更新状态
export function updateScheduleStatus(data) {
  return request({
    url: '/gym/schedule/updateStatus',
    method: 'post',
    data
  })
}
