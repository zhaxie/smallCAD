<template>
  <div>
    <div class="px-20 py-10 file-tool-modules">
      <div class="d-flex align-items-center">
        <button class="px-20 tool-btn" @click="$refs.inputFile.click();">选择平面图</button>
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
    }
  },
  methods: {
    //上传文件
    async handleUploadFile(e) {
      try {
        const currentSelectedFile = e.target.files[0];

        console.info("currentSelectedFile", currentSelectedFile);
      } catch (error) {
        this.$toast({
          msg: error,
        });
      }
    },

    handleSave() {

    },
  },

};
</script>

<style lang="scss" scoped>
.file-tool-modules {
  background-color: #f4f4f4;

  .tool-btn {
    background-color: rgb(1, 119, 213);
    border-radius: 4px;
    line-height: 2.25;
    font-size: 14px;
    color: #fff;
  }
}
</style>