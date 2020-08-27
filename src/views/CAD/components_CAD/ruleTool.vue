<template>
  <div
    class="position-relative rule-modules"
    @mousemove="mainContentEvt_onMouseMove($event)"
    @mouseup="mainContentEvt_onMouseUp($event)"
  >
    <!-- 刻度尺：x轴 -->
    <div
      class="position-sticky z100 d-flex align-items-center cursor-pointer rule x-rule"
      ref="xRule"
      @mousedown="handleEnterModel_drawReferLine({
        model: 'drawReferLine',
        $event,
        axisType: 'xAxis',
      })"
    >
      <div class="position-relative rule-item" v-for="(item, index) in 20" :key="'x' + index">
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
      class="position-absolute z100 y-rule"
      ref="yRule"
      @mousedown="handleEnterModel_drawReferLine({
        model: 'drawReferLine',
        axisType: 'yAxis',
      })"
    >
      <div class="position-relative rule-item" v-for="(item, index) in 20" :key="'y' + index">
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
    <div class="h-100" style="width: 30px;">占位符</div>

    <!-- 参考线：x轴 -->
    <div
      class="position-absolute cursor-pointer reference-line xAxis"
      v-for="(item, index) in referLineObj.xAxis"
      :key="'referLineObjxAxis' + index"
      :style="{top: item.posVal + 'px'}"
      :class="{active: item.isSelected == true}"
      @mousedown="editModelListObj.drawReferLine.onMouseDown('xAxis', item)"
    ></div>
    <div
      class="position-absolute cursor-pointer reference-line yAxis"
      v-for="(item, index) in referLineObj.yAxis"
      :key="'referLineObjyAxis' + index"
      :style="{left: item.posVal + 'px'}"
      :class="{active: item.isSelected == true}"
      @mousedown="editModelListObj.drawReferLine.onMouseDown('yAxis', item)"
    ></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentEvt: null,
      referLineObj: {
        xAxis: [],
        yAxis: [],
        activeAxis: null,
      },
      axis: {}, //坐标轴
      testTop: null,
      currentModel: null,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.axis = this.initAxis(); //初始化坐标轴
      this.editModelListObj = this.initEditModels(); //初始化各种编辑模式
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
        },
      };
    },

    //初始化各种编辑模式
    initEditModels() {
      let selfData = {};

      const _originPoint = this.axis.originPoint;

      const editModels = {
        //绘制: x轴的参考线
        drawReferLine: {
          onMouseDown: (axisType, thisReferLineObj) => {
            let _referLineObj = this.referLineObj;
            let currentReferLineList = _referLineObj[axisType];

            //去除上一个被操作的参考线的选中样式
            if (selfData.currentEditReferLineObj) {
              selfData.currentEditReferLineObj.isSelected = false; 
            }

            if (thisReferLineObj) {
              console.info("模式：移动参考线");

              thisReferLineObj.isSelected = true; //选中当前的参考线
              selfData.currentEditReferLineObj = thisReferLineObj; //更新当前操作的参考线

              selfData.isMovedMouse = false; //记录鼠标是否被移动过，用于onMouseUp时，判断是点击参考线，还是移动参考线
            } else {
              console.info("模式：创建参考线");

              selfData.currentEditReferLineObj = {
                isSelected: true, //注意：是否被选中，这个必须写进去，不然vue无法跟踪到它的数据变化
                posVal: 0, //参考线的初试位置
              };
              currentReferLineList.push(selfData.currentEditReferLineObj);
            }

            selfData.currentAxisType = axisType;

            //根据轴向，创建一个新的参考线

            this.currentModel = "drawReferLine"; //当前模式：绘制参考线

            console.info("currentReferLineList", currentReferLineList);
          },
          onMouseMove: ($event) => {
            let currentAxisType = selfData.currentAxisType;
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

            selfData.currentEditReferLineObj.posVal = endDis - startDis;
            selfData.isMovedMouse = true;
          },
          onMouseUp: ($event) => {
            let currentAxisType = selfData.currentAxisType;
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
            if (selfData.currentEditReferLineObj.posVal <= safeVal) {
              this.referLineObj[currentAxisType].pop();
            } else {
              const isMovedMouse = selfData.isMovedMouse;

              selfData.currentEditReferLineObj.isSelected = !isMovedMouse; //取消选中的状态
            }
          },
        },
      };

      return editModels;
    },

    //进入模式：绘制参考线
    handleEnterModel_drawReferLine({ model, axisType }) {
      this.editModelListObj[model].onMouseDown(axisType);
    },

    // 主区域事件：鼠标移动
    mainContentEvt_onMouseMove($event) {
      const currentModel = this.currentModel;

      if (currentModel === null) {
        return false;
      }

      this.editModelListObj[currentModel].onMouseMove(
        $event,
        this.referLineObj.activeAxisType
      );
    },

    //主区域事件：鼠标抬起
    mainContentEvt_onMouseUp($event) {
      const currentModel = this.currentModel;

      if (currentModel === null) {
        return false;
      }

      this.editModelListObj[currentModel].onMouseUp(
        $event,
        this.referLineObj.activeAxisType
      );

      this.currentModel = null; //清除绘制模式
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
  left: 0;
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
  top: 0;
  border: 1px solid #333;
  background-color: #fff;

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
</style>