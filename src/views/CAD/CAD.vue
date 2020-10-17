<template>
  <div class="d-flex flex-column h-100">
    <!-- 文件工具栏 -->
    <fileToolBar></fileToolBar>
    <div class="col">
      <div class="d-flex h-100">
        <!-- 侧边工具栏 -->
        <sideToolBar></sideToolBar>
        <div class="col d-flex flex-column">
          <!-- 主画板区域 -->
          <mainCavans class="col" ></mainCavans>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fileToolBar from "@/views/CAD/components_CAD/fileToolBar.vue";
import sideToolBar from "@/views/CAD/components_CAD/sideToolBar.vue";
import openedFileBar from "@/views/CAD/components_CAD/openedFileBar.vue";
import mainCavans from "@/views/CAD/components_CAD/mainCavans.vue";

export default {
  components: {
    fileToolBar,
    sideToolBar,
    openedFileBar,
    mainCavans,
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
