<template>
  <div class="shift-calendar">
    <a-row :gutter="16" class="calendar-container">
      <!-- 左侧日历 -->
      <a-col :span="14">
        <a-card :bordered="false" class="calendar-card">
          <template #title>
            <div class="calendar-header">
              <a-button @click="prevMonth">
                <LeftOutlined />
              </a-button>
              <span class="month-title"
                >{{ currentYear }}年{{ currentMonth }}月</span
              >
              <a-button @click="nextMonth">
                <RightOutlined />
              </a-button>
              <a-button
                type="primary"
                style="margin-left: 16px"
                @click="goToday"
                >今天</a-button
              >
            </div>
          </template>

          <!-- 星期头部 -->
          <div class="calendar-weekdays">
            <div v-for="day in weekdays" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>

          <!-- 日历格子 -->
          <div class="calendar-grid">
            <div
              v-for="(cell, index) in calendarDays"
              :key="index"
              class="calendar-cell"
              :class="{
                'other-month': !cell.currentMonth,
                selected: cell.date === selectedDate,
                today: cell.isToday
              }"
              @click="handleDateClick(cell)"
            >
              <div class="cell-date">{{ cell.day }}</div>
              <div v-if="cell.count > 0" class="cell-badge">
                <a-badge :count="cell.count" :overflow-count="99" />
              </div>
              <div v-if="cell.count > 0" class="cell-label">
                {{ cell.count }} 节课
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧排班列表 -->
      <a-col :span="10">
        <a-card :bordered="false" class="list-card">
          <ScheduleList
            ref="scheduleListRef"
            :selected-date="selectedDate"
            @add="handleAdd"
            @edit="handleEdit"
            @refresh="fetchMonthStatistics"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 排班表单弹窗 -->
    <ScheduleForm
      v-model:open="formVisible"
      :schedule-id="currentScheduleId"
      :default-date="selectedDate"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getMonthStatistics } from '@/api/schedule'
import ScheduleList from './components/ScheduleList.vue'
import ScheduleForm from './components/ScheduleForm.vue'

const scheduleListRef = ref(null)
const formVisible = ref(false)
const currentScheduleId = ref(null)

// 当前年月
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)

// 选中的日期
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

// 月度统计数据
const statisticsMap = reactive({})

// 星期
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 日历数据
const calendarDays = computed(() => {
  const days = []
  const firstDay = dayjs(`${currentYear.value}-${currentMonth.value}-01`)
  const daysInMonth = firstDay.daysInMonth()
  const startWeekday = firstDay.day()

  // 上个月的天数
  const prevMonth = firstDay.subtract(1, 'month')
  const prevMonthDays = prevMonth.daysInMonth()

  // 上个月的日期
  for (let i = startWeekday - 1; i >= 0; i--) {
    const date = prevMonth.date(prevMonthDays - i).format('YYYY-MM-DD')
    days.push({
      date,
      day: prevMonthDays - i,
      currentMonth: false,
      isToday: false,
      count: statisticsMap[date] || 0
    })
  }

  // 当前月的日期
  const today = dayjs().format('YYYY-MM-DD')
  for (let i = 1; i <= daysInMonth; i++) {
    const date = firstDay.date(i).format('YYYY-MM-DD')
    days.push({
      date,
      day: i,
      currentMonth: true,
      isToday: date === today,
      count: statisticsMap[date] || 0
    })
  }

  // 下个月的日期
  const nextMonth = firstDay.add(1, 'month')
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = nextMonth.date(i).format('YYYY-MM-DD')
    days.push({
      date,
      day: i,
      currentMonth: false,
      isToday: false,
      count: statisticsMap[date] || 0
    })
  }

  return days
})

// 获取月度统计
const fetchMonthStatistics = async () => {
  try {
    const res = await getMonthStatistics(currentYear.value, currentMonth.value)
    const data = res.data || []

    // 清空并重新填充
    Object.keys(statisticsMap).forEach((key) => delete statisticsMap[key])
    data.dayDetails.forEach((item) => {
      statisticsMap[item.date] = item.count
    })
  } catch (error) {
    console.error('获取月度统计失败:', error)
  }
}

// 上个月
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
}

// 下个月
const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
}

// 回到今天
const goToday = () => {
  currentYear.value = dayjs().year()
  currentMonth.value = dayjs().month() + 1
  selectedDate.value = dayjs().format('YYYY-MM-DD')
}

// 点击日期
const handleDateClick = (cell) => {
  if (!cell.currentMonth) {
    // 点击非当前月的日期，切换月份
    const clickedDate = dayjs(cell.date)
    currentYear.value = clickedDate.year()
    currentMonth.value = clickedDate.month() + 1
  }
  selectedDate.value = cell.date
}

// 新增排班
const handleAdd = () => {
  currentScheduleId.value = null
  formVisible.value = true
}

// 编辑排班
const handleEdit = (record) => {
  currentScheduleId.value = record.id
  formVisible.value = true
}

// 表单提交成功
const handleFormSuccess = () => {
  scheduleListRef.value?.refresh()
  fetchMonthStatistics()
}

// 监听月份变化
watch([currentYear, currentMonth], () => {
  fetchMonthStatistics()
})

onMounted(() => {
  fetchMonthStatistics()
})
</script>

<style scoped>
.shift-calendar {
  height: calc(100vh - 64px - 32px - 48px);
  padding: 0;
}

.calendar-container {
  height: 100%;
}

.calendar-card,
.list-card {
  height: 100%;
  border-radius: 8px;
}

.calendar-card :deep(.ant-card-body),
.list-card :deep(.ant-card-body) {
  height: calc(100% - 57px);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-title {
  font-size: 18px;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.weekday {
  padding: 12px 0;
  text-align: center;
  font-weight: 500;
  color: #666;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  height: 80px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.calendar-cell:hover {
  background: #f5f5f5;
}

.calendar-cell.other-month {
  opacity: 0.4;
}

.calendar-cell.selected {
  background: #e6f4ff;
  border: 1px solid #1890ff;
}

.calendar-cell.today .cell-date {
  background: #1890ff;
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-date {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.cell-badge {
  margin-top: 4px;
}

.cell-label {
  font-size: 12px;
  color: #1890ff;
  margin-top: 2px;
}

.list-card :deep(.ant-card-body) {
  padding: 16px;
}
</style>
