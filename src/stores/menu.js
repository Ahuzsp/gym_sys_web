import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getSysNav } from '@/api/menu'
import { getAllStaffTypes } from '@/api/staff'


export const useMenuStore = defineStore('menu', () => {
  const menuList = ref([])
  const staffRoles = ref([])
  const routes = ref([])
  const isLoaded = ref(false)

  // 获取菜单
  const fetchMenu = async () => {
    if (isLoaded.value && !!menuList.value.length) return menuList.value
    
    try {
      const res = await getSysNav()
      menuList.value = res.data || []
      isLoaded.value = true
      return menuList.value
    } catch (error) {
      console.error('获取菜单失败:', error)
      return []
    }
  }

  // 获取员工角色
  const fetchStaffRoles = async () => {
    if (!!staffRoles.value.length) return staffRoles.value

    try {
      const res = await getAllStaffTypes()
      staffRoles.value = res.data || []
      return staffRoles.value
    } catch (error) {
      console.error('获取员工角色失败:', error)
      return []
    }
  }
  // 生成路由配置
  const generateRoutes = (menus) => {
    const routes = []
    
    const processMenu = (menu, parentPath = '') => {
      const fullPath = menu.path.startsWith('/') ? menu.path : `${parentPath}/${menu.path}`
      
      const route = {
        path: menu.path.startsWith('/') ? menu.path : menu.path,
        name: `menu_${menu.id}`,
        meta: {
          title: menu.title,
          icon: menu.icon,
          id: menu.id
        }
      }

      // 如果有component，动态导入组件
      if (menu.component) {
        const componentPath = menu.component.replace('views/', '')
        route.component = () => import(`@/views/${componentPath}.vue`)
      }

      // 处理子菜单
      if (menu.children && menu.children.length > 0) {
        route.children = menu.children.map(child => processMenu(child, fullPath))
      }

      return route
    }

    menus.forEach(menu => {
      routes.push(processMenu(menu))
    })

    return routes
  }

  // 检查路由是否有权限
  const hasPermission = (path) => {
    // 公共路由不需要权限检查
    const publicPaths = ['/login', '/404', '/403']
    if (publicPaths.includes(path)) return true

    // 检查是否在菜单中
    const checkPath = (menus, targetPath) => {
      for (const menu of menus) {
        const fullPath = menu.path.startsWith('/') ? menu.path : `/${menu.path}`
        if (fullPath === targetPath || targetPath.startsWith(fullPath + '/')) {
          // 如果有component，说明是可访问的页面
          if (menu.component) return true
        }
        if (menu.children && menu.children.length > 0) {
          if (checkPath(menu.children, targetPath)) return true
        }
      }
      return false
    }

    return checkPath(menuList.value, path)
  }

  // 重置菜单状态
  const resetMenu = () => {
    menuList.value = []
    routes.value = []
    isLoaded.value = false
  }

  return {
    menuList,
    routes,
    staffRoles,
    isLoaded,
    fetchMenu,
    fetchStaffRoles,
    generateRoutes,
    hasPermission,
    resetMenu
  }
})
