<template>
  <div
    class="position-relative"
    @mousedown="canvasEvt('mouseDown', $event)"
    @mousemove="canvasEvt('mouseMove', $event)"
    @mouseup="canvasEvt('mouseUp', $event)"
  >
    <!-- 画布：操作层 -->
    <canvas class="position-absolute z100 w-100 h-100 canvas-box operate" ref="canvasBox_operate"></canvas>

    <canvas
      class="position-absolute canvas-box operate"
      v-for="(item, index) in createdRectObj.valueList"
      :key="index"
      :style="{width: item.w + 'px', height: item.h + 'px', border: '1px solid red', left: item.x + 'px', top: item.y + 'px',}"
      @mousedown.stop="canvasItemEvt('mouseDown', $event)"
    ></canvas>

    <!-- 画布：显示层 -->
    <canvas class="w-100 h-100 canvas-box" ref="canvasBox_show"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$storeCAD.state,
      createdRectObj: {
        position: {},
        valueList: [],
      },
    };
  },
  mounted() {
    this.init();

    //监听：选择本地图片
    this.$bus_unique.on("choosedLocalImage", "ruleTool", async (choosedImg) => {
      try {
        let initInfo = this.initInfo;
        const { ctx_show, canvasClient } = initInfo;

        //处理一下选择的图片的尺寸，使之能填充在canvas容器里
        let imgInfo = await this.transImg(canvasClient, choosedImg);

        imgInfo.x = (canvasClient.width - imgInfo.width) / 2;
        imgInfo.y = (canvasClient.height - imgInfo.height) / 2;

        imgInfo.coords = this.getRectCoords(imgInfo); //获取图像的坐标群

        this.targetImg = imgInfo; //目标图像
        this.createdRectObj.position = imgInfo;

        console.info("imgInfo", imgInfo);

        //将图片填充到画布的中心
        await this.fillImgInCanvasCenter({ ctx_show, imgInfo });
      } catch (error) {
        this.$catchError(error);
      }
    });

    // 监听：切换工具（侧边栏）
    this.$bus_unique.on("switchTool", "ruleTool", ({ model }) => {
      this.currentToolModel = model;

      switch (model) {
        case "drawRect":
          console.info("切换到绘制矩形");

          break;
      }
    });

    //测试操作
    this.$nextTick(() => {
      this.$bus_unique.emit("choosedLocalImage", {
        name: "测试图片",
        url:
          "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=697983060,2693531260&fm=15&gp=0.jpg",
      });

      this.$bus_unique.emit("switchTool", {
        model: "drawRect",
      });
    });
  },
  methods: {
    async init() {
      try {
        const $canvasBox_show = this.$refs.canvasBox_show;
        const $canvasBox_operate = this.$refs.canvasBox_operate;

        const ctx_show = $canvasBox_show.getContext("2d");
        const ctx_operate = $canvasBox_operate.getContext("2d");
        const canvasClient = $canvasBox_show.getBoundingClientRect();

        $canvasBox_show.width = canvasClient.width;
        $canvasBox_show.height = canvasClient.height;

        $canvasBox_operate.width = canvasClient.width;
        $canvasBox_operate.height = canvasClient.height;

        await this.$nextTick(() => {
          this.initInfo = {
            ctx_show,
            ctx_operate,
            canvasClient: canvasClient, //画布位置信息
          };
          this.toolEvts = this.getToolEvts();
        });
      } catch (error) {
        this.$catchError(error);
      }
    },

    //获取工具栏的事件
    getToolEvts() {
      let _rectObj = {
        lastRectList: [],
        drawSuccessRectList: [],
      };
      let { ctx_operate } = this.initInfo;

      const toolEvts = {
        drawRect: {
          onMouseDown: ($event) => {
            console.info("开始绘制矩形", "");

            const targetImg = this.targetImg;
            var currentRect = (_rectObj.startCoord = [
              $event.offsetX,
              $event.offsetY,
            ]);

            ctx_operate.fillStyle = "red";
            _rectObj.isBeginDrawRect = true;

            console.info("targetImg", this.targetImg);

            // ctx_operate.fillRect(currentRect[0], currentRect[1], 100, 200);
            // ctx_operate.clearRect(this.targetImg.x, this.targetImg.y, this.targetImg.width, this.targetImg.height);
          },
          onMouseMove: async ($event) => {
            let { startCoord, isBeginDrawRect, lastRectList } = _rectObj;

            const targetImg = this.targetImg;

            if (!isBeginDrawRect) return false;

            const currentRect = {
              x: startCoord[0],
              y: startCoord[1],
              w: $event.offsetX - startCoord[0],
              h: $event.offsetY - startCoord[1],
            };

            ctx_operate.clearRect(
              targetImg.x,
              targetImg.y,
              targetImg.width,
              targetImg.height
            );

            ctx_operate.strokeRect(
              currentRect.x,
              currentRect.y,
              currentRect.w,
              currentRect.h
            );
          },
          onMouseUp: ($event) => {
            //结束绘图
            _rectObj.isBeginDrawRect = false;
            ctx_operate.stroke();
            ctx_operate.save();

            const { startCoord } = _rectObj;

            this.createdRectObj.valueList.push({
              x: startCoord[0],
              y: startCoord[1],
              w: $event.offsetX - startCoord[0],
              h: $event.offsetY - startCoord[1],
            });

            console.info("this.createdRectList", this.createdRectList);
          },
        },
      };

      return toolEvts;
    },

    //画布事件
    canvasEvt(evtName, $event) {
      try {
        const targetImg = this.targetImg;
        const currentPointer = [$event.offsetX, $event.offsetY];

        if (!targetImg) {
          return false;
        }

        //是否有效点击（必须在底层图像上）
        const isInTargetImg = this.isInPolygon(
          currentPointer,
          targetImg.coords
        );

        if (isInTargetImg === false) return false;

        const currentToolModel = this.currentToolModel;
        const currentTool = this.toolEvts[currentToolModel];

        console.info("canvasEvt", evtName);

        switch (evtName) {
          case "mouseDown":
            currentTool.onMouseDown($event);
            break;
          case "mouseMove":
            currentTool.onMouseMove($event);
            break;
          case "mouseUp":
            currentTool.onMouseUp($event);
            break;
        }
      } catch (error) {
        this.$catchError(error);
      }
    },

    canvasItemEvt(evtName, $event) {
      console.info("canvasItemEvt", "");
    },

    //判断一个点是否在指定区域内
    isInPolygon(checkPoint, polygonPoints) {
      var counter = 0;
      var i;
      var xinters;
      var p1, p2;
      var pointCount = polygonPoints.length;
      p1 = polygonPoints[0];

      for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
          checkPoint[0] > Math.min(p1[0], p2[0]) &&
          checkPoint[0] <= Math.max(p1[0], p2[0])
        ) {
          if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
            if (p1[0] != p2[0]) {
              xinters =
                ((checkPoint[0] - p1[0]) * (p2[1] - p1[1])) / (p2[0] - p1[0]) +
                p1[1];
              if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                counter++;
              }
            }
          }
        }
        p1 = p2;
      }
      if (counter % 2 == 0) {
        return false;
      } else {
        return true;
      }
    },

    //转化图片的尺寸
    async transImg(canvasClient, choosedImg) {
      return new Promise((resolve, reject) => {
        let newImgEle = new Image();

        newImgEle.src = choosedImg.url;
        newImgEle.onload = (e) => {
          try {
            console.info("imgInfo", e);

            //当前选择的image的尺寸信息
            const { width: imgWidth, height: imgHeight } = newImgEle;
            const sizeRatio = imgWidth / imgHeight;

            let scaleRatio = 0.9;

            //画布的尺寸信息
            const { width: canvasWidth, height: canvasHeight } = canvasClient;

            //图片的最大显示
            const maxSize = {
              width: canvasWidth * scaleRatio,
              height: canvasHeight * scaleRatio,
            };

            //调整后的图片尺寸
            let aferTransImg = {
              width: imgWidth,
              height: imgHeight,
            };

            //判断图片的宽高比，从而调整它显示比例
            if (sizeRatio > 1) {
              console.info("比例：", "宽大于高");

              if (maxSize.width < imgWidth) {
                aferTransImg = {
                  width: maxSize.width,
                  height: maxSize.width / sizeRatio,
                };
              } else {
                scaleRatio = 1;
              }
            } else if (sizeRatio === 1) {
              console.info("比例：", "正方形");

              if (maxSize.width < imgWidth) {
                aferTransImg = {
                  width: maxSize.width,
                  height: maxSize.width,
                };
              } else {
                scaleRatio = 1;
              }
            } else {
              console.info("比例：", "高大于宽");

              if (maxSize.height < imgHeight) {
                aferTransImg = {
                  width: maxSize.height * sizeRatio,
                  height: maxSize.height,
                };
              } else {
                scaleRatio = 1;
              }
            }

            aferTransImg.sizeRatio = sizeRatio; //宽高尺寸比率
            aferTransImg.scaleRatio = scaleRatio; //转换后的图片与转换钱的缩放比
            aferTransImg.url = choosedImg.url;
            aferTransImg.imgEle = newImgEle;

            console.info("aferTransImg", aferTransImg);

            resolve(aferTransImg);
          } catch (error) {
            reject(error);
          }
        };

        newImgEle.onerror = (error) => {
          reject(error);
        };
      });
    },

    //将图片填充到画布的中心区域
    fillImgInCanvasCenter(options) {
      let { ctx_show, imgInfo, canvasClient } = options;

      console.info("options", options);
      console.info("options.imgInfo", options.imgInfo);

      ctx_show.drawImage(
        imgInfo.imgEle,
        imgInfo.x,
        imgInfo.y,
        imgInfo.width,
        imgInfo.height
      );
    },

    //获取矩形的坐标群
    getRectCoords(options) {
      const { x, y, width: w, height: h } = options;

      return [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.canvas-box {
  background-color: rgb(37, 37, 37);

  &.operate {
    background-color: transparent;
  }
}

.rect-list {
  .rect-item {
    border: 1px solid red;
  }
}
</style>