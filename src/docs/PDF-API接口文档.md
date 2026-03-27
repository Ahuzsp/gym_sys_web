# PDF处理功能 API接口文档

## 基础信息

- 基础路径：`/api/pdf`
- 请求方式：均为 POST 请求
- 文件上传：使用 `multipart/form-data` 格式

---

## 1. 合并PDF

### 接口说明
将多个PDF文件合并为一个PDF文件

### 请求信息
- **URL**: `/api/pdf/merge`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| files | MultipartFile[] | 是 | PDF文件列表，至少上传一个文件 |

### 响应信息
- **成功**: 直接下载合并后的PDF文件
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename=merged.pdf`

### 错误响应
```json
{
  "code": 400,
  "message": "请上传至少一个PDF文件"
}
```

### 前端示例代码
```javascript
const formData = new FormData()
files.forEach(file => {
  formData.append('files', file)
})

const response = await fetch('/api/pdf/merge', {
  method: 'POST',
  body: formData
})

// 下载文件
const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'merged.pdf'
a.click()
```

---

## 2. 拆分PDF（每页一个文件）

### 接口说明
将PDF文件的每一页拆分为单独的PDF文件

### 请求信息
- **URL**: `/api/pdf/split`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | MultipartFile | 是 | 要拆分的PDF文件 |

### 成功响应
```json
{
  "code": 200,
  "message": "拆分成功",
  "data": {
    "totalPages": 10,
    "pdfUrls": [
      "/api/pdf/download/uuid_page_1.pdf",
      "/api/pdf/download/uuid_page_2.pdf",
      ...
    ]
  }
}
```

### 响应字段说明
- `totalPages`: PDF总页数
- `pdfUrls`: 拆分后的PDF文件下载链接数组

---

## 3. 按页码范围拆分PDF

### 接口说明
提取PDF文件中指定页码范围的内容生成新PDF

### 请求信息
- **URL**: `/api/pdf/split/range`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | MultipartFile | 是 | PDF文件 |
| startPage | Integer | 是 | 起始页码（从1开始） |
| endPage | Integer | 是 | 结束页码 |

### 响应信息
- **成功**: 直接下载拆分后的PDF文件
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename=split_pages_1-5.pdf`

### 错误响应
```json
{
  "code": 400,
  "message": "页码范围无效"
}
```

### 前端示例代码
```javascript
const formData = new FormData()
formData.append('file', pdfFile)
formData.append('startPage', 1)
formData.append('endPage', 5)

const response = await fetch('/api/pdf/split/range', {
  method: 'POST',
  body: formData
})
```

---

## 4. PDF转图片

### 接口说明
将PDF的每一页转换为图片

### 请求信息
- **URL**: `/api/pdf/to-images`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

### 请求参数
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| file | MultipartFile | 是 | - | PDF文件 |
| dpi | Integer | 否 | 150 | 图片清晰度（建议范围：72-300） |

### 成功响应
```json
{
  "code": 200,
  "message": "转换成功",
  "data": [
    {
      "pageNumber": 1,
      "imageUrl": "/api/pdf/image/uuid_page_1.png",
      "width": 1240,
      "height": 1754
    },
    {
      "pageNumber": 2,
      "imageUrl": "/api/pdf/image/uuid_page_2.png",
      "width": 1240,
      "height": 1754
    }
  ]
}
```

### 响应字段说明
- `pageNumber`: 页码（从1开始）
- `imageUrl`: 图片访问URL
- `width`: 图片宽度（像素）
- `height`: 图片高度（像素）

### 前端示例代码
```javascript
const formData = new FormData()
formData.append('file', pdfFile)
formData.append('dpi', 150)

const response = await fetch('/api/pdf/to-images', {
  method: 'POST',
  body: formData
})

const result = await response.json()
const images = result.data // 图片数组
```

---

## 5. 图片转PDF

### 接口说明
将多张图片按顺序合并为一个PDF文件

### 请求信息
- **URL**: `/api/pdf/images-to-pdf`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| files | MultipartFile[] | 是 | 图片文件列表（按顺序） |

### 响应信息
- **成功**: 直接下载生成的PDF文件
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename=generated.pdf`

### 注意事项
- 图片上传顺序即为PDF页面顺序
- 支持的图片格式：PNG、JPEG、JPG
- 每张图片将作为PDF的一页

### 前端示例代码
```javascript
const formData = new FormData()
// 按顺序添加图片
imageFiles.forEach(file => {
  formData.append('files', file)
})

const response = await fetch('/api/pdf/images-to-pdf', {
  method: 'POST',
  body: formData
})

const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'generated.pdf'
a.click()
```

---

## 6. 下载PDF文件

### 接口说明
下载拆分后的PDF文件

### 请求信息
- **URL**: `/api/pdf/download/{fileName}`
- **Method**: `GET`

### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileName | String | 是 | 文件名（从拆分接口返回的URL中获取） |

### 响应信息
- **成功**: 返回PDF文件流
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename={fileName}`

