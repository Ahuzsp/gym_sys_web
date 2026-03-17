import router from '@/router'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'

// 白名单路由（不需要登录）
const whiteList = ['/login', '/404', '/403']

// 收集所有有组件的菜单路径
const collectMenuPaths = (menus, parentPath = '') => {
  const paths = []
  
  menus.forEach(menu => {
    // 计算当前菜单的完整路径
    let fullPath = ''
    if (menu.path.startsWith('/')) {
      fullPath = menu.path
    } else if (parentPath) {
      fullPath = `${parentPath}/${menu.path}`
    } else {
      fullPath = `/${menu.path}`
    }
    
    // 如果有component，说明是可访问的页面
    if (menu.component) {
      paths.push(fullPath)
    }
    
    // 递归处理子菜单（传递当前菜单的路径作为子菜单的parentPath）
    if (menu.children && menu.children.length > 0) {
      paths.push(...collectMenuPaths(menu.children, fullPath))
    }
  })
  
  return paths
}

// 检查路径是否有权限
const checkPermission = (menus, targetPath) => {
  const allowedPaths = collectMenuPaths(menus)
  // 精确匹配
  if (allowedPaths.includes(targetPath)) {
    return true
  }
  
  return false
}

router.beforeEach(async (to, from, next) => {

  // 设置页面标题
  document.title = `${to.meta.title || ''} - 健身房管理系统`
  
  const userStore = useUserStore()
  const menuStore = useMenuStore()
  if (userStore.token) {
    await menuStore.fetchStaffRoles()
  }
  // 优先从 localStorage 获取 token（确保与 request.js 同步）
  const token = localStorage.getItem('token')
  
  // 同步到 store
  if (token !== userStore.token) {
    if (token) {
      userStore.token = token
    } else {
      userStore.token = ''
    }
  }
  
  // 白名单路由直接放行
  if (whiteList.includes(to.path)) {
    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login' && token) {
      next('/dashboard')
      return
    }
    next()
    return
  }
  
  // 需要登录的路由
  if (!token) {
    // 清理 store 状态
    menuStore.resetMenu()
    next('/login')
    return
  }
  
  // 确保菜单已加载
  if (!menuStore.isLoaded) {
    try {
      await menuStore.fetchMenu()
    } catch (error) {
      console.error('获取菜单失败:', error)
      userStore.logout()
      menuStore.resetMenu()
      next('/login')
      return
    }
  }
  
  // 权限检查
  const hasPermission = checkPermission(menuStore.menuList, to.path)
  
  if (!hasPermission) {
    next('/403')
    return
  }
  
  next()
})
