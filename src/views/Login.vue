<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>健身房管理系统</h1>
        <p>Gym Management System</p>
      </div>

      <a-tabs v-model:value="activeKey" centered>
        <!-- 登录表单 -->
        <a-tab-pane key="login" tab="登录">
          <a-form
            :model="loginForm"
            :rules="loginRules"
            @finish="handleLogin"
            layout="vertical"
          >
            <a-form-item name="username" label="用户名/邮箱">
              <a-input
                v-model:value="loginForm.username"
                placeholder="请输入用户名或邮箱"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" label="密码">
              <a-input-password
                v-model:value="loginForm.password"
                placeholder="请输入密码"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="loginLoading"
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- 注册表单 -->
        <a-tab-pane key="register" tab="注册">
          <a-form
            :model="registerForm"
            :rules="registerRules"
            @finish="handleRegister"
            layout="vertical"
          >
            <a-form-item name="username" label="用户名">
              <a-input
                v-model:value="registerForm.username"
                placeholder="请输入用户名"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" label="密码">
              <a-input-password
                v-model:value="registerForm.password"
                placeholder="请输入密码"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item name="confirmPassword" label="确认密码">
              <a-input-password
                v-model:value="registerForm.confirmPassword"
                placeholder="请再次输入密码"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item name="realName" label="真实姓名">
              <a-input
                v-model:value="registerForm.realName"
                placeholder="请输入真实姓名"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <IdcardOutlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="roleType" label="角色">
              <a-select
                v-model:value="registerForm.roleType"
                placeholder="请选择角色"
                size="large"
              >
                <a-select-option :value="1">店长</a-select-option>
                <a-select-option :value="2">教练</a-select-option>
                <a-select-option :value="3">销售</a-select-option>
                <a-select-option :value="4">前台</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="registerLoading"
              >
                注册
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  LockOutlined,
  IdcardOutlined
} from '@ant-design/icons-vue'
import { login, register } from '@/api/staff'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'

const router = useRouter()
const userStore = useUserStore()
const menuStore = useMenuStore()
const activeKey = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 登录校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  roleType: undefined
})

// 确认密码校验
const validateConfirmPassword = async (rule, value) => {
  if (value !== registerForm.password) {
    return Promise.reject('两次密码输入不一致')
  }
  return Promise.resolve()
}

// 注册校验规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  roleType: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 获取第一个可访问的路由
const getFirstRoute = (menus) => {
  for (const menu of menus) {
    // 如果有组件，说明是可访问的页面
    if (menu.component) {
      return menu.path.startsWith('/') ? menu.path : '/' + menu.path
    }
    // 如果有子菜单，递归查找
    if (menu.children && menu.children.length > 0) {
      const childRoute = getFirstRoute(menu.children)
      if (childRoute) {
        const parentPath = menu.path.startsWith('/')
          ? menu.path
          : '/' + menu.path
        return parentPath + childRoute
      }
    }
  }
  return null
}

// 登录处理
const handleLogin = async () => {
  loginLoading.value = true
  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })
    message.success('登录成功')

    // 存储token和用户信息
    if (res.data?.token) {
      userStore.setToken(res.data.token)
    }
    if (res.data) {
      userStore.setUserInfo(res.data.userInfo || res.data)
    }

    // 获取菜单
    const menus = await menuStore.fetchMenu()
    // 获取员工类型
    await menuStore.fetchStaffRoles()

    // 跳转到第一个可访问的路由
    const firstRoute = getFirstRoute(menus)
    if (firstRoute) {
      router.push(firstRoute)
    } else {
      // 如果没有找到路由，跳转到默认路由
      router.push('/')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loginLoading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  registerLoading.value = true
  try {
    await register({
      username: registerForm.username,
      password: registerForm.password,
      realName: registerForm.realName,
      roleType: registerForm.roleType
    })
    message.success('注册成功，请登录')
    // 切换到登录tab
    activeKey.value = 'login'
    // 预填用户名
    loginForm.username = registerForm.username
    // 清空注册表单
    Object.assign(registerForm, {
      username: '',
      password: '',
      confirmPassword: '',
      realName: '',
      roleType: undefined
    })
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background:
    linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.3) 0%,
      rgba(118, 75, 162, 0.3) 100%
    ),
    url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-tabs-tab) {
  font-size: 16px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

:deep(.ant-input-affix-wrapper),
:deep(.ant-select-selector) {
  border-radius: 8px;
}

:deep(.ant-btn) {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
}
</style>
