<template>
  <div class="booking-management">
    <!-- 查询条件 -->
    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="会员ID">
          <a-input-number
            v-model:value="searchForm.userId"
            placeholder="请输入会员ID"
            allow-clear
            :min="1"
            style="width: 150px"
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="预约日期">
          <a-range-picker
            :show-time="{ format: 'HH:mm:ss' }"
            v-model:value="dateRange"
            :placeholder="['开始日期', '结束日期']"
            format="YYYY-MM-DD HH:mm:ss"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            style="width: 300px"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="选择状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="0">已取消</a-select-option>
            <a-select-option :value="1">已预约</a-select-option>
            <a-select-option :value="2">已签到</a-select-option>
            <a-select-option :value="3">旷课</a-select-option>
          </a-select>
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
        <span class="card-title">预约记录</span>
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
          <template v-if="column.key === 'username'">
            <span>{{ record.user.username }}</span>
          </template>
          <template v-else-if="column.key === 'scheduleName'">
            <span>{{ record.schedule.course.name }}</span>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            <span>{{ formatDateTime(record.createdAt) }}</span>
          </template>
          <template v-else-if="column.key === 'courseTime'">
            <span
              >{{ record.schedule.scheduleDate }}
              {{ record.schedule.startTime }}-{{
                record.schedule.endTime
              }}</span
            >
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.status === 1"
                type="link"
                size="small"
                @click="handleCancel(record)"
              >
                取消预约
              </a-button>
              <a-popconfirm
                title="确定要删除该预约记录吗？"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getBookingList, cancelBooking, deleteBooking } from '@/api/booking'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref([])
const dateRange = ref([])

// 查询条件
const searchForm = reactive({
  userId: null,
  startTime: '',
  endTime: '',
  status: null,
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
    title: '会员姓名',
    dataIndex: 'username',
    key: 'username',
    width: 120,
    align: 'center'
  },
  {
    title: '课程名',
    dataIndex: 'scheduleName',
    key: 'scheduleName',
    width: 120,
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '预约时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
    align: 'center'
  },
  {
    title: '上课时间',
    dataIndex: 'courseTime',
    key: 'courseTime',
    width: 220,
    align: 'center'
  },
  { title: '操作', key: 'action', width: 150, align: 'center', fixed: 'right' }
]

// 获取预约列表
const fetchBookingList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    }

    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    } else {
      delete params.startTime
      delete params.endTime
    }

    const res = await getBookingList(params)
    tableData.value = res.data?.list || res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    console.error('获取预约列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchBookingList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    userId: null,
    status: null,
    pageNo: 1,
    pageSize: 10
  })
  dateRange.value = []
  pagination.current = 1
  fetchBookingList()
}

// 表格变化（分页、排序等）
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchBookingList()
}

// 取消预约
const handleCancel = async (record) => {
  try {
    await cancelBooking(record.id)
    message.success('取消预约成功')
    fetchBookingList()
  } catch (error) {
    console.error('取消预约失败:', error)
  }
}

// 删除预约
const handleDelete = async (id) => {
  try {
    await deleteBooking(id)
    message.success('删除成功')
    fetchBookingList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    1: 'blue',
    2: 'green',
    3: 'orange',
    4: 'red'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    0: '已取消',
    1: '已预约',
    2: '已签到',
    3: '旷课'
  }
  return textMap[status] || '未知'
}

onMounted(() => {
  fetchBookingList()
})
</script>

<style scoped>
.booking-management {
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

.card-title {
  font-size: 16px;
  font-weight: 500;
}
</style>
