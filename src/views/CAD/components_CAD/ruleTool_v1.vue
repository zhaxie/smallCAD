<template>
  <div
    class="position-relative rule-modules"
    @mousedown="mainContentEvt_onMouseDown($event)"
    @mousemove="mainContentEvt_onMouseMove($event)"
    @mouseup="mainContentEvt_onMouseUp($event)"
  >
    <!-- 模块：刻度尺 + 参考线 -->
    <template v-if="ruleInfo">
      <!-- 刻度尺：x轴 -->
      <div
        class="position-sticky z100 d-flex align-items-center cursor-pointer rule x-rule"
        ref="xRule"
        @mousedown="editModelListObj.drawReferLine.beginDraw('xAxis');"
      >
        <div
          class="position-relative flex-shrink-0 rule-item"
          v-for="(item, index) in ruleInfo.xAxis.itemNumber"
          :key="'x' + index"
        >
          <div class="pl-5 number">{{50 * index}}</div>
          <div class="position-absolute mark-line-modules">
            <div class="position-relative h-100">
              <div
                class="position-absolute mark-item"
                v-for="(item, index) in 9"
                :key="index"
                :style="{left: (index + 1) * 10 + '%', height: (index + 1) % 2 !== 0 ? '70%' : '100%'}"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 刻度尺：y轴 -->
      <div
        class="position-sticky z100 y-rule"
        ref="yRule"
        @mousedown="editModelListObj.drawReferLine.beginDraw('yAxis');"
      >
        <div class="position-relative rule-item" v-for="(item, index) in ruleInfo.yAxis.itemNumber" :key="'y' + index">
          <div class="pl-5 number">{{50 * index}}</div>
          <div class="position-absolute mark-line-modules">
            <div class="position-relative h-100">
              <div
                class="position-absolute mark-item"
                v-for="(item, index) in 9"
                :key="index"
                :style="{top: (index + 1) * 10 + '%', width: (index + 1) % 2 !== 0 ? '70%' : '100%'}"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 参考线 -->
      <!-- x轴 -->
      <div
        class="position-absolute cursor-pointer reference-line xAxis"
        v-for="(item, index) in referLineObj.xAxis"
        :key="'referLineObjxAxis' + index"
        :style="{top: item.posVal + 'px'}"
        :class="{active: item.isSelected == true}"
        @mousedown="editModelListObj.drawReferLine.beginDraw('xAxis', item)"
      ></div>
      <!-- y轴 -->
      <div
        class="position-absolute cursor-pointer reference-line yAxis"
        v-for="(item, index) in referLineObj.yAxis"
        :key="'referLineObjyAxis' + index"
        :style="{left: item.posVal + 'px' }"
        :class="{active: item.isSelected == true}"
        @mousedown="editModelListObj.drawReferLine.beginDraw('yAxis', item)"
      ></div>
    </template>

    <!-- 模块：绘制矩形框框 -->
    <template>
      <canvas
        class="position-absolute z100 draw-rect-modules"
        v-for="(item, index) in rectObj.list"
        :key="index"
        :style="{left: item.left + 'px', top: item.top + 'px',  width: item.width + 'px', height: item.height + 'px'}"
      ></canvas>
    </template>

    <!-- 模块：图片 -->
    <template v-if="state.currentUploadedImageInfo.url">
      <div
        class="position-absolute image-modules"
        :style="{left: axis.originPoint.rule.width + 'px', top: axis.originPoint.rule.height + 'px'}"
      >
        <img class="d-block" :src="state.currentUploadedImageInfo.url" alt ref="uploadedImageInfo" />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //绘图：参考线
      referLineObj: {
        xAxis: [],
        yAxis: [],
        activeAxis: null,
      },

      //绘图：矩形
      rectObj: {
        list: [],
      },

      //标尺信息
      ruleInfo: null,

      //坐标轴
      axis: {
        originPoint: {
          rule: {
            width: 0,
            height: 0,
          },
        },
      },
      state: this.$storeCAD.state,
    };
  },
  watch: {
    "state.currentUploadedImageInfo.url"(newValue) {
      if (newValue) {
        setTimeout(() => {
          const imageClient = this.$refs.uploadedImageInfo.getBoundingClientRect();
          console.info("imageClient", imageClient);

          this.ruleInfo = {
            xAxis: {
              width: imageClient.width,
              itemNumber: Math.floor(imageClient.width / 50),
            },
            yAxis: {
              height: imageClient.height,
              itemNumber: Math.floor(imageClient.height / 50),
            },
          };
        }, 300);
      }
    },
  },
  mounted() {
    // this.init();
  },
  methods: {
    async init() {
      this.axis = await this.initAxis(); //初始化坐标轴
      this.editModelListObj = await this.initEditModels(); //初始化各种编辑模式
    },

    //初始化坐标轴
    initAxis() {
      const _$refs = this.$refs;

      const xRuleRect = _$refs.xRule.getBoundingClientRect();
      const yRuleRect = _$refs.yRule.getBoundingClientRect();

      console.info("xRuleRect", xRuleRect);
      console.info("yRuleRect", yRuleRect);

      return {
        //坐标轴原点
        originPoint: {
          x: yRuleRect.left + yRuleRect.width,
          y: xRuleRect.top + xRuleRect.height,
          top: xRuleRect.top,
          left: yRuleRect.left,
          height: xRuleRect.height,
          width: yRuleRect.height,
          rule: {
            width: yRuleRect.width,
            height: xRuleRect.height,
          },
        },
      };
    },

    //初始化各种编辑模式
    initEditModels() {
      let _data = {};

      const _originPoint = this.axis.originPoint;

      const editModels = {
        //绘制: 参考线
        drawReferLine: {
          beginDraw: (axisType, thisReferLineObj) => {
            let _referLineObj = this.referLineObj;
            let currentReferLineList = _referLineObj[axisType];

            _data.isDrawing = true;
            this.state.currentToolMode = "drawReferLine"; //当前模式：绘制参考线

            //去除上一个被操作的参考线的选中样式
            if (_data.currentEditReferLineObj) {
              _data.currentEditReferLineObj.isSelected = false;
            }

            if (thisReferLineObj) {
              console.info("模式：移动参考线");

              thisReferLineObj.isSelected = true; //选中当前的参考线
              _data.currentEditReferLineObj = thisReferLineObj; //更新当前操作的参考线

              _data.isMovedMouse = false; //记录鼠标是否被移动过，用于onMouseUp时，判断是点击参考线，还是移动参考线
            } else {
              console.info("模式：创建参考线");

              _data.currentEditReferLineObj = {
                isSelected: true, //注意：是否被选中，这个必须写进去，不然vue无法跟踪到它的数据变化
                posVal: 0, //参考线的初试位置
              };
              currentReferLineList.push(_data.currentEditReferLineObj);
            }

            _data.currentAxisType = axisType;

            console.info("currentReferLineList", currentReferLineList);
          },
          onMouseMove: ($event) => {
            if (!_data.isDrawing) {
              return false;
            }

            let currentAxisType = _data.currentAxisType;
            let startDis;
            let endDis;

            switch (currentAxisType) {
              case "xAxis":
                startDis = _originPoint.top;
                endDis = $event.pageY;
                break;
              case "yAxis":
                startDis = _originPoint.left;
                endDis = $event.pageX;
                break;
            }

            _data.currentEditReferLineObj.posVal = endDis - startDis;
            _data.isMovedMouse = true;
          },
          onMouseUp: ($event) => {
            _data.isDrawing = false;

            let currentAxisType = _data.currentAxisType;
            let safeVal; //安全值，小于这个值，就作废

            switch (currentAxisType) {
              case "xAxis":
                safeVal = _originPoint.height;
                break;
              case "yAxis":
                safeVal = _originPoint.left;
                break;
            }

            //如果参考线在标尺的位置范围内，则作废，删除
            if (_data.currentEditReferLineObj.posVal <= safeVal) {
              this.referLineObj[currentAxisType].pop();
            } else {
              const isMovedMouse = _data.isMovedMouse;

              _data.currentEditReferLineObj.isSelected = !isMovedMouse; //取消选中的状态
            }
          },
        },

        //绘制：矩形
        drawRect: {
          onMouseDown: ($event) => {
            console.info("$event", $event);

            _data.isDrawing = true;

            //保存鼠标按下的坐标
            _data.mouseDownPoint = {
              x: $event.pageX,
              y: $event.pageY,
            };

            //创建一个新的矩形
            const currentRect = {
              left: $event.pageX - _originPoint.left,
              top: $event.pageY - _originPoint.top,
              width: 0,
              height: 0,
            };
            _data.currentRect = currentRect;

            console.info("this.rectObj", this.rectObj);

            this.rectObj.list.push(currentRect);
          },
          onMouseMove: ($event) => {
            if (!_data.isDrawing) {
              return false;
            }

            let { x: mouseDown_x, y: mouseDown_y } = _data.mouseDownPoint;
            let { pageX, pageY } = $event;

            let currentRect = {};
            let moveDirection;

            let axisObj = {
              width: pageX - mouseDown_x,
              height: pageY - mouseDown_y,
            };

            if (axisObj.width < 0 && axisObj.height < 0) {
              moveDirection = "左上";

              _data.currentRect.left = pageX - _originPoint.left;
              _data.currentRect.top = pageY - _originPoint.top;
              _data.currentRect.width = mouseDown_x - pageX;
              _data.currentRect.height = mouseDown_y - pageY;
            } else if (axisObj.width > 0 && axisObj.height < 0) {
              moveDirection = "右上";

              _data.currentRect.top = pageY - _originPoint.top;
              _data.currentRect.width = pageX - mouseDown_x;
              _data.currentRect.height = mouseDown_y - pageY;
            } else if (axisObj.width < 0 && axisObj.height > 0) {
              moveDirection = "左下";

              _data.currentRect.left = pageX - _originPoint.left;
              _data.currentRect.width = mouseDown_x - pageX;
              _data.currentRect.height = pageY - mouseDown_y;
            } else if (axisObj.width > 0 && axisObj.height > 0) {
              moveDirection = "右下";

              _data.currentRect.width = pageX - mouseDown_x;
              _data.currentRect.height = pageY - mouseDown_y;
            }

            console.info("moveDirection", moveDirection);

            // //跟踪：x轴
            // if (mouseDown_x - pageX >= _originPoint.x) {
            //   _data.currentRect.left = pageX - _originPoint.left;
            //   _data.currentRect.width = mouseDown_x - pageX;
            // } else {
            //   _data.currentRect.width = pageX - mouseDown_x;
            // }

            // // // 跟踪：y轴
            // if (mouseDown_y - pageY >= _originPoint.y) {
            //   _data.currentRect.top = pageY - _originPoint.top;
            //   _data.currentRect.height = mouseDown_y - pageY;
            // } else {
            //   _data.currentRect.height = pageY - mouseDown_y;
            // }
          },
          onMouseUp: ($event) => {
            _data.isDrawing = false;

            console.info("$event", $event);
          },
        },
      };

      return editModels;
    },

    // 主区域事件：鼠标按下
    mainContentEvt_onMouseDown($event) {
      const currentToolMode = this.state.currentToolMode;

      if (currentToolMode === null) {
        return false;
      }

      const onMouseDownEvent = this.editModelListObj[currentToolMode]
        .onMouseDown;

      onMouseDownEvent && onMouseDownEvent($event);
    },

    // 主区域事件：鼠标移动
    mainContentEvt_onMouseMove($event) {
      const currentToolMode = this.state.currentToolMode;

      if (currentToolMode === null) {
        return false;
      }

      this.editModelListObj[currentToolMode].onMouseMove($event);
    },

    //主区域事件：鼠标抬起
    mainContentEvt_onMouseUp($event) {
      const currentToolMode = this.state.currentToolMode;

      if (currentToolMode === null) {
        return false;
      }

      this.editModelListObj[currentToolMode].onMouseUp($event);
    },
  },
};
</script>