---

## 7. 访问图片

### 接口说明
访问PDF转换后的图片

### 请求信息
- **URL**: `/api/pdf/image/{fileName}`
- **Method**: `GET`

### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileName | String | 是 | 图片文件名（从转换接口返回的URL中获取） |

### 响应信息
- **成功**: 返回图片文件流
- **Content-Type**: `image/png` 或 `image/jpeg`

### 前端示例代码
```vue
<template>
  <img :src="/api/pdf/image/uuid_page_1.png" />
</template>
```

---

## 通用错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

---

## 技术栈说明

### 后端技术
- SpringBoot 3.4.4
- Apache PDFBox 2.0.29
- Java 21

### 前端建议
- Vue 3
- Axios 或 Fetch API
- vuedraggable（用于图片拖拽排序）

---

## 功能流程图

### PDF编辑流程（推荐）
```
用户上传PDF
    ↓
后端转换为图片（POST /api/pdf/to-images）
    ↓
前端展示图片列表（支持拖拽、删除、新增）
    ↓
用户调整完成后提交图片列表
    ↓
后端生成新PDF（POST /api/pdf/images-to-pdf）
    ↓
用户下载编辑后的PDF
```

---

## 注意事项

1. **文件大小限���**
   - 当前配置：单文件最大1MB，总请求最大10MB
   - 如需调整，修改 `application.yml` 中的 `spring.servlet.multipart` 配置

2. **DPI建议值**
   - 72 DPI：适合屏幕预览，文件小
   - 150 DPI：平衡清晰度和文件大小（推荐）
   - 300 DPI：高清打印质量，文件较大

3. **临时文件管理**
   - 生成的临时文件存储在 `./temp/pdf` 和 `./temp/images`
   - 建议定期清理这些临时文件

4. **跨域配置**
   - 如前后端分离部署，需配置CORS

---

## 完整前端实现示例

### 功能：PDF编辑器（基于图片）

```vue
<template>
  <div class="pdf-editor">
    <!-- 上传PDF -->
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      accept=".pdf"
      :on-change="handlePdfChange"
      :show-file-list="false"
    >
      <el-button type="primary">选择PDF文件</el-button>
    </el-upload>

    <!-- 图片列表（可拖拽） -->
    <draggable
      v-model="pages"
      class="page-grid"
      item-key="pageNumber"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="page-item">
          <img :src="element.imageUrl" :alt="'第' + element.pageNumber + '页'" />
          <div class="page-actions">
            <el-button type="danger" size="small" @click="deletePage(index)">
              删除
            </el-button>
            <span>第 {{ index + 1 }} 页</span>
          </div>
        </div>
      </template>
    </draggable>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-upload
        :auto-upload="false"
        accept="image/*"
        :show-file-list="false"
        :on-change="handleAddImage"
      >
        <el-button>添加图片</el-button>
      </el-upload>
      <el-button type="primary" @click="generatePdf" :disabled="pages.length === 0">
        生成PDF
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'

const pages = ref([])

// 上传PDF并转换为图片
const handlePdfChange = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('dpi', 150)

  try {
    const response = await fetch('/api/pdf/to-images', {
      method: 'POST',
      body: formData
    })
    const result = await response.json()

    if (result.code === 200) {
      pages.value = result.data
      ElMessage.success(`成功转换 ${result.data.length} 页`)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('转换失败：' + error.message)
  }
}

// 删除页面
const deletePage = (index) => {
  pages.value.splice(index, 1)
}

// 添加图片
const handleAddImage = (file) => {
  const imageUrl = URL.createObjectURL(file.raw)
  pages.value.push({
    pageNumber: pages.value.length + 1,
    imageUrl: imageUrl,
    file: file.raw
  })
}

// 拖拽结束
const onDragEnd = () => {
  // 更新页码
  pages.value.forEach((page, index) => {
    page.pageNumber = index + 1
  })
}

// 生成PDF
const generatePdf = async () => {
  const formData = new FormData()

  // 收集所有图片文件
  for (const page of pages.value) {
    if (page.file) {
      formData.append('files', page.file)
    } else {
      // 从URL下载图片
      const response = await fetch(page.imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `page_${page.pageNumber}.png`, { type: 'image/png' })
      formData.append('files', file)
    }
  }

  try {
    const response = await fetch('/api/pdf/images-to-pdf', {
      method: 'POST',
      body: formData
    })

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'edited.pdf'
    a.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('PDF生成成功')
  } catch (error) {
    ElMessage.error('生成失败：' + error.message)
  }
}
</script>

<style scoped>
.pdf-editor {
  padding: 20px;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.page-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.page-item img {
  width: 100%;
  height: auto;
  display: block;
}

.page-actions {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>
```
