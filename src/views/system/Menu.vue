<template>
  <div class="menu-management">
    <a-card title="菜单管理" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd(null)">
          <template #icon>
            <PlusOutlined />
          </template>
          新增菜单
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="menuData"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :default-expand-all-rows="true"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <component :is="getIcon(record.icon)" v-if="record.icon" />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'isHidden'">
            <a-tag :color="!record.isHidden ? 'success' : 'default'">
              {{ !record.isHidden ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleAdd(record)"
                >新增子菜单</a-button
              >
              <a-button
                v-if="record.path !== '/system'"
                type="link"
                size="small"
                @click="handleEdit(record)"
                >编辑</a-button
              >
              <a-popconfirm
                v-if="record.path !== '/system'"
                title="确定要删除此菜单吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="上级菜单" name="parentId">
          <a-tree-select
            v-model:value="formState.parentId"
            :tree-data="treeData"
            placeholder="请选择上级菜单"
            tree-default-expand-all
          />
        </a-form-item>
        <a-form-item label="菜单标题" name="title">
          <a-input
            v-model:value="formState.title"
            placeholder="请输入菜单标题"
          />
        </a-form-item>
        <a-form-item label="路由路径" name="path">
          <a-input
            v-model:value="formState.path"
            placeholder="请输入路由路径"
          />
        </a-form-item>
        <a-form-item label="组件路径" name="component">
          <a-input
            v-model:value="formState.component"
            placeholder="如：views/system/Menu"
          />
        </a-form-item>
        <a-form-item label="权限标识" name="perms">
          <a-input
            v-model:value="formState.perms"
            placeholder="如：menu:list"
          />
        </a-form-item>
        <a-form-item label="角色授权" name="authRoleIds">
          <a-select
            v-model:value="formState.authRoleIds"
            mode="multiple"
            placeholder="请选择角色"
          >
            <a-select-option
              v-for="role in staffRoles"
              :key="role.id"
              :value="role.id"
            >
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="图标" name="icon">
          <a-select
            v-model:value="formState.icon"
            placeholder="请选择图标"
            allow-clear
          >
            <a-select-option v-for="icon in iconList" :key="icon" :value="icon">
              <component :is="getIcon(icon)" style="margin-right: 8px" />
              {{ icon }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序" name="sortOrder">
          <a-input-number
            v-model:value="formState.sortOrder"
            :min="1"
            :max="999"
          />
        </a-form-item>
        <a-form-item label="状态" name="isHidden">
          <a-radio-group v-model:value="formState.isHidden">
            <a-radio :value="0">启用</a-radio>
            <a-radio :value="1">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useMenuStore } from '@/stores/menu'
import {
  PlusOutlined,
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

import { addMenu, updateMenu, deleteMenu, getAllMenus } from '@/api/menu'

const menuStore = useMenuStore()

const loading = ref(false)
const menuData = ref([])
const modalVisible = ref(false)
const modalLoading = ref(false)

const formRef = ref(null)
const editId = ref(null)

// 图标列表
const iconList = [
  'DashboardOutlined',
  'CalendarOutlined',
  'SettingOutlined',
  'AppstoreOutlined',
  'OrderedListOutlined',
  'TeamOutlined',
  'UserOutlined',
  'ShopOutlined',
  'FileOutlined',
  'SafetyOutlined'
]

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
  return iconMap[iconName] || FileOutlined
}

const columns = [
  { title: '菜单标题', dataIndex: 'title', key: 'title', width: 200 },
  { title: '图标', dataIndex: 'icon', key: 'icon', width: 80, align: 'center' },
  { title: '路由路径', dataIndex: 'path', key: 'path' },
  { title: '组件路径', dataIndex: 'component', key: 'component' },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 80,
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'isHidden',
    key: 'isHidden',
    width: 80,
    align: 'center'
  },
  { title: '操作', key: 'action', width: 250, align: 'center' }
]

// 表单数据
const formState = reactive({
  parentId: 0,
  title: '',
  path: '',
  component: '',
  perms: '',
  icon: null,
  authRoleIds: [],
  sortOrder: 1,
  isHidden: 0
})

// 表单校验规则
const formRules = {
  title: [{ required: true, message: '请输入菜单标题', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }]
}

// 弹窗标题
const modalTitle = computed(() => (editId.value ? '编辑菜单' : '新增菜单'))

// 树形数据（用于选择父菜单）
const treeData = computed(() => {
  const buildTree = (data) => {
    return data.map((item) => ({
      value: item.id,
      title: item.title,
      key: item.id,
      children: item.children ? buildTree(item.children) : []
    }))
  }
  return [
    {
      value: 0,
      title: '顶层目录',
      key: 0,
      children: buildTree(menuData.value)
    }
  ]
})

// 员工类型
const staffRoles = computed(() => {
  return menuStore.staffRoles
})
// 获取菜单列表
const fetchMenuList = async () => {
  loading.value = true
  try {
    const res = await getAllMenus()
    menuData.value = res.data || []
  } catch (error) {
    console.error('获取菜单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = (parentRecord) => {
  editId.value = null
  Object.assign(formState, {
    parentId: parentRecord ? parentRecord.id : 0,
    title: '',
    path: '',
    component: '',
    perms: '',
    icon: null,
    authRoleIds: [],
    sortOrder: 1,
    isHidden: 0
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  editId.value = record.id
  Object.assign(formState, {
    parentId: record.parentId || 0,
    title: record.title,
    path: record.path,
    component: record.component || '',
    icon: record.icon,
    authRoleIds: record.authRoleIds,
    sortOrder: record.sortOrder,
    isHidden: record.isHidden
  })
  modalVisible.value = true
}
// 删除
const handleDelete = async (id) => {
  try {
    await deleteMenu(id)
    message.success('删除成功')
    fetchMenuList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    modalLoading.value = true
    const data = { ...formState }

    if (editId.value) {
      await updateMenu({ ...data, id: editId.value })
      message.success('修改成功')
    } else {
      await addMenu(data)
      message.success('新增成功')
    }

    modalVisible.value = false
    fetchMenuList()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    modalLoading.value = false
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchMenuList()
})
</script>

<style scoped>
.menu-management {
  padding: 0;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
