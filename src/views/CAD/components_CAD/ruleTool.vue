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
        class="position-absolute draw-rect-modules"
        v-for="(item, index) in createdRectObj.list"
        :key="index"
        :style="{
          left: item.left + 'px',
          top: item.top + 'px',
          width: item.width + 'px',
          height: item.height + 'px',
        }"
        :class="{ active: currentSelectedRectIndex === index }"
        @mousedown.stop="handleSelectedThisRect($event, item, index)"
      >
        <div
          class="position-relative w-100 h-100 operaton-list"
          v-if="
            currentSelectedRectIndex === index &&
            currentToolModel === 'editRectShape'
          "
        >
          <div
            class="position-absolute operate-item"
            v-for="(itemOperate, index) in operatePointerList"
            :key="index"
            :class="itemOperate.position"
            @mousedown.stop="
              rectOperatePointerEvt('mouseDown', $event, item, itemOperate)
            "
          ></div>
        </div>
        <div
          class="position-absolute delete-btn"
          v-if="
            currentSelectedRectIndex === index &&
            currentToolModel !== 'editRectShape'
          "
          @click.stop="handleDeleteThisRect(createdRectObj.list, index)"
        ></div>
      </div>
    </template>

    <!-- 模块：图片 -->
    <template>
      <div
        class="position-absolute image-modules"
        :style="{
          left: targetImg.x + 'px',
          top: targetImg.y + 'px',
          zIndex: -1,
          width: targetImg.width + 'px',
          height: targetImg.height + 'px',
        }"
      >
        <img
          class="imgCover d-block"
          :src="targetImg.url"
          alt
          ref="uploadedImageInfo"
        />
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
      currentSelectedRectIndex: null,
      operatePointerList: [],
      currentToolModel: null,
    };
  },
  watch: {
    // currentToolModel(newValue, oldValue) {
    //   console.error("currentToolModel", newValue);
    //   if (newValue !== "editRectShape") {
    //     this.currentSelectedRectIndex = null;
    //   }
    //   this.$bus_unique.emit("updateCurrentToolModel", newValue);
    // },
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

      this.sideToolModel = model;
      this.currentSelectedRectIndex = null;
    });

    // 监听：页面右上角的按钮栏事件
    this.$bus_unique.on("rightTopBtnBarEvts", "ruleTool", (options) => {
      console.info('options', options);

      const {btnType, success} = options;

      switch (btnType) { //getCreatedCoveringsInfo：获取已创建的覆盖物信息
        case 'getCreatedCoveringsInfo':
          success && success({
            targetImg: this.targetImg,
            rectList: this.createdRectObj.list
          });
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

      // this.$bus_unique.emit("switchTool", {
      //   model: "drawRect",
      // });
    });
  },
  methods: {
    async init() {
      const contentClient = this.$refs.mainContent.getBoundingClientRect();

      console.info("contentClient", contentClient);

      const initInfo = (this.initInfo = {
        contentClient,
      });
      this.toolEvts = this.getToolEvts(initInfo); //获取工具栏事件
      this.operatePointerList = this.getRectOperatePointerList(); //获取矩形操作点列表（伸缩变形等）
    },

    //获取工具栏的事件
    getToolEvts(initInfo) {
      //矩形: 新建
      let _rectObj_create = {
        lastRectList: [],
        drawSuccessRectList: [],
      };
      //矩形: 编辑形状
      let _rectObj_editShape = {};
      //矩形：移动
      let _rectObj_move = {};
      let { contentClient } = initInfo;

      const toolEvts = {
        //绘制矩形
        drawRect: {
          onMouseDown: ($event) => {
            console.info("开始绘制矩形", "");
            console.info("$event", $event);

            _rectObj_create.isDrawing = true;

            //保存鼠标按下的坐标
            _rectObj_create.mouseDownPoint = {
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

            _rectObj_create.currentRect = currentRect;
            this.createdRectObj.list.push(currentRect);

            console.info("this.rectObj", this.createdRectObj);
          },
          onMouseMove: async ($event) => {
            if (!_rectObj_create.isDrawing) {
              return false;
            }
            let {
              x: mouseDown_x,
              y: mouseDown_y,
            } = _rectObj_create.mouseDownPoint;
            let { pageX, pageY, offsetX, offsetY } = $event;

            let currentRect = {};
            let moveDirection;

            let axisObj = {
              width: pageX - mouseDown_x,
              height: pageY - mouseDown_y,
            };

            console.info("$event", $event.offsetX);

            if (axisObj.width < 0 && axisObj.height < 0) {
              moveDirection = "左上";

              _rectObj_create.currentRect.left = offsetX;
              _rectObj_create.currentRect.top = offsetY;
              _rectObj_create.currentRect.width = mouseDown_x - pageX;
              _rectObj_create.currentRect.height = mouseDown_y - pageY;
            } else if (axisObj.width > 0 && axisObj.height < 0) {
              moveDirection = "右上";

              _rectObj_create.currentRect.top = offsetY;
              _rectObj_create.currentRect.width = pageX - mouseDown_x;
              _rectObj_create.currentRect.height = mouseDown_y - pageY;
            } else if (axisObj.width < 0 && axisObj.height > 0) {
              moveDirection = "左下";

              _rectObj_create.currentRect.left = offsetX;
              _rectObj_create.currentRect.width = mouseDown_x - pageX;
              _rectObj_create.currentRect.height = pageY - mouseDown_y;
            } else if (axisObj.width > 0 && axisObj.height > 0) {
              moveDirection = "右下";

              _rectObj_create.currentRect.width = pageX - mouseDown_x;
              _rectObj_create.currentRect.height = pageY - mouseDown_y;
            }

            console.info("moveDirection", moveDirection);
          },
          onMouseUp: ($event) => {
            // console.info("绘图结束", $event);

            //结束绘图
            _rectObj_create.isDrawing = false;
          },
        },
        //操作矩形形状
        editRectShape: {
          onMouseDown: ($event, thisRect, thisOperatePointer) => {
            _rectObj_editShape = {
              isOperating: true, //开始操作
              thisRect, //当前操作哪个矩形
              thisOperatePointer, //操作矩形的哪个操控点
            };

            console.info("_rectObj_editShape", _rectObj_editShape);

            this.currentToolModel = "editRectShape"; //切换工具模式
          },
          onMouseMove: ($event) => {
            const {
              isOperating,
              thisRect,
              thisOperatePointer,
            } = _rectObj_editShape;

            if (!isOperating || !thisOperatePointer) {
              return false;
            }

            console.info("_rectObj_editShape_onMouseMove", $event);

            const { position } = thisOperatePointer;
            const { pageX, pageY } = $event;

            const offsetX = pageX - contentClient.left;
            const offsetY = pageY - contentClient.top;

            const minLeft = thisRect.left + thisRect.width;
            const minTop = thisRect.top + thisRect.height;

            console.info("position", position);

            // 操控点的位置类型：

            // position: "left-top",
            // position: "center-top",
            // position: "right-top",
            // position: "right-center",
            // position: "right-bottom",
            // position: "center-bottom",
            // position: "left-bottom",
            // position: "left-center",

            switch (position) {
              case "left-top":
                if (offsetX >= thisRect.left + thisRect.width) {
                  return false;
                }

                if (offsetY >= thisRect.top + thisRect.height) {
                  return false;
                }

                thisRect.width = thisRect.left + thisRect.width - offsetX;
                thisRect.height = thisRect.top + thisRect.height - offsetY;

                thisRect.left = offsetX;
                thisRect.top = offsetY;
                break;
              case "center-top":
                if (offsetY >= thisRect.top + thisRect.height) {
                  return false;
                }

                thisRect.height = thisRect.top + thisRect.height - offsetY;
                thisRect.top = offsetY;
                break;
              case "right-top":
                if (offsetX <= thisRect.left) {
                  return false;
                }

                if (offsetY >= thisRect.top + thisRect.height) {
                  return false;
                }

                thisRect.width = offsetX - thisRect.left;
                thisRect.height = thisRect.top + thisRect.height - offsetY;

                thisRect.top = offsetY;
                break;
              case "right-center":
                if (offsetX <= thisRect.left) {
                  return false;
                }

                thisRect.width = offsetX - thisRect.left;
                break;
              case "right-bottom":
                if (offsetX <= thisRect.left) {
                  return false;
                }

                if (offsetY <= thisRect.top) {
                  return false;
                }

                thisRect.width = offsetX - thisRect.left;
                thisRect.height = offsetY - thisRect.top;
                break;
              case "center-bottom":
                if (offsetY <= thisRect.top) {
                  return false;
                }

                thisRect.height = offsetY - thisRect.top;
                break;
              case "left-bottom":
                if (offsetX >= thisRect.left + thisRect.width) {
                  return false;
                }

                if (offsetY <= thisRect.top) {
                  return false;
                }

                thisRect.width = thisRect.left + thisRect.width - offsetX;
                thisRect.height = offsetY - thisRect.top;

                thisRect.left = offsetX;
                break;
              case "left-center":
                if (offsetX >= thisRect.left + thisRect.width) {
                  return false;
                }

                thisRect.width = thisRect.left + thisRect.width - offsetX;
                thisRect.left = offsetX;

                break;
            }
          },
          onMouseUp: () => {
            _rectObj_editShape.isOperating = false;
          },
        },
        //移动矩形
        moveRect: {
          onMouseDown: ($event, thisRect) => {
            
            if (!thisRect) {
              return false;
            }

            const targetImg = this.targetImg;

            _rectObj_move = {
              isMoving: true,
              thisRect,
              offsetClient: {
                left: $event.offsetX,
                top: $event.offsetY,
              },
              maxOffsetClient: {
                left: targetImg.x + targetImg.width - thisRect.width,
                top: targetImg.y + targetImg.height - thisRect.height,
              },
              targetImg,
            };

            this.currentToolModel = "moveRect";
          },
          onMouseMove: ($event) => {
            const {
              isMoving,
              thisRect,
              offsetClient,
              maxOffsetClient,
              targetImg,
            } = _rectObj_move;

            if (!isMoving) {
              return false;
            }

            let newRectLeft =
              $event.pageX - contentClient.left - offsetClient.left;
            let newRectTop =
              $event.pageY - contentClient.top - offsetClient.top;

            const { left: maxOffsetLeft, top: maxOffsetTop } = maxOffsetClient;

            if (newRectLeft < targetImg.x) {
              newRectLeft = targetImg.x;
            }

            if (newRectTop < targetImg.y) {
              newRectTop = targetImg.y;
            }

            if (newRectLeft > maxOffsetLeft) {
              newRectLeft = maxOffsetLeft;
            }

            if (newRectTop > maxOffsetTop) {
              newRectTop = maxOffsetTop;
            }

            thisRect.left = newRectLeft;
            thisRect.top = newRectTop;
          },
          onMouseUp: () => {
            _rectObj_move.isMoving = false;
          },
        },
        //删除矩形：
        // deleteCover: {},
      };

      return toolEvts;
    },

    //获取矩形操作点列表（伸缩变形等）
    getRectOperatePointerList() {
      return [
        {
          position: "left-top",
        },
        {
          position: "center-top",
        },
        {
          position: "right-top",
        },
        {
          position: "right-center",
        },
        {
          position: "right-bottom",
        },
        {
          position: "center-bottom",
        },
        {
          position: "left-bottom",
        },
        {
          position: "left-center",
        },
      ];
    },

    //画布事件
    canvasEvt(evtName, $event) {
      try {
        const targetImg = this.targetImg;
        const { contentClient } = this.initInfo;
        const currentPointer = [
          $event.pageX - contentClient.left,
          $event.pageY - contentClient.top,
        ];

        const currentToolModel = this.currentToolModel;
        const currentTool = this.toolEvts[currentToolModel];

        if (
          !currentToolModel ||
          !targetImg ||
          !targetImg.coords ||
          !currentTool
        ) {
          return false;
        }

        //是否有效点击（必须在底层图像上）
        const isInTargetImg = this.isInPolygon(
          currentPointer,
          targetImg.coords
        );

        // console.info("$event", $event);
        // console.info("isInTargetImg", isInTargetImg);

        //来到这里
        if (isInTargetImg === false) {
          currentTool.onMouseUp && currentTool.onMouseUp($event);
          return false;
        }

        // 测试

        // if (evtName === "mouseMove") {
        //   return false;
        // }

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

    //选中矩形框
    handleSelectedThisRect($event, thisRect, thisIndex) {
      console.info("thisRect", thisRect);
      console.info("thisIndex", thisIndex);
      console.info("选中", $event);

      const sideToolModel = this.sideToolModel;
      this.currentSelectedRectIndex = thisIndex;

      switch (
        sideToolModel //moveCover：移动覆盖物 adjustCoverShape：调整覆盖物形状
      ) {
        case "moveCover":
          this.toolEvts.moveRect.onMouseDown($event, thisRect, thisIndex);
          break;
        case "adjustCoverShape":
          this.currentToolModel = "editRectShape";
          break;
      }
    },

    //选中矩形框的操作点
    rectOperatePointerEvt(evtName, $event, thisRect, thisOperatePointer) {
      this.toolEvts.editRectShape.onMouseDown(
        $event,
        thisRect,
        thisOperatePointer
      );
    },

    //删除当前这个矩形
    handleDeleteThisRect(rectList, toBeDeleteRectIndex) {
      rectList.splice(toBeDeleteRectIndex, 1);
      this.currentSelectedRectIndex = null;
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
  border: 1px solid #999;

  .operaton-list {
    .operate-item {
      width: 10px;
      height: 10px;
      border: 1px solid red;

      &.left-top {
        left: 0;
        top: 0;
        transform: translate3d(-50%, -50%, 0);
      }

      &.center-top {
        left: 50%;
        top: 0;
        transform: translate3d(-50%, -50%, 0);
      }

      &.right-top {
        right: 0;
        top: 0;
        transform: translate3d(50%, -50%, 0);
      }

      &.right-center {
        right: 0;
        top: 50%;
        transform: translate3d(50%, -50%, 0);
      }

      &.right-bottom {
        right: 0;
        bottom: 0;
        transform: translate3d(50%, 50%, 0);
      }

      &.center-bottom {
        left: 50%;
        bottom: 0;
        transform: translate3d(-50%, 50%, 0);
      }

      &.left-bottom {
        left: 0;
        bottom: 0;
        transform: translate3d(-50%, 50%, 0);
      }

      &.left-center {
        left: 0;
        top: 50%;
        transform: translate3d(-50%, -50%, 0);
      }
    }
  }

  //删除按钮
  .delete-btn {
    right: 0;
    top: 0;
    transform: translate3d(50%, -50%, 0) rotate(45deg);
    width: 24px;
    height: 24px;
    border: 1px solid #fff;
    border-radius: 50%;
    background-color: #333;

    &::before,
    &::after {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      content: "";
      display: block;
      width: 60%;
      height: 2px;
      background-color: #fff;
    }

    &::after {
      transform: rotate(90deg);
    }
  }

  &.active {
    z-index: 100; //必修提高层级，不然可能会出现被盖住导致不能选中
    border: 1px solid red;
  }
}
</style>