<template>
  <div>
    <div class="px-20 py-10 file-tool-modules">
      <div class="d-flex align-items-center">
        <button
          class="px-20 tool-btn"
          v-if="!state.currentUploadedImageInfo.name"
          @click="$refs.inputFile.click()"
        >
          选择平面图
        </button>
        <div class="d-flex align-items-center px-20 select-file-btn" v-else>
          <div>{{ state.currentUploadedImageInfo.name }}</div>
          <div
            class="pl-10 iconfont icon-close cursor-pointer"
            @click="handleRemoveUploadedFile()"
          ></div>
        </div>
        <div class="col"></div>
        <button
          class="mx-5 px-20 tool-btn"
          @click="handleGetCreatedCoveringsLocation"
        >
          生成覆盖物区域
        </button>
        <!-- <button class="mx-5 px-20 tool-btn" @click="$refs.inputFile.click();">打印</button>
        <button class="mx-5 px-20 tool-btn" @click="$refs.inputFile.click();">导出</button> -->
      </div>
    </div>
    <!-- 上传文件专用 -->
    <input
      type="file"
      class="d-none"
      ref="inputFile"
      @change="handleUploadFile"
    />
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
      try {
        const file = e.target.files[0];
        var imageType = /image.*/;

        if (file.type.match(imageType)) {
          var reader = new FileReader();

          reader.readAsDataURL(file);
          reader.onload = () => {
            this.$bus_unique.emit("choosedLocalImage", {
              name: file.name,
              url: reader.result,
            });
          };
        } else {
          alert("图片格式有误");
        }
      } catch (error) {
        console.error("error", error);
        alert(error);
      }
    },

    handleRemoveUploadedFile() {
      this.$storeCAD.removeUploadedImg();
    },

    handleGetCreatedCoveringsLocation() {
      this.$bus_unique.emit("rightTopBtnBarEvts", {
        btnType: "getCreatedCoveringsInfo",
        success: (options) => {
          const { targetImg, rectList } = options;
          const { x, y, width, height } = targetImg; //目标图像的坐标;

          //矩形与目标图像的 相对定位/相对尺寸
          const rectList_afterTrans = rectList.map((item) => {
            return {
              left: ((item.left - x) / width) * 100 + "%",
              top: ((item.top - y) / height) * 100 + "%",
              width: (item.width / width) * 100 + "%",
              height: (item.height / height) * 100 + "%",
            };
          });

          console.info("目标图像信息：", JSON.stringify(targetImg));
          console.info(
            "最终的矩形坐标信息：x y width height：",
            JSON.stringify(rectList_afterTrans)
          );
        },
      });
    },
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