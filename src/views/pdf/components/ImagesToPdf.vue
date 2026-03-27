<template>
  <div class="images-to-pdf">
    <a-card :bordered="false">
      <a-upload-dragger
        v-model:file-list="fileList"
        :multiple="true"
        :before-upload="beforeUpload"
        accept="image/*"
        @remove="handleRemove"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽图片文件到此区域</p>
        <p class="ant-upload-hint">支持 PNG、JPEG、JPG 格式，图片顺序即为PDF页面顺序</p>
      </a-upload-dragger>

      <div v-if="fileList.length > 0" class="image-list">
        <a-divider>图片列表 ({{ fileList.length }}张)</a-divider>
        <a-row :gutter="[16, 16]">
          <a-col v-for="(file, index) in fileList" :key="index" :span="6">
            <a-card hoverable>
              <template #cover>
                <div class="image-wrapper">
                  <a-image
                    :alt="file.name"
                    :src="getImageUrl(file)"
                    :preview="{
                      visible: false,
                      onVisibleChange: (vis) => handlePreview(vis, index)
                    }"
                  />
                  <div class="image-overlay">
                    <a-space direction="vertical">
                      <a-button
                        type="primary"
                        size="small"
                        @click="handlePreview(true, index)"
                      >
                        预览
                      </a-button>
                      <a-space>
                        <a-button
                          type="primary"
                          size="small"
                          :disabled="index === 0"
                          @click="moveUp(index)"
                        >
                          上移
                        </a-button>
                        <a-button
                          type="primary"
                          size="small"
                          :disabled="index === fileList.length - 1"
                          @click="moveDown(index)"
                        >
                          下移
                        </a-button>
                        <a-button
                          type="primary"
                          danger
                          size="small"
                          @click="handleRemove(index)"
                        >
                          删除
                        </a-button>
                      </a-space>
                    </a-space>
                  </div>
                </div>
              </template>
              <a-card-meta>
                <template #title>
                  <div class="image-title">第 {{ index + 1 }} 页</div>
                </template>
                <template #description>
                  <div class="image-name">{{ file.name }}</div>
                </template>
              </a-card-meta>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <a-image
        :style="{ display: 'none' }"
        :preview="{
          visible: previewVisible,
          onVisibleChange: (vis) => (previewVisible = vis),
          current: previewCurrent
        }"
        :src="getImageUrl(fileList[previewCurrent])"
      />

      <div class="actions">
        <a-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="fileList.length === 0"
          @click="handleConvert"
        >
          <template #icon><FileImageOutlined /></template>
          生成PDF
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, FileImageOutlined } from '@ant-design/icons-vue'
import { imagesToPdf } from '@/api/pdf'

const fileList = ref([])
const loading = ref(false)
const previewVisible = ref(false)
const previewCurrent = ref(0)

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }
  return false
}

const getImageUrl = (file) => {
  if (!file) return ''
  return URL.createObjectURL(file.originFileObj || file)
}

const handlePreview = (visible, index) => {
  previewVisible.value = visible
  if (visible) {
    previewCurrent.value = index
  }
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

const handleConvert = async () => {
  if (fileList.value.length === 0) {
    message.warning('请至少上传一张图片')
    return
  }

  loading.value = true
  try {
    const files = fileList.value.map((item) => item.originFileObj || item)
    const blob = await imagesToPdf(files)

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated.pdf'
    a.click()
    window.URL.revokeObjectURL(url)

    message.success('生成成功')
  } catch (error) {
    message.error('生成失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.images-to-pdf {
  height: 100%;
  overflow: auto;
}

.image-list {
  margin-top: 24px;
}

.image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.image-wrapper :deep(.ant-image) {
  width: 100%;
  height: 100%;
}

.image-wrapper :deep(.ant-image-img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.image-title {
  font-weight: 500;
}

.image-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  margin-top: 24px;
  text-align: center;
}
</style>
