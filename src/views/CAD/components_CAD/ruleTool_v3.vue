<template>
  <div
    class="position-relative rule-modules"
    ref="mainContent"
    @mousedown="canvasEvt('mouseDown', $event)"
    @mousemove="canvasEvt('mouseMove', $event)"
    @mouseup="canvasEvt('mouseUp', $event)"
  >
    <!-- 模块：绘制矩形框框 -->
    <template>
      <div
        class="position-absolute z100 draw-rect-modules"
        v-for="(item, index) in createdRectObj.list"
        :key="index"
        :style="{left: item.left + 'px', top: item.top + 'px',  width: item.width + 'px', height: item.height + 'px'}"
      ></div>
    </template>

    <!-- 模块：图片 -->
    <template>
      <div
        class="position-absolute image-modules"
        :style="{left: targetImg.x + 'px', top: targetImg.y + 'px', zIndex: -1}"
      >
        <img class="d-block" :src="targetImg.url" alt ref="uploadedImageInfo" />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //绘图：矩形
      createdRectObj: {
        list: [],
      },

      targetImg: {},
      initInfo: {},
    };
  },
  mounted() {
    this.init();

    //监听：选择本地图片
    this.$bus_unique.on("choosedLocalImage", "ruleTool", async (choosedImg) => {
      try {
        let initInfo = this.initInfo;
        const { ctx_show, contentClient } = initInfo;

        //处理一下选择的图片的尺寸，使之能填充在canvas容器里
        let imgInfo = await this.transImg(contentClient, choosedImg);

        imgInfo.x = (contentClient.width - imgInfo.width) / 2;
        imgInfo.y = (contentClient.height - imgInfo.height) / 2;

        imgInfo.coords = this.getRectCoords(imgInfo); //获取图像的坐标群

        this.targetImg = imgInfo; //目标图像

        console.info("imgInfo", imgInfo);

        //将图片填充到画布的中心
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
      const contentClient = this.$refs.mainContent.getBoundingClientRect();

      console.info("contentClient", contentClient);

      const initInfo = this.initInfo = {
        contentClient,
      };
      this.toolEvts = this.getToolEvts(initInfo);
    },

    //获取工具栏的事件
    getToolEvts(initInfo) {
      let _rectObj = {
        lastRectList: [],
        drawSuccessRectList: [],
      };
      let { contentClient } = initInfo;

      const toolEvts = {
        drawRect: {
          onMouseDown: ($event) => {
            console.info("开始绘制矩形", "");
            console.info("$event", $event);

            _rectObj.isDrawing = true;

            //保存鼠标按下的坐标
            _rectObj.mouseDownPoint = {
              x: $event.pageX,
              y: $event.pageY,
            };

            //创建一个新的矩形
            const currentRect = {
              left: $event.offsetX,
              top: $event.offsetY,
              width: 0,
              height: 0,
            };

            _rectObj.currentRect = currentRect;
            this.createdRectObj.list.push(currentRect);

            console.info("this.rectObj", this.createdRectObj);
          },
          onMouseMove: async ($event) => {
            if (!_rectObj.isDrawing) {
              return false;
            }
            let { x: mouseDown_x, y: mouseDown_y } = _rectObj.mouseDownPoint;
            let { pageX, pageY, offsetX, offsetY } = $event;

            let currentRect = {};
            let moveDirection;

            let axisObj = {
              width: pageX - mouseDown_x,
              height: pageY - mouseDown_y,
            };

            if (axisObj.width < 0 && axisObj.height < 0) {
              moveDirection = "左上";

              _rectObj.currentRect.left = offsetX;
              _rectObj.currentRect.top = offsetY;
              _rectObj.currentRect.width = mouseDown_x - pageX;
              _rectObj.currentRect.height = mouseDown_y - pageY;
            } else if (axisObj.width > 0 && axisObj.height < 0) {
              moveDirection = "右上";

              _rectObj.currentRect.top = offsetY;
              _rectObj.currentRect.width = pageX - mouseDown_x;
              _rectObj.currentRect.height = mouseDown_y - pageY;
            } else if (axisObj.width < 0 && axisObj.height > 0) {
              moveDirection = "左下";

              _rectObj.currentRect.left = offsetX;
              _rectObj.currentRect.width = mouseDown_x - pageX;
              _rectObj.currentRect.height = pageY - mouseDown_y;
            } else if (axisObj.width > 0 && axisObj.height > 0) {
              moveDirection = "右下";

              _rectObj.currentRect.width = pageX - mouseDown_x;
              _rectObj.currentRect.height = pageY - mouseDown_y;
            }

            console.info("moveDirection", moveDirection);
          },
          onMouseUp: ($event) => {
            //结束绘图
            _rectObj.isDrawing = false;
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

        // //是否有效点击（必须在底层图像上）
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

    //转化图片的尺寸
    async transImg(contentClient, choosedImg) {
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
            const { width: canvasWidth, height: canvasHeight } = contentClient;

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
.rule-modules {
  // -moz-user-select: none; /*火狐*/
  // -webkit-user-select: none; /*webkit浏览器*/
  // -ms-user-select: none; /*IE10*/
  // -khtml-user-select: none; /*早期浏览器*/
  // user-select: none;
}

// 模块：绘制矩形框框
.draw-rect-modules {
  border: 1px solid red;
}
</style>