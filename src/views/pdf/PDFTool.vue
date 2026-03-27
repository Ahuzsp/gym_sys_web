<template>
  <div class="pdf-tools">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="merge" tab="PDF合并">
        <MergePdf />
      </a-tab-pane>
      <a-tab-pane key="split" tab="PDF拆分">
        <SplitPdf />
      </a-tab-pane>
      <a-tab-pane key="toImages" tab="PDF转图片">
        <PdfToImages />
      </a-tab-pane>
      <a-tab-pane key="toPdf" tab="图片转PDF">
        <ImagesToPdf />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MergePdf from './components/MergePdf.vue'
import SplitPdf from './components/SplitPdf.vue'
import PdfToImages from './components/PdfToImages.vue'
import ImagesToPdf from './components/ImagesToPdf.vue'

const activeTab = ref('merge')
</script>

<style scoped>
.pdf-tools {
  height: 100%;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

:deep(.ant-tabs) {
  height: 100%;
}

:deep(.ant-tabs-content) {
  height: calc(100% - 46px);
}

:deep(.ant-tabs-tabpane) {
  height: 100%;
}
</style>
