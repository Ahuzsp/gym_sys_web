<template>
  <div class="merge-pdf">
    <a-card :bordered="false">
      <a-upload-dragger
        v-model:file-list="fileList"
        :multiple="true"
        :before-upload="beforeUpload"
        accept=".pdf"
        @remove="handleRemove"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽PDF文件到此区域</p>
        <p class="ant-upload-hint">支持多个PDF文件，合并顺序为上传顺序</p>
      </a-upload-dragger>

      <div v-if="fileList.length > 0" class="file-list">
        <a-divider>待合并文件列表 ({{ fileList.length }}个)</a-divider>
        <a-list :data-source="fileList" bordered>
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-space>
                <FilePdfOutlined style="color: #1890ff; font-size: 20px" />
                <span>{{ item.name }}</span>
                <a-tag color="blue">{{ formatFileSize(item.size) }}</a-tag>
              </a-space>
              <template #actions>
                <a-button
                  type="link"
                  size="small"
                  :disabled="index === 0"
                  @click="moveUp(index)"
                >
                  上移
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  :disabled="index === fileList.length - 1"
                  @click="moveDown(index)"
                >
                  下移
                </a-button>
                <a-button type="link" size="small" danger @click="handleRemove(index)">
                  删除
                </a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <div class="actions">
        <a-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="fileList.length === 0"
          @click="handleMerge"
        >
          <template #icon><MergeCellsOutlined /></template>
          开始合并
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, FilePdfOutlined, MergeCellsOutlined } from '@ant-design/icons-vue'
import { mergePdf } from '@/api/pdf'

const fileList = ref([])
const loading = ref(false)

const beforeUpload = (file) => {
  if (file.type !== 'application/pdf') {
    message.error('只能上传PDF文件')
    return false
  }
  return false
}

const handleRemove = (index) => {
  if (typeof index === 'number') {
    fileList.value.splice(index, 1)
  }
}

const moveUp = (index) => {
  if (index > 0) {
    const temp = fileList.value[index]
    fileList.value[index] = fileList.value[index - 1]
    fileList.value[index - 1] = temp
  }
}

const moveDown = (index) => {
  if (index < fileList.value.length - 1) {
    const temp = fileList.value[index]
    fileList.value[index] = fileList.value[index + 1]
    fileList.value[index + 1] = temp
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleMerge = async () => {
  if (fileList.value.length === 0) {
    message.warning('请至少上传一个PDF文件')
    return
  }

  loading.value = true
  try {
    const files = fileList.value.map((item) => item.originFileObj || item)
    const blob = await mergePdf(files)

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'merged.pdf'
    a.click()
    window.URL.revokeObjectURL(url)

    message.success('合并成功')
  } catch (error) {
    message.error('合并失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.merge-pdf {
  height: 100%;
  overflow: auto;
}

.file-list {
  margin-top: 24px;
}

.actions {
  margin-top: 24px;
  text-align: center;
}
</style>
