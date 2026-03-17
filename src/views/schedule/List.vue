<template>
  <div class="course-list">
    <!-- 查询条件 -->
    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchForm.keywords"
            placeholder="课程名称"
            allow-clear
            style="width: 200px"
            @pressEnter="handleSearch"
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
    <a-card :bordered="false" class="table-card">
      <template #title>
        <div class="card-header">
          <span class="card-title">课程列表</span>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            新增课程
          </a-button>
        </div>
      </template>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'coverUrl'">
            <a-image
              :src="record.coverUrl"
              :width="80"
              :height="60"
              :fallback="defaultCover"
              style="object-fit: cover; border-radius: 4px"
            />
          </template>
          <template v-else-if="column.key === 'duration'">
            {{ record.duration }} 分钟
          </template>
          <template v-else-if="column.key === 'calories'">
            <span style="color: #52c41a; font-weight: 500">{{
              record.calories
            }}</span>
            kcal
          </template>
          <template v-else-if="column.key === 'description'">
            <a-tooltip v-if="record.description" :title="record.description">
              <span class="description-text">{{ record.description }}</span>
            </a-tooltip>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确定要删除该课程吗？"
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
        <a-form-item label="课程名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入课程名称" />
        </a-form-item>
        <a-form-item label="课程封面" name="coverUrl">
          <a-input
            v-model:value="formState.coverUrl"
            placeholder="请输入封面图片URL"
          />
          <div v-if="formState.coverUrl" class="cover-preview">
            <a-image
              :src="formState.coverUrl"
              :width="120"
              :height="90"
              style="object-fit: cover; border-radius: 4px"
            />
          </div>
        </a-form-item>
        <a-form-item label="课程时长" name="duration">
          <a-input-number
            v-model:value="formState.duration"
            :min="1"
            :max="300"
            placeholder="请输入时长"
            style="width: 100%"
            addon-after="分钟"
          />
        </a-form-item>
        <a-form-item label="消耗卡路里" name="calories">
          <a-input-number
            v-model:value="formState.calories"
            :min="0"
            :max="5000"
            placeholder="请输入预计消耗卡路里"
            style="width: 100%"
            addon-after="kcal"
          />
        </a-form-item>
        <a-form-item label="课程详情" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="请输入课程详情"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { getCoursePage, saveOrUpdateCourse, deleteCourse } from '@/api/course'

const defaultCover =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWwseivhTwvdGV4dD48L3N2Zz4='

const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const formRef = ref(null)
const editId = ref(null)

// 查询条件
const searchForm = reactive({
  keywords: '',
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
  {
    title: '封面',
    dataIndex: 'coverUrl',
    key: 'coverUrl',
    width: 120,
    align: 'center'
  },
  { title: '课程名称', dataIndex: 'name', key: 'name', width: 180 },
  {
    title: '时长',
    dataIndex: 'duration',
    key: 'duration',
    width: 100,
    align: 'center'
  },
  {
    title: '消耗卡路里',
    dataIndex: 'calories',
    key: 'calories',
    width: 120,
    align: 'center'
  },
  {
    title: '课程详情',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  { title: '操作', key: 'action', width: 150, align: 'center', fixed: 'right' }
]

// 表单数据
const formState = reactive({
  name: '',
  coverUrl: '',
  duration: 45,
  calories: 300,
  description: ''
})

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入课程时长', trigger: 'blur' }],
  calories: [{ required: true, message: '请输入消耗卡路里', trigger: 'blur' }]
}

// 弹窗标题
const modalTitle = computed(() => (editId.value ? '编辑课程' : '新增课程'))

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true
  try {
    const res = await getCoursePage({
      ...searchForm,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data?.list || res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    console.error('获取课程列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchCourseList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keywords: '',
    pageNo: 1,
    pageSize: 10
  })
  pagination.current = 1
  fetchCourseList()
}

// 表格变化（分页、排序等）
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchCourseList()
}

// 新增
const handleAdd = () => {
  editId.value = null
  Object.assign(formState, {
    name: '',
    coverUrl: '',
    duration: 45,
    calories: 300,
    description: ''
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  editId.value = record.id
  Object.assign(formState, {
    name: record.name,
    coverUrl: record.coverUrl || '',
    duration: record.duration,
    calories: record.calories,
    description: record.description || ''
  })
  modalVisible.value = true
}

// 删除
const handleDelete = async (id) => {
  try {
    await deleteCourse(id)
    message.success('删除成功')
    fetchCourseList()
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
      data.id = editId.value
    }

    await saveOrUpdateCourse(data)
    message.success(editId.value ? '修改成功' : '新增成功')
    modalVisible.value = false
    fetchCourseList()
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
  fetchCourseList()
})
</script>

<style scoped>
.course-list {
  height: 100%;
  overflow: auto;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
}

.description-text {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-preview {
  margin-top: 8px;
}
</style>
