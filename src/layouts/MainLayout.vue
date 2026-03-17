<template>
  <a-layout class="main-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="sider"
      width="220"
    >
      <div class="logo">
        <span v-if="!collapsed">健身房管理系统</span>
        <span v-else>Gym</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        @click="handleMenuClick"
      >
        <template v-for="menu in menuList" :key="menu.path">
          <!-- 有子菜单 -->
          <a-sub-menu
            v-if="menu.children && menu.children.length > 0"
            :key="menu.path"
          >
            <template #icon>
              <component :is="getIcon(menu.icon)" />
            </template>
            <template #title>{{ menu.title }}</template>
            <a-menu-item
              v-for="child in menu.children"
              :key="getFullPath(menu.path, child.path)"
            >
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>
          <!-- 无子菜单 -->
          <a-menu-item v-else :key="menu.path">
            <template #icon>
              <component :is="getIcon(menu.icon)" />
            </template>
            <span>{{ menu.title }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 头部 -->
      <a-layout-header class="header">
        <div class="header-left">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="collapsed = !collapsed"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="collapsed = !collapsed"
          />
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-dropdown>
            <a-space style="cursor: pointer">
              <a-avatar
                v-if="userStore.userInfo?.avatar"
                :src="userStore.userInfo?.avatar"
              ></a-avatar>
              <a-avatar v-else :style="{ backgroundColor: '#667eea' }">
                {{ userStore.userInfo?.realName?.charAt(0) || 'U' }}
              </a-avatar>
              <span>{{ userStore.userInfo?.realName || '用户' }}</span>
            </a-space>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CalendarOutlined,
  SettingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  FileOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()
const userStore = useUserStore()

const collapsed = ref(false)
const selectedKeys = ref([])
const openKeys = ref([])
const menuList = computed(() => menuStore.menuList)

// 图标映射
const iconMap = {
  DashboardOutlined,
  CalendarOutlined,
  SettingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  FileOutlined,
  SafetyOutlined
}

const getIcon = (iconName) => {
  if (!iconName) return FileOutlined
  return iconMap[iconName] || FileOutlined
}

// 获取完整路径
const getFullPath = (parentPath, childPath) => {
  if (parentPath.startsWith('/')) {
    return `${parentPath}/${childPath}`.replace(/\/+/g, '/')
  }
  return `/${parentPath}/${childPath}`.replace(/\/+/g, '/')
}

// 面包屑
const breadcrumbs = computed(() => {
  const crumbs = []
  const findMenu = (menus, path, parents = []) => {
    for (const menu of menus) {
      const currentPath = menu.path.startsWith('/')
        ? menu.path
        : `/${menu.path}`

      if (currentPath === path || path.startsWith(currentPath + '/')) {
        crumbs.push(...parents, { title: menu.title, path: currentPath })

        if (menu.children && menu.children.length > 0) {
          findMenu(menu.children, path, [
            ...parents,
            { title: menu.title, path: currentPath }
          ])
        }
        return true
      }

      if (menu.children && menu.children.length > 0) {
        if (
          findMenu(menu.children, path, [
            ...parents,
            { title: menu.title, path: currentPath }
          ])
        ) {
          return true
        }
      }
    }
    return false
  }

  findMenu(menuList.value, route.path)
  return crumbs
})

// 菜单点击
const handleMenuClick = ({ key }) => {
  if (key.startsWith('/')) {
    router.push(key)
  } else {
    router.push('/' + key)
  }
}

// 退出登录
const handleLogout = () => {
  menuStore.resetMenu()
  userStore.logout()
  message.success('退出成功')
  router.push('/login')
}

// 监听路由变化，更新选中状态
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]

    // 展开父菜单
    const pathParts = path.split('/').filter(Boolean)
    if (pathParts.length > 1) {
      openKeys.value = ['/' + pathParts[0]]
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (!menuStore.isLoaded) {
    await menuStore.fetchMenu()
  }
})
</script>

<style scoped lang="less">
.ant-layout {
  display: flex;
  .ant-layout-content.content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    margin: 16px;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
  }
}

.sider {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #667eea;
}

.breadcrumb {
  margin-left: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

:deep(.ant-menu-dark) {
  background: transparent;
}

:deep(.ant-menu-dark .ant-menu-item-selected) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
