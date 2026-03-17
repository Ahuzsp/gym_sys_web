<template>
  <div class="dashboard">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="今日预约" :value="128" suffix="人">
            <template #prefix>
              <TeamOutlined style="color: #667eea" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="今日课程" :value="12" suffix="节">
            <template #prefix>
              <CalendarOutlined style="color: #52c41a" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="本月新增会员" :value="56" suffix="人">
            <template #prefix>
              <UserOutlined style="color: #faad14" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="本月营收" :value="158900" prefix="¥">
            <template #prefix>
              <ShopOutlined style="color: #f5222d" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="16">
        <a-card title="最近预约">
          <a-table :columns="columns" :data-source="data" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag
                  :color="record.status === '已完成' ? 'success' : 'processing'"
                >
                  {{ record.status }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="快捷操作">
          <a-space direction="vertical" style="width: 100%">
            <a-button type="primary" block>新增预约</a-button>
            <a-button block>会员管理</a-button>
            <a-button block>课程管理</a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons-vue'

const columns = [
  { title: '会员姓名', dataIndex: 'name', key: 'name' },
  { title: '课程', dataIndex: 'course', key: 'course' },
  { title: '教练', dataIndex: 'coach', key: 'coach' },
  { title: '时间', dataIndex: 'time', key: 'time' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

const data = ref([
  {
    key: '1',
    name: '张三',
    course: '瑜伽课',
    coach: '李教练',
    time: '09:00-10:00',
    status: '已完成'
  },
  {
    key: '2',
    name: '李四',
    course: '动感单车',
    coach: '王教练',
    time: '10:00-11:00',
    status: '进行中'
  },
  {
    key: '3',
    name: '王五',
    course: '私教课',
    coach: '赵教练',
    time: '14:00-15:00',
    status: '待开始'
  }
])
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  border-radius: 8px;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: #666;
}

:deep(.ant-statistic-content) {
  font-size: 28px;
}
</style>
