<template>
  <div>
    <div class="px-20 py-10 file-tool-modules">
      <div class="d-flex align-items-center">
        <button
          class="px-20 tool-btn"
          v-if="!state.currentUploadedImageInfo.name"
          @click="$refs.inputFile.click();"
        >选择平面图</button>
        <div class="d-flex align-items-center px-20 select-file-btn" v-else>
          <div>{{state.currentUploadedImageInfo.name}}</div>
          <div class="pl-10 iconfont icon-close cursor-pointer" @click="handleRemoveUploadedFile();"></div>
        </div>
        <div class="col"></div>
        <button class="mx-5 px-20 tool-btn" @click="handleSave">保存</button>
        <button class="mx-5 px-20 tool-btn" @click="$refs.inputFile.click();">打印</button>
        <button class="mx-5 px-20 tool-btn" @click="$refs.inputFile.click();">导出</button>
      </div>
    </div>
    <!-- 上传文件专用 -->
    <input type="file" class="d-none" ref="inputFile" @change="handleUploadFile" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      $storeCAD: this.$storeCAD,
      state: this.$storeCAD.state,
    };
  },
  methods: {
    handleUploadFile(e) {
      this.$storeCAD.handleUploadFile(e);
    },

    handleRemoveUploadedFile(){
      this.$storeCAD.removeUploadedImg();
    },

    handleSave() {},
  },
};
</script>

<style lang="scss" scoped>
.file-tool-modules {
  background-color: #f4f4f4;

  .tool-btn {
    border: 1px solid transparent;
    background-color: #0177d5;
    border-radius: 4px;
    line-height: 2.25;
    font-size: 14px;
    color: #fff;
  }

  .select-file-btn {
    border: 1px solid #0177d5;
    border-radius: 4px;
    line-height: 2.25;
    font-size: 14px;
    color: #0177d5;
  }
}
</style>