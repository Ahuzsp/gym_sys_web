import request from '@/utils/request'

// 分页查询课程
export function getCoursePage(params) {
  return request({
    url: '/gym/course/page',
    method: 'post',
    data: params
  })
}

// 新增或编辑课程
export function saveOrUpdateCourse(data) {
  return request({
    url: '/gym/course/saveOrUpdate',
    method: 'post',
    data
  })
}

// 删除课程
export function deleteCourse(id) {
  return request({
    url: `/gym/course/${id}`,
    method: 'delete'
  })
}
