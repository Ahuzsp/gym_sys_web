<template>
  <div class="member-management">
    <!-- 查询条件 -->
    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchForm.keywords"
            placeholder="姓名/手机号"
            allow-clear
            style="width: 200px"
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="性别">
          <a-select
            v-model:value="searchForm.gender"
            placeholder="选择性别"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
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
        <div class="card-header">
          <span class="card-title">会员列表</span>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            新增会员
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
          <template v-if="column.key === 'username'">
            <div class="member-info">
              <a-avatar
                :style="{
                  backgroundColor: record.gender === 1 ? '#1890ff' : '#eb2f96'
                }"
              >
                {{ record.username?.charAt(0) }}
              </a-avatar>
              <span class="member-name">{{ record.username }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'gender'">
            <a-tag :color="record.gender === 1 ? 'blue' : 'pink'">
              {{ record.gender === 1 ? '男' : '女' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'balance'">
            <span class="balance"
              >¥{{ record.balance?.toFixed(2) || '0.00' }}</span
            >
          </template>
          <template v-else-if="column.key === 'points'">
            <span class="points">{{ record.points || 0 }}</span>
          </template>
          <template v-else-if="column.key === 'notes'">
            <a-tooltip v-if="record.notes" :title="record.notes">
              <span class="notes-text">{{ record.notes }}</span>
            </a-tooltip>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)"
                >编辑</a-button
              >
              <a-button type="link" size="small" @click="handleRecharge(record)"
                >充值</a-button
              >
              <a-button type="link" size="small" @click="handlePoints(record)"
                >积分</a-button
              >
              <a-button type="link" size="small" @click="handleBooking(record)"
                >预约</a-button
              >
              <a-popconfirm
                title="确定要删除该会员吗？"
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
      width="500px"
      :destroy-on-close="true"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="姓名" name="username">
          <a-input v-model:value="formState.username" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="性别" name="gender">
          <a-radio-group v-model:value="formState.gender">
            <a-radio :value="1">男</a-radio>
            <a-radio :value="2">女</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="余额" name="balance">
          <a-input-number
            v-model:value="formState.balance"
            :min="0"
            :precision="2"
            placeholder="请输入余额"
            style="width: 100%"
            addon-before="¥"
          />
        </a-form-item>
        <a-form-item label="积分" name="points">
          <a-input-number
            v-model:value="formState.points"
            :min="0"
            placeholder="请输入积分"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="备注" name="notes">
          <a-textarea
            v-model:value="formState.notes"
            placeholder="请输入备注"
            :rows="3"
            :maxlength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 充值弹窗 -->
    <a-modal
      v-model:open="rechargeVisible"
      title="会员充值"
      :confirm-loading="rechargeLoading"
      @ok="handleRechargeSubmit"
      @cancel="rechargeVisible = false"
      width="400px"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="会员姓名">
          <span>{{ currentMember?.username }}</span>
        </a-form-item>
        <a-form-item label="当前余额">
          <span class="balance"
            >¥{{ currentMember?.balance?.toFixed(2) || '0.00' }}</span
          >
        </a-form-item>
        <a-form-item label="充值金额">
          <a-input-number
            v-model:value="rechargeAmount"
            :min="0.01"
            :precision="2"
            placeholder="请输入充值金额"
            style="width: 100%"
            addon-before="¥"
          />
        </a-form-item>
        <a-form-item label="充值后余额">
          <span class="balance"
            >¥{{
              ((currentMember?.balance || 0) + (rechargeAmount || 0)).toFixed(2)
            }}</span
          >
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 积分调整弹窗 -->
    <a-modal
      v-model:open="pointsVisible"
      title="积分调整"
      :confirm-loading="pointsLoading"
      @ok="handlePointsSubmit"
      @cancel="pointsVisible = false"
      width="400px"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="会员姓名">
          <span>{{ currentMember?.username }}</span>
        </a-form-item>
        <a-form-item label="当前积分">
          <span class="points">{{ currentMember?.points || 0 }}</span>
        </a-form-item>
        <a-form-item label="调整类型">
          <a-radio-group v-model:value="pointsType">
            <a-radio :value="1">增加</a-radio>
            <a-radio :value="2">扣减</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="调整数量">
          <a-input-number
            v-model:value="pointsAmount"
            :min="1"
            placeholder="请输入调整数量"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="调整后积分">
          <span class="points">{{ computedPoints }}</span>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 预约弹窗 -->
    <a-modal
      v-model:open="bookingVisible"
      title="会员预约"
      :confirm-loading="bookingLoading"
      @ok="handleBookingSubmit"
      @cancel="bookingVisible = false"
      width="500px"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="会员姓名">
          <span>{{ currentMember?.username }}</span>
        </a-form-item>
        <a-form-item label="会员ID">
          <span>{{ currentMember?.id }}</span>
        </a-form-item>
        <a-form-item label="预约日期">
          <a-date-picker
            v-model:value="bookingForm.bookingDate"
            placeholder="请选择预约日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            style="width: 100%"
            @change="handleDateChange"
          />
        </a-form-item>
        <a-form-item label="选择课程">
          <a-select
            v-model:value="bookingForm.scheduleId"
            placeholder="请选择课程"
            :loading="scheduleLoading"
            :disabled="!bookingForm.bookingDate"
            show-search
            :filter-option="filterScheduleOption"
          >
            <a-select-option
              v-for="schedule in scheduleList"
              :key="schedule.id"
              :value="schedule.id"
            >
              {{ schedule.course.name }} - {{ schedule.coach.realName }} -
              {{ formatScheduleTime(schedule) }}
            </a-select-option>
          </a-select>
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
import {
  getMemberPage,
  saveOrUpdateMember,
  deleteMember,
  updateBalance,
  updatePoints
} from '@/api/member'
import { saveOrUpdateBooking } from '@/api/booking'
import { getScheduleByDate } from '@/api/schedule'

const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const formRef = ref(null)
const editId = ref(null)

// 充值相关
const rechargeVisible = ref(false)
const rechargeLoading = ref(false)
const currentMember = ref(null)
const rechargeAmount = ref(0)

// 积分调整相关
const pointsVisible = ref(false)
const pointsLoading = ref(false)
const pointsType = ref(1) // 1: 增加, 2: 扣减
const pointsAmount = ref(0)

// 预约相关
const bookingVisible = ref(false)
const bookingLoading = ref(false)
const scheduleLoading = ref(false)
const scheduleList = ref([])
const bookingForm = reactive({
  bookingDate: undefined,
  scheduleId: undefined
})

// 计算调整后积分
const computedPoints = computed(() => {
  const current = currentMember.value?.points || 0
  const amount = pointsAmount.value || 0
  return pointsType.value === 1
    ? current + amount
    : Math.max(0, current - amount)
})

// 查询条件
const searchForm = reactive({
  keywords: '',
  gender: undefined,
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
  { title: '会员信息', dataIndex: 'username', key: 'username', width: 180 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    width: 80,
    align: 'center'
  },
  {
    title: '余额',
    dataIndex: 'balance',
    key: 'balance',
    width: 120,
    align: 'right'
  },
  {
    title: '积分',
    dataIndex: 'points',
    key: 'points',
    width: 100,
    align: 'right'
  },
  { title: '备注', dataIndex: 'notes', key: 'notes', ellipsis: true },
  { title: '操作', key: 'action', width: 250, align: 'center', fixed: 'right' }
]

// 表单数据
const formState = reactive({
  username: '',
  phone: '',
  gender: 1,
  balance: 0,
  points: 0,
  notes: ''
})

// 表单校验规则
const formRules = {
  username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
}

// 弹窗标题
const modalTitle = computed(() => (editId.value ? '编辑会员' : '新增会员'))

// 获取会员列表
const fetchMemberList = async () => {
  loading.value = true
  try {
    const res = await getMemberPage({
      ...searchForm,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data?.list || res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    console.error('获取会员列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchMemberList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keywords: '',
    gender: undefined,
    pageNo: 1,
    pageSize: 10
  })
  pagination.current = 1
  fetchMemberList()
}

// 表格变化（分页、排序等）
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchMemberList()
}

// 新增
const handleAdd = () => {
  editId.value = null
  Object.assign(formState, {
    username: '',
    phone: '',
    gender: 1,
    balance: 0,
    points: 0,
    notes: ''
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  editId.value = record.id
  Object.assign(formState, {
    username: record.username,
    phone: record.phone,
    gender: record.gender,
    balance: record.balance || 0,
    points: record.points || 0,
    notes: record.notes || ''
  })
  modalVisible.value = true
}

// 充值
const handleRecharge = (record) => {
  currentMember.value = record
  rechargeAmount.value = 0
  rechargeVisible.value = true
}

// 充值提交
const handleRechargeSubmit = async () => {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) {
    message.warning('请输入充值金额')
    return
  }

  rechargeLoading.value = true
  try {
    await updateBalance({
      id: currentMember.value.id,
      amount: rechargeAmount.value
    })
    message.success('充值成功')
    rechargeVisible.value = false
    fetchMemberList()
  } catch (error) {
    console.error('充值失败:', error)
  } finally {
    rechargeLoading.value = false
  }
}

// 积分调整
const handlePoints = (record) => {
  currentMember.value = record
  pointsType.value = 1
  pointsAmount.value = 0
  pointsVisible.value = true
}

// 积分调整提交
const handlePointsSubmit = async () => {
  if (!pointsAmount.value || pointsAmount.value <= 0) {
    message.warning('请输入调整数量')
    return
  }

  // 扣减时检查是否足够
  if (
    pointsType.value === 2 &&
    pointsAmount.value > (currentMember.value?.points || 0)
  ) {
    message.warning('扣减积分不能超过当前积分')
    return
  }

  pointsLoading.value = true
  try {
    await updatePoints({
      id: currentMember.value.id,
      amount: pointsType.value === 1 ? pointsAmount.value : -pointsAmount.value
    })
    message.success('积分调整成功')
    pointsVisible.value = false
    fetchMemberList()
  } catch (error) {
    console.error('积分调整失败:', error)
  } finally {
    pointsLoading.value = false
  }
}

// 预约
const handleBooking = (record) => {
  currentMember.value = record
  bookingForm.bookingDate = undefined
  bookingForm.scheduleId = undefined
  scheduleList.value = []
  bookingVisible.value = true
}

// 日期改变时加载课程
const handleDateChange = async (date) => {
  if (!date) {
    scheduleList.value = []
    bookingForm.scheduleId = undefined
    return
  }

  scheduleLoading.value = true
  bookingForm.scheduleId = undefined
  try {
    const res = await getScheduleByDate(date)
    scheduleList.value = res.data || []
  } catch (error) {
    console.error('获取排期课程失败:', error)
    message.error('获取排期课程失败')
    scheduleList.value = []
  } finally {
    scheduleLoading.value = false
  }
}

// 禁用过去的日期
const disabledDate = (current) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return current && current < today
}

// 预约提交
const handleBookingSubmit = async () => {
  if (!bookingForm.bookingDate) {
    message.warning('请选择预约日期')
    return
  }

  if (!bookingForm.scheduleId) {
    message.warning('请选择课程')
    return
  }

  bookingLoading.value = true
  try {
    await saveOrUpdateBooking({
      userId: currentMember.value.id,
      scheduleId: bookingForm.scheduleId
    })
    message.success('预约成功')
    bookingVisible.value = false
  } catch (error) {
    console.error('预约失败:', error)
  } finally {
    bookingLoading.value = false
  }
}

// 格式化课程时间
const formatScheduleTime = (schedule) => {
  if (!schedule.startTime || !schedule.endTime) return ''
  return `${schedule.scheduleDate}-${schedule.startTime}~${schedule.endTime}`
}

// 课程筛选
const filterScheduleOption = (input, option) => {
  const schedule = scheduleList.value.find((s) => s.id === option.value)
  if (!schedule) return false
  const searchText =
    `${schedule.courseName} ${schedule.teacherName}`.toLowerCase()
  return searchText.includes(input.toLowerCase())
}

// 删除
const handleDelete = async (id) => {
  try {
    await deleteMember(id)
    message.success('删除成功')
    fetchMemberList()
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

    await saveOrUpdateMember(data)
    message.success(editId.value ? '修改成功' : '新增成功')
    modalVisible.value = false
    fetchMemberList()
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
  fetchMemberList()
})
</script>

<style scoped>
.member-management {
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

.member-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-name {
  font-weight: 500;
}

.balance {
  color: #52c41a;
  font-weight: 600;
}

.points {
  color: #fa8c16;
  font-weight: 500;
}

.notes-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
