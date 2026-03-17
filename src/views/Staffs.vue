<template>
  <div class="staffs-container">
    <!-- 查询条件 -->
    <a-card :bordered="false">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="关键词">
          <a-input
            style="width: 120px;"
            v-model:value="searchForm.keywords"
            placeholder="姓名/用户名"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            class="common-select"
            v-model:value="searchForm.roleType"
            placeholder="选择角色"
            allow-clear
          >
            <a-select-option :value="1">店长</a-select-option>
            <a-select-option :value="2">教练</a-select-option>
            <a-select-option :value="3">销售</a-select-option>
            <a-select-option :value="4">前台</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            class="common-select"
            v-model:value="searchForm.status"
            placeholder="选择状态"
            allow-clear
          >
            <a-select-option :value="1">在职</a-select-option>
            <a-select-option :value="0">离职</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            class="tag-select"
            v-model:value="searchForm.tags"
            mode="multiple"
            placeholder="选择标签"
            allow-clear
            :maxTagCount="3"
            :options="tagOptions"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格 -->
    <a-card class="list-card" :bordered="false">
      <template #title>
        <div class="list-title">
          <span>员工列表</span>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            新增员工
          </a-button>
        </div>
      </template>

      <a-table
        class="staff-table"
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :style="{ backgroundColor: '#667eea' }">
              {{ record.realName?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'roleType'">
            <a-tag :color="getRoleColor(record.roleType)">
              {{ getRoleName(record.roleType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'tags'">
            <div class="tags-container">
              <a-tag v-for="tag in record.tags" :key="tag" color="blue">{{ tag }}</a-tag>
            </div>
            <span v-if="!record.tags?.length">-</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge :status="record.status === 1 ? 'success' : 'default'" :text="record.status === 1 ? '在职' : '离职'" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm
                title="确定要删除该员工吗？"
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
      :destroy-on-close="true"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formState.username" placeholder="请输入用户名" :disabled="!!editId" />
        </a-form-item>
        <a-form-item label="真实姓名" name="realName">
          <a-input v-model:value="formState.realName" placeholder="请输入真实姓名" />
        </a-form-item>
        <a-form-item v-if="!editId" label="密码" name="password">
          <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="角色" name="roleType">
          <a-select v-model:value="formState.roleType" placeholder="请选择角色">
            <a-select-option :value="1">店长</a-select-option>
            <a-select-option :value="2">教练</a-select-option>
            <a-select-option :value="3">销售</a-select-option>
            <a-select-option :value="4">前台</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="头像" name="avatar">
          <a-input v-model:value="formState.avatar" placeholder="请输入头像URL" />
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="formState.tags"
            mode="tags"
            placeholder="请输入或选择标签"
            :options="tagOptions"
          />
        </a-form-item>
        <a-form-item label="个人简介" name="introduction">
          <a-textarea
            v-model:value="formState.introduction"
            placeholder="请输入个人简介"
            :rows="3"
            :maxlength="200"
            show-count
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio :value="1">在职</a-radio>
            <a-radio :value="0">离职</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getStaffList, addOrUpdateStaff, deleteStaff } from '@/api/staff'

const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const formRef = ref(null)
const editId = ref(null)

// 标签选项
const tagOptions = [
  { value: '游泳' },
  { value: '瑜伽' },
  { value: '健身' },
  { value: '舞蹈' },
  { value: '拳击' },
  { value: '私教' }
]

// 查询条件
const searchForm = reactive({
  keywords: '',
  roleType: undefined,
  status: undefined,
  tags: [],
  pageNo: 1,
  pageSize: 10
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
})

// 表格列配置
const columns = [
  { title: '头像', dataIndex: 'avatar', key: 'avatar', width: 80, align: 'center' },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120, align: 'center' },
  { title: '真实姓名', dataIndex: 'realName', key: 'realName', width: 150, align: 'center' },
  { title: '角色', dataIndex: 'roleType', key: 'roleType', width: 100, align: 'center' },
  { title: '标签', dataIndex: 'tags', key: 'tags', width: 150, align: 'center' },
  { title: '个人简介', dataIndex: 'introduction', key: 'introduction', align: 'center', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center', fixed: 'right' }
]

// 表单数据
const formState = reactive({
  username: '',
  realName: '',
  password: '',
  roleType: undefined,
  avatar: '',
  tags: [],
  introduction: '',
  status: 1
})

// 表单校验规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  roleType: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 弹窗标题
const modalTitle = computed(() => (editId.value ? '编辑员工' : '新增员工'))

// 角色相关
const getRoleName = (roleType) => {
  const roleMap = { 1: '店长', 2: '教练', 3: '销售', 4: '前台' }
  return roleMap[roleType] || '-'
}

const getRoleColor = (roleType) => {
  const colorMap = { 1: 'red', 2: 'green', 3: 'blue', 4: 'orange' }
  return colorMap[roleType] || 'default'
}

// 获取员工列表
const fetchStaffList = async () => {
  loading.value = true
  try {
    const res = await getStaffList({
      ...searchForm,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    console.error('获取员工列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchStaffList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keywords: '',
    roleType: undefined,
    status: undefined,
    tags: [],
    pageNo: 1,
    pageSize: 10
  })
  pagination.current = 1
  fetchStaffList()
}

// 表格变化（分页、排序等）
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchStaffList()
}

// 新增
const handleAdd = () => {
  editId.value = null
  Object.assign(formState, {
    username: '',
    realName: '',
    password: '',
    roleType: undefined,
    avatar: '',
    tags: [],
    introduction: '',
    status: 1
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  editId.value = record.id
  Object.assign(formState, {
    username: record.username,
    realName: record.realName,
    password: '',
    roleType: record.roleType,
    avatar: record.avatar || '',
    tags: record.tags || [],
    introduction: record.introduction || '',
    status: record.status
  })
  modalVisible.value = true
}

// 删除
const handleDelete = async (id) => {
  try {
    await deleteStaff(id)
    message.success('删除成功')
    fetchStaffList()
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
      await addOrUpdateStaff({ ...data, id: editId.value })
      message.success('修改成功')
    } else {
      await addOrUpdateStaff(data)
      message.success('新增成功')
    }
    
    modalVisible.value = false
    fetchStaffList()
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
  fetchStaffList()
})
</script>

<style scoped lang="less">
.staffs-container {
  height: 100%;
  overflow: auto;
  .search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .common-select {
    width: 100px;
  }
  .tag-select {
    width: 270px;
  }
  .list-card {
    .list-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    .ant-tag {
      margin-inline-end: unset;
    }
  }
}
</style>
