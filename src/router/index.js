import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

// 公共路由（不需要权限检查）
export const publicRoutes = ['/login', '/404', '/403']

// 静态路由
const staticRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在', public: true }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { title: '无权限访问', public: true }
  }
]

// 业务路由（需要权限检查）
const businessRoutes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'staffs',
        name: 'Staffs',
        component: () => import('@/views/Staffs.vue'),
        meta: { title: '员工管理' }
      },
      {
        path: 'schedule',
        name: 'Schedule',
        meta: { title: '排期管理' },
        children: [
          {
            path: 'list',
            name: 'ScheduleList',
            component: () => import('@/views/schedule/List.vue'),
            meta: { title: '课程表' }
          },
          {
            path: 'booking',
            name: 'ScheduleBooking',
            component: () => import('@/views/schedule/Booking.vue'),
            meta: { title: '预约记录' }
          },
          {
            path: 'shiftCalendar',
            name: 'ShiftCalendar',
            component: () => import('@/views/schedule/ShiftCalendar.vue'),
            meta: { title: '排班日历' }
          }
        ]
      },
      {
        path: 'member',
        name: 'Member',
        component: () => import('@/views/Member.vue'),
        meta: { title: '会员管理' }
      },
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统设置' },
        children: [
          {
            path: 'menu',
            name: 'SystemMenu',
            component: () => import('@/views/system/Menu.vue'),
            meta: { title: '菜单管理' }
          }
        ]
      },
      {
        path: 'tools',
        name: 'Tools',
        meta: { title: '工具箱' },
        children: [
          {
            path: 'pdf',
            name: 'ToolsPdf',
            component: () => import('@/views/pdf/PDFTool.vue'),
            meta: { title: 'PDF工具' }
          }
        ]
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...staticRoutes, ...businessRoutes]
})

// 捕获所有未匹配的路由
router.addRoute({
  path: '/:pathMatch(.*)*',
  redirect: '/404'
})

export default router
