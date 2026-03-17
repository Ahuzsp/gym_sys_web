<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑排班' : '新增排班'"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="520px"
    :destroy-on-close="true"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="formRules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="日期" name="scheduleDate">
        <a-date-picker
          v-model:value="formState.scheduleDate"
          :disabled="isEdit"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </a-form-item>

      <a-form-item label="课程" name="courseId">
        <a-select
          v-model:value="formState.courseId"
          placeholder="请选择课程"
          show-search
          :filter-option="filterCourse"
          @change="handleCourseChange"
        >
          <a-select-option
            v-for="course in courseList"
            :key="course.id"
            :value="course.id"
          >
            {{ course.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="教练" name="coachId">
        <a-select
          v-model:value="formState.coachId"
          placeholder="请选择教练"
          allow-clear
        >
          <a-select-option
            v-for="coach in coachList"
            :key="coach.id"
            :value="coach.id"
          >
            {{ coach.realName }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="时间" required>
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item name="startTime" no-style>
              <a-time-picker
                v-model:value="formState.startTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="开始时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="endTime" no-style>
              <a-time-picker
                v-model:value="formState.endTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="结束时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item label="最大人数" name="maxParticipants">
        <a-input-number
          v-model:value="formState.maxParticipants"
          :min="1"
          :max="100"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formState.status">
          <a-radio :value="1">待开始</a-radio>
          <a-radio :value="0">已取消</a-radio>
          <a-radio :value="2">进行中</a-radio>
          <a-radio :value="3">已结束</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getScheduleDetail, addSchedule, updateSchedule } from '@/api/schedule'
import { getCoursePage } from '@/api/course'
import { getStaffList } from '@/api/staff'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  scheduleId: {
    type: Number,
    default: null
  },
  defaultDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:open', 'success'])

const formRef = ref(null)
const loading = ref(false)
const courseList = ref([])
const coachList = ref([])

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const isEdit = computed(() => !!props.scheduleId)

const formState = reactive({
  scheduleDate: '',
  courseId: undefined,
  coachId: undefined,
  startTime: '',
  endTime: '',
  maxParticipants: 20,
  currentParticipants: 0,
  status: 1
})

const formRules = {
  scheduleDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  maxParticipants: [
    { required: true, message: '请输入最大人数', trigger: 'blur' }
  ]
}

// 获取课程列表
const fetchCourseList = async () => {
  try {
    const res = await getCoursePage({ pageNo: 1, pageSize: 100 })
    courseList.value = res.data?.list || res.data?.records || []
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 获取教练列表
const fetchCoachList = async () => {
  try {
    const res = await getStaffList({
      roleType: 2,
      pageNo: 1,
      pageSize: 100,
      status: 1
    })
    coachList.value = res.data?.list || res.data?.records || []
  } catch (error) {
    console.error('获取教练列表失败:', error)
  }
}

// 获取排班详情
const fetchScheduleDetail = async () => {
  if (!props.scheduleId) return

  loading.value = true
  try {
    const res = await getScheduleDetail(props.scheduleId)
    const data = res.data
    Object.assign(formState, {
      scheduleDate: data.scheduleDate,
      courseId: data.courseId,
      coachId: data.coachId,
      startTime: data.startTime,
      endTime: data.endTime,
      maxParticipants: data.maxParticipants,
      currentParticipants: data.currentParticipants,
      status: data.status
    })
  } catch (error) {
    console.error('获取排班详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 课程选择变化
const handleCourseChange = (courseId) => {
  const course = courseList.value.find((c) => c.id === courseId)
  if (course) {
    formState.maxParticipants = course.maxParticipants || 20
  }
}

// 课程筛选
const filterCourse = (input, option) => {
  return option.children[0].children.toLowerCase().includes(input.toLowerCase())
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    loading.value = true
    const data = { ...formState }

    if (isEdit.value) {
      data.id = props.scheduleId
      await updateSchedule(data)
      message.success('更新成功')
    } else {
      await addSchedule(data)
      message.success('新增成功')
    }

    visible.value = false
    emit('success')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 重置表单
const resetForm = () => {
  Object.assign(formState, {
    scheduleDate: props.defaultDate || dayjs().format('YYYY-MM-DD'),
    courseId: undefined,
    coachId: undefined,
    startTime: '',
    endTime: '',
    maxParticipants: 20,
    currentParticipants: 0,
    status: 1
  })
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    fetchCourseList()
    fetchCoachList()

    if (props.scheduleId) {
      fetchScheduleDetail()
    } else {
      resetForm()
    }
  }
})
</script>
