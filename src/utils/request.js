import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 根据实际后端返回格式调整
    if (res.code === 200 || res.code === 0 || res.success) {
      return res
    } else if (res.code === 401) {
      // token 过期或未授权
      handleUnauthorized()
      return Promise.reject(new Error('登录已过期，请重新登录'))
    } else {
      message.error(res.message || res.msg || '请求失败')
      return Promise.reject(new Error(res.message || res.msg || '请求失败'))
    }
  },
  (error) => {
    // 处理 HTTP 错误状态码
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        handleUnauthorized()
        return Promise.reject(new Error('登录已过期，请重新登录'))
      }
    }
    message.error(error.response?.data?.message || '网络错误')
    return Promise.reject(error.response?.data)
  }
)

// 处理未授权（token过期等）
const handleUnauthorized = () => {
  // 清除本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')

  // 提示用户
  message.warning('登录已过期，请重新登录')

  // 跳转到登录页
  router.push('/login')
}

export default request
