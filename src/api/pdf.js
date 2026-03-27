import request from '@/utils/request'

/**
 * 下载文件的辅助函数
 * @param {Blob} blob 文件流
 * @param {string} filename 文件名
 */
export function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 合并PDF
 * @param {File[]} files PDF文件列表
 * @returns {Promise<Blob>} 合并后的PDF文件流
 */
export function mergePdf(files) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return request({
    url: '/api/pdf/merge',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: 'blob'
  })
}

/**
 * 拆分PDF（每页一个文件）
 * @param {File} file PDF文件
 * @returns {Promise} 拆分结果
 */
export function splitPdf(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/api/pdf/split',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 按页码范围拆分PDF
 * @param {File} file PDF文件
 * @param {number} startPage 起始页码
 * @param {number} endPage 结束页码
 * @returns {Promise<Blob>} 拆分后的PDF文件流
 */
export function splitPdfByRange(file, startPage, endPage) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('startPage', startPage)
  formData.append('endPage', endPage)

  return request({
    url: '/api/pdf/split/range',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: 'blob'
  })
}

/**
 * PDF转图片
 * @param {File} file PDF文件
 * @param {number} dpi 图片清晰度（默认150）
 * @returns {Promise} 转换结果
 */
export function pdfToImages(file, dpi = 150) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('dpi', dpi)

  return request({
    url: '/api/pdf/to-images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 图片转PDF
 * @param {File[]} files 图片文件列表
 * @returns {Promise<Blob>} 生成的PDF文件流
 */
export function imagesToPdf(files) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return request({
    url: '/api/pdf/images-to-pdf',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: 'blob'
  })
}
