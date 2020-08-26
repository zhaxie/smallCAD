<template>
  <div class="position-relative rule-modules" @mousedown="handleEditContent">
    <!-- 刻度尺：x轴 -->
    <div
      class="position-sticky z200 d-flex align-items-center cursor-pointer rule x-rule"
      ref="xRule"
      @mousedown="handleRenderReferenceLine('x')"
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
    <div class="position-absolute z100 y-rule">
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
    <div class="position-absolute reference-line"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentEvt: null,
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init(){
    },
    handleRenderReferenceLine(ruleType) {
      let thisDom;

      switch (ruleType) {
        case "x":
          thisDom = this.$refs.xRule;
          break;
      }

      let thisDom_rect = thisDom.getBoundingClientRect();

      this.currentEvt

      console.info("thisDom_rect", thisDom_rect);
    },
  },
};
</script>

<style lang="scss" scoped>
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
  left: 0;
  right: 0;
  top: 0;
  border: 1px dotted #999;
}
</style>