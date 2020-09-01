<template>
  <canvas
    class="w-100 h-100 canvas-box"
    ref="canvasBox"
    @mousedown="canvasEvt('mouseDown', $event)"
    @mousemove="canvasEvt('mouseMove', $event)"
    @mousemup="canvasEvt('mouseUp', $event)"
  ></canvas>
</template>

<script>
export default {
  data() {
    return {
      state: this.$storeCAD.state,
    };
  },
  mounted() {
    this.init();

    //监听：选择本地图片
    this.$bus_unique.on("choosedLocalImage", "ruleTool", async (choosedImg) => {
      try {
        let initInfo = this.initInfo;
        const { ctx, canvasClient } = initInfo;

        //处理一下选择的图片的尺寸，使之能填充在canvas容器里
        let imgInfo = await this.transImg(canvasClient, choosedImg);

        imgInfo.x = (canvasClient.width - imgInfo.width) / 2;
        imgInfo.y = (canvasClient.height - imgInfo.height) / 2;

        imgInfo.coords = this.getRectCoords(imgInfo); //获取图像的坐标群

        initInfo.targetImg = imgInfo; //目标图像

        console.info("imgInfo", imgInfo);

        //将图片填充到画布的中心
        await this.fillImgInCanvasCenter({ ctx, imgInfo });
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
        const $canvasBox = this.$refs.canvasBox;

        const ctx = $canvasBox.getContext("2d");
        const canvasClient = $canvasBox.getBoundingClientRect();

        $canvasBox.width = canvasClient.width;
        $canvasBox.height = canvasClient.height;

        await this.$nextTick(() => {
          this.initInfo = {
            ctx: ctx,
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
      let _data = {};
      let { ctx, targetImg } = this.initInfo;

      const toolEvts = {
        drawRect: {
          onMouseDown: ($event) => {
            console.info("开始绘制矩形", "");
            _data.startCoord = [$event.offsetX, $event.offsetY];

            ctx.fillStyle = "#0000ff";
            _data.isBeginDrawRect = true;
          },
          onMouseMove: ($event) => {
            let { startCoord, isBeginDrawRect, lastRect } = _data;

            if (!isBeginDrawRect) return false;

            lastRect &&
              ctx.clearRect(lastRect.x, lastRect.y, lastRect.w, lastRect.h);

            const currentRect = {
              x: startCoord[0],
              y: startCoord[1],
              w: $event.offsetX - startCoord[0],
              h: $event.offsetY - startCoord[1],
            };

            ctx.strokeRect(
              currentRect.x,
              currentRect.y,
              currentRect.w,
              currentRect.h
            );

            _data.lastRect = currentRect;

            console.info("lastRect", lastRect);

            // ctx.rect(
            //   startCoord[0],
            //   startCoord[1],
            //   $event.offsetX - startCoord[0],
            //   $event.offsetY - startCoord[1]
            // );
          },
          onMouseUp: () => {
            _data.isBeginDrawRect = false;
            ctx.stroke();
          },
        },
      };

      return toolEvts;
    },

    //画布事件
    canvasEvt(evtName, $event) {
      try {
        const { targetImg } = this.initInfo;
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
      let { ctx, imgInfo, canvasClient } = options;

      console.info("options", options);
      console.info("options.imgInfo", options.imgInfo);

      ctx.drawImage(
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
  border: 1px solid currentColor;
  background-color: rgb(37, 37, 37);
}
</style>