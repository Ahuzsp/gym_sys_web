<template>
  <div class="schedule-list">
    <div class="list-header">
      <span class="date-title">{{ formatDate(selectedDate) }}</span>
      <a-button type="primary" size="small" @click="$emit('add')">
        <template #icon><PlusOutlined /></template>
        新增排班
      </a-button>
    </div>

    <div v-if="scheduleList.length === 0" class="empty-state">
      <p>暂无排班数据</p>
    </div>

    <div v-else class="schedule-cards">
      <div
        v-for="item in scheduleList"
        :key="item.id"
        class="schedule-card"
        :class="{ 'status-disabled': item.status === 0 }"
      >
        <div class="card-header">
          <span class="course-name">{{ item.course.name || '未知课程' }}</span>
          <a-tag :color="getStatusColor(item.status)">
            {{ getStatusText(item.status) }}
          </a-tag>
        </div>

        <div class="card-body">
          <div class="info-row">
            <ClockCircleOutlined />
            <span>{{ item.startTime }} - {{ item.endTime }}</span>
          </div>
          <div class="info-row">
            <UserOutlined />
            <span>{{ item.coach.realName || '待分配' }}</span>
          </div>
          <div class="info-row">
            <TeamOutlined />
            <span
              >{{ item.currentParticipants || 0 }} /
              {{ item.maxParticipants }} 人</span
            >
          </div>
        </div>

        <div class="card-footer">
          <a-space>
            <a-button size="small" @click="$emit('edit', item)">编辑</a-button>
            <a-button size="small" @click="handleUpdateParticipants(item)"
              >调整人数</a-button
            >
            <a-popconfirm
              title="确定删除此排班吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(item.id)"
            >
              <a-button size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 调整人数弹窗 -->
    <a-modal
      v-model:open="participantsVisible"
      title="调整参与人数"
      @ok="handleParticipantsSubmit"
      width="360px"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="课程">
          <span>{{ currentItem?.course?.name }}</span>
        </a-form-item>
        <a-form-item label="当前人数">
          <span>{{ currentItem?.currentParticipants || 0 }} 人</span>
        </a-form-item>
        <a-form-item label="最大人数">
          <span>{{ currentItem?.maxParticipants }} 人</span>
        </a-form-item>
        <a-form-item label="调整人数">
          <a-input-number
            v-model:value="newParticipants"
            :min="0"
            :max="currentItem?.maxParticipants || 100"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'
import {
  getScheduleByDate,
  deleteSchedule,
  updateParticipants
} from '@/api/schedule'

const props = defineProps({
  selectedDate: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['add', 'edit', 'refresh'])

const loading = ref(false)
const scheduleList = ref([])
const participantsVisible = ref(false)
const currentItem = ref(null)
const newParticipants = ref(0)

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    1: 'success',
    0: 'default',
    2: 'warning'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    1: '待开始',
    0: '已取消',
    2: '进行中',
    3: '已结束'
  }
  return textMap[status] || '未知'
}

// 获取排班列表
const fetchScheduleList = async () => {
  if (!props.selectedDate) return

  loading.value = true
  try {
    const res = await getScheduleByDate(props.selectedDate)
    scheduleList.value = res.data || []
  } catch (error) {
    console.error('获取排班列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 删除排班
const handleDelete = async (id) => {
  try {
    await deleteSchedule(id)
    message.success('删除成功')
    fetchScheduleList()
    emit('refresh')
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 打开调整人数弹窗
const handleUpdateParticipants = (item) => {
  currentItem.value = item
  newParticipants.value = item.currentParticipants || 0
  participantsVisible.value = true
}

// 提交人数调整
const handleParticipantsSubmit = async () => {
  try {
    await updateParticipants({
      id: currentItem.value.id,
      amount: newParticipants.value
    })
    message.success('调整成功')
    participantsVisible.value = false
    fetchScheduleList()
  } catch (error) {
    console.error('调整失败:', error)
  }
}

// 监听日期变化
watch(
  () => props.selectedDate,
  () => {
    fetchScheduleList()
  },
  { immediate: true }
)

// 暴露刷新方法
defineExpose({
  refresh: fetchScheduleList
})
</script>

<style scoped>
.schedule-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.date-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
}

.schedule-cards {
  flex: 1;
  overflow-y: auto;
}

.schedule-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.schedule-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.schedule-card.status-disabled {
  background: #fafafa;
  opacity: 0.7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.course-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.card-body {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 13px;
  margin-bottom: 6px;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
