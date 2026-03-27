<template>
  <div class="pdf-to-images">
    <a-card :bordered="false">
      <a-upload-dragger
        v-model:file-list="fileList"
        :multiple="false"
        :before-upload="beforeUpload"
        accept=".pdf"
        @change="handleFileChange"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽PDF文件</p>
        <p class="ant-upload-hint">将PDF的每一页转换为图片</p>
      </a-upload-dragger>

      <div v-if="file" class="file-info">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="文件名">{{ file.name }}</a-descriptions-item>
          <a-descriptions-item label="文件大小">{{ formatFileSize(file.size) }}</a-descriptions-item>
          <a-descriptions-item label="操作">
            <a-button type="link" danger size="small" @click="handleRemoveFile">
              删除文件
            </a-button>
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <div v-if="file" class="convert-settings">
        <a-form layout="inline">
          <a-form-item label="图片清晰度(DPI)">
            <a-select v-model:value="dpi" style="width: 200px">
              <a-select-option :value="72">72 DPI - 适合屏幕预览</a-select-option>
              <a-select-option :value="150">150 DPI - 推荐平衡</a-select-option>
              <a-select-option :value="300">300 DPI - 高清打印</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" :loading="loading" @click="handleConvert">
              开始转换
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <div v-if="images.length > 0" class="image-list">
        <a-divider>转换结果 ({{ images.length }}页)</a-divider>
        <a-alert
          message="您可以拖拽调整图片顺序，点击删除按钮移除图片，或上传新图片添加到列表中"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
        <a-row :gutter="[16, 16]">
          <a-col v-for="(image, index) in images" :key="index" :span="6">
            <a-card hoverable>
              <template #cover>
                <div class="image-wrapper">
                  <a-image
                    :alt="`第${index + 1}页`"
                    :src="image.imageUrl"
                    :preview="{
                      visible: false,
                      onVisibleChange: (vis) => handlePreview(vis, index)
                    }"
                  />
                  <div class="image-overlay">
                    <a-space direction="vertical">
                      <a-space>
                        <a-button
                          type="primary"
                          size="small"
                          @click="handlePreview(true, index)"
                        >
                          预览
                        </a-button>
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
                          :disabled="index === images.length - 1"
                          @click="moveDown(index)"
                        >
                          下移
                        </a-button>
                      </a-space>
                      <a-button
                        type="primary"
                        danger
                        size="small"
                        @click="removeImage(index)"
                      >
                        删除
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </template>
              <a-card-meta :title="`第 ${index + 1} 页`">
                <template #description>
                  <div>{{ image.width }} x {{ image.height }} px</div>
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
        :src="images[previewCurrent]?.imageUrl || ''"
      />
      <div v-if="images.length > 0" class="actions">
        <a-space size="large">
          <a-upload
            :multiple="true"
            :show-upload-list="false"
            :before-upload="addImages"
            accept="image/*"
          >
            <a-button>
              <template #icon><PlusOutlined /></template>
              添加图片
            </a-button>
          </a-upload>
          <a-button
            type="primary"
            size="large"
            :loading="generating"
            @click="generatePdf"
          >
            <template #icon><FileImageOutlined /></template>
            生成PDF ({{ images.length }}页)
          </a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, PlusOutlined, FileImageOutlined } from '@ant-design/icons-vue'
import { pdfToImages, imagesToPdf, downloadFile } from '@/api/pdf'

const fileList = ref([])
const file = ref(null)
const dpi = ref(150)
const loading = ref(false)
const generating = ref(false)
const images = ref([])
const previewVisible = ref(false)
const previewCurrent = ref(0)

const beforeUpload = (file) => {
  if (file.type !== 'application/pdf') {
    message.error('只能上传PDF文件')
    return false
  }
  return false
}

const handleFileChange = (info) => {
  if (info.fileList.length > 0) {
    file.value = info.fileList[0].originFileObj || info.fileList[0]
    images.value = []
  } else {
    file.value = null
  }
}

const handleRemoveFile = () => {
  fileList.value = []
  file.value = null
  images.value = []
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleConvert = async () => {
  if (!file.value) {
    message.warning('请选择PDF文件')
    return
  }

  loading.value = true
  try {
    const res = await pdfToImages(file.value, dpi.value)
    const imageData = res.data || []

    // 将base64 URL转换为File对象
    images.value = await Promise.all(
      imageData.map(async (img, index) => {
        const fileObj = await base64ToFile(img.imageUrl, `page_${img.pageNumber}.png`)
        return {
          ...img,
          file: fileObj
        }
      })
    )

    message.success(`成功转换 ${images.value.length} 页`)
  } catch (error) {
    message.error('转换失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

/**
 * 将base64转换为File对象
 */
const base64ToFile = (base64Url, filename) => {
  return new Promise((resolve) => {
    fetch(base64Url)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], filename, { type: 'image/png' })
        resolve(file)
      })
  })
}

const handlePreview = (visible, index) => {
  previewVisible.value = visible
  if (visible) {
    previewCurrent.value = index
  }
}

const moveUp = (index) => {
  if (index > 0) {
    const temp = images.value[index]
    images.value[index] = images.value[index - 1]
    images.value[index - 1] = temp
  }
}

const moveDown = (index) => {
  if (index < images.value.length - 1) {
    const temp = images.value[index]
    images.value[index] = images.value[index + 1]
    images.value[index + 1] = temp
  }
}

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const addImages = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      images.value.push({
        imageUrl: e.target.result,
        file: file,
        width: img.width,
        height: img.height,
        pageNumber: images.value.length + 1
      })
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)

  return false
}

const generatePdf = async () => {
  if (images.value.length === 0) {
    message.warning('没有可用的图片')
    return
  }

  generating.value = true
  try {
    const files = images.value.map((img) => img.file)

    const blob = await imagesToPdf(files)
    downloadFile(blob, 'generated.pdf')
    message.success('生成成功')
  } catch (error) {
    message.error('生成失败：' + (error.message || '未知错误'))
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.pdf-to-images {
  height: 100%;
  overflow: auto;
}

.convert-settings {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.file-info {
  margin-top: 16px;
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

.actions {
  margin-top: 24px;
  text-align: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}
</style>
