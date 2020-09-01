<template>
  <div class="d-flex flex-column h-100">
    <!-- 文件工具栏 -->
    <fileToolBar></fileToolBar>
    <div class="col">
      <div class="d-flex h-100">
        <!-- 侧边工具栏 -->
        <sideToolBar></sideToolBar>
        <div class="col d-flex flex-column">
          <!-- 已打开的文件 -->
          <!-- <openedFileBar></openedFileBar> -->
          <!-- 标尺工具 -->
          <ruleTool class="col" ></ruleTool>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fileToolBar from "@/views/CAD/components_CAD/fileToolBar.vue";
import sideToolBar from "@/views/CAD/components_CAD/sideToolBar.vue";
import openedFileBar from "@/views/CAD/components_CAD/openedFileBar.vue";
import ruleTool from "@/views/CAD/components_CAD/ruleTool.vue";

export default {
  components: {
    fileToolBar,
    sideToolBar,
    openedFileBar,
    ruleTool,
  },
  computed: {
    count() {
      return this.$storeCAD.state;
    },
  },
};
</script>

<style>
html,
body,
#app {
  height: 100%;
}
</style>

<style lang="scss" scoped>
.main-content {
}
</style>