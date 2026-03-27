<template>
  <div class="split-pdf">
    <a-row :gutter="16">
      <!-- <a-col :span="12">
        <a-card title="拆分为单页" :bordered="false">
          <a-upload-dragger
            v-model:file-list="singleFileList"
            :multiple="false"
            :before-upload="beforeUpload"
            accept=".pdf"
            :show-upload-list="false"
            @change="handleSingleFileChange"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽PDF文件</p>
            <p class="ant-upload-hint">将PDF的每一页拆分为单独文件</p>
          </a-upload-dragger>

          <div v-if="singleFile" class="file-info">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="文件名">{{ singleFile.name }}</a-descriptions-item>
              <a-descriptions-item label="文件大小">
                {{ formatFileSize(singleFile.size) }}
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <a-button
            type="primary"
            block
            :loading="singleLoading"
            :disabled="!singleFile"
            style="margin-top: 16px"
            @click="handleSplitSingle"
          >
            开始拆分
          </a-button>
        </a-card>
      </a-col> -->

      <a-col :span="24">
        <a-card title="按页码范围拆分" :bordered="false">
          <a-upload-dragger
            v-model:file-list="rangeFileList"
            :multiple="false"
            :before-upload="beforeUpload"
            accept=".pdf"
            @change="handleRangeFileChange"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽PDF文件</p>
            <p class="ant-upload-hint">提取指定页码范围的PDF</p>
          </a-upload-dragger>

          <div v-if="rangeFile" class="file-info">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="文件名">{{ rangeFile.name }}</a-descriptions-item>
              <a-descriptions-item label="文件大小">
                {{ formatFileSize(rangeFile.size) }}
              </a-descriptions-item>
              <a-descriptions-item label="操作">
                <a-button type="link" danger size="small" @click="handleRemoveRangeFile">
                  删除文件
                </a-button>
              </a-descriptions-item>
            </a-descriptions>

            <a-form :model="rangeForm" layout="vertical" style="margin-top: 16px">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="起始页码">
                    <a-input-number
                      v-model:value="rangeForm.startPage"
                      :min="1"
                      placeholder="起始页"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="结束页码">
                    <a-input-number
                      v-model:value="rangeForm.endPage"
                      :min="1"
                      placeholder="结束页"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>

          <a-button
            type="primary"
            block
            :loading="rangeLoading"
            :disabled="!rangeFile || !rangeForm.startPage || !rangeForm.endPage"
            @click="handleSplitRange"
          >
            开始拆分
          </a-button>
        </a-card>
      </a-col>
    </a-row>

    <!-- 拆分结果弹窗 -->
    <a-modal
      v-model:open="resultVisible"
      title="拆分结果"
      width="700px"
      :footer="null"
    >
      <a-list :data-source="resultList" bordered>
        <template #renderItem="{ item, index }">
          <a-list-item>
            <a-space>
              <FilePdfOutlined style="color: #1890ff; font-size: 20px" />
              <span>第 {{ item.pageNumber || index + 1 }} 页</span>
            </a-space>
            <template #actions>
              <a-button type="link" size="small" @click="handleDownload(item)">
                下载
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, FilePdfOutlined } from '@ant-design/icons-vue'
import { splitPdf, splitPdfByRange } from '@/api/pdf'

const singleFileList = ref([])
const rangeFileList = ref([])
const singleFile = ref(null)
const rangeFile = ref(null)
const singleLoading = ref(false)
const rangeLoading = ref(false)
const resultVisible = ref(false)
const resultList = ref([])

const rangeForm = reactive({
  startPage: 1,
  endPage: 1
})

const beforeUpload = (file) => {
  if (file.type !== 'application/pdf') {
    message.error('只能上传PDF文件')
    return false
  }
  return false
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleSingleFileChange = (info) => {
  if (info.fileList.length > 0) {
    singleFile.value = info.fileList[0].originFileObj || info.fileList[0]
  } else {
    singleFile.value = null
  }
}

const handleRangeFileChange = (info) => {
  if (info.fileList.length > 0) {
    rangeFile.value = info.fileList[0].originFileObj || info.fileList[0]
  } else {
    rangeFile.value = null
  }
}

const handleRemoveRangeFile = () => {
  rangeFileList.value = []
  rangeFile.value = null
}

const handleSplitSingle = async () => {
  if (!singleFile.value) {
    message.warning('请选择PDF文件')
    return
  }

  singleLoading.value = true
  try {
    const res = await splitPdf(singleFile.value)
    resultList.value = res.data.pdfUrls.map((url, index) => ({
      pageNumber: index + 1,
      url: url
    }))
    resultVisible.value = true
    message.success(`成功拆分为 ${res.data.totalPages} 页`)
  } catch (error) {
    message.error('拆分失败：' + (error.message || '未知错误'))
  } finally {
    singleLoading.value = false
  }
}

const handleSplitRange = async () => {
  if (!rangeFile.value) {
    message.warning('请选择PDF文件')
    return
  }

  if (!rangeForm.startPage || !rangeForm.endPage) {
    message.warning('请输入页码范围')
    return
  }

  if (rangeForm.startPage > rangeForm.endPage) {
    message.warning('起始页码不能大于结束页码')
    return
  }

  rangeLoading.value = true
  try {
    const blob = await splitPdfByRange(
      rangeFile.value,
      rangeForm.startPage,
      rangeForm.endPage
    )

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `split_pages_${rangeForm.startPage}-${rangeForm.endPage}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)

    message.success('拆分成功')
  } catch (error) {
    message.error('拆分失败：' + (error.message || '未知错误'))
  } finally {
    rangeLoading.value = false
  }
}

const handleDownload = (item) => {
  window.open(item.url, '_blank')
}
</script>

<style scoped>
.split-pdf {
  height: 100%;
}

.file-info {
  margin-top: 16px;
}
</style>