<style lang="scss" scoped>
.rule-modules {
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
}
// 刻度尺：x轴
.x-rule {
  top: 0;
  border: 1px solid #333;
  background-color: #fff;

  .rule-item {
    width: 54px;
    height: 24px;
    border-right: 1px solid #333;

    .number {
      font-size: 10px;
    }

    .mark-line-modules {
      left: 0;
      bottom: 0;
      right: 0;
      height: 20%;

      .mark-item {
        bottom: 0;
        width: 1px;
        background-color: #333;
      }
    }
  }
}

// 刻度尺：y轴
.y-rule {
  left: 0;
  border: 1px solid #333;
  background-color: #fff;
  width: 26px;

  .rule-item {
    width: 24px;
    height: 54px;
    border-bottom: 1px solid #333;

    .number {
      width: 20%;
      font-size: 10px;
      overflow-wrap: break-word;
      line-height: 1;
    }

    .mark-line-modules {
      top: 0;
      bottom: 0;
      right: 0;
      width: 20%;

      .mark-item {
        right: 0;
        height: 1px;
        background-color: #333;
      }
    }
  }
}

// 参考线：x轴
.reference-line {
  position: relative;
  border: 0.5px dotted #999;

  &::after {
    position: absolute;
    content: "";
    left: -10px;
    top: -10px;
    right: -10px;
    bottom: -10px;
  }

  &.active {
    border-color: red;
  }

  &.xAxis {
    left: 0;
    right: 0;
  }

  &.yAxis {
    top: 0;
    bottom: 0;
  }
}

// 模块：绘制矩形框框
.draw-rect-modules {
  border: 1px solid red;
}

//模块：图片
.image-modules {
  z-index: -1;
}
</style>