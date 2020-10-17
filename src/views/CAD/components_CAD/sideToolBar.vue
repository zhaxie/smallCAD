<template>
  <div class="side-bar-modules">
    <div class="px-10 tool-title">工具</div>
    <div class="d-flex flex-column align-items-center tool-list">
      <div
        class="position-relative pa-20 iconfont cursor-pointer tool-item"
        v-for="(item, index) in sideToolList"
        :key="'sideToolList' + index"
        :class="{active: item.model === currentToolModel, [item.icon]: item.icon}"
        :title="item.hoverTitle"
        @click="handleSwitchTool(item)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentToolModel: null,
      sideToolList: [
        {
          model: "drawRect", //绘制矩形
          icon: "icon-rect",
          hoverTitle: '框选区域'
        },
        {
          model: "adjustCoverShape", //调整覆盖物形状
          icon: "icon-suofang",
          hoverTitle: '调整矩形形状'
        },
        {
          model: "moveCover", //移动覆盖物
          icon: "icon-move",
          hoverTitle: '移动矩形'
        },
        {
          model: "bindRelatedInfo", //绑定关联信息（给绘制出来的矩形局域加上关联信息）
          icon: "icon-bind", 
          hoverTitle: '绑定关联信息'
        },
      ],
    };
  },
  mounted () {
    // this.$bus_unique.on('updateCurrentToolModel', 'sideToolBar', (newModel) => {
    //   this.currentToolModel = newModel;
    // });
  },
  methods: {
    handleSwitchTool(thisTool) {
      this.$bus_unique.emit("switchTool", thisTool);

      this.currentToolModel = thisTool.model;
    },
  },
};
</script>

<style lang="scss" scoped>
.side-bar-modules {
  background-color: #f4f4f4;

  .tool-title {
    line-height: 2;
    font-size: 10px;
    color: #333;
  }

  .tool-list {
    .tool-item {

      &::after {
        position: absolute;
        left: 0.5rem;
        top: 0.5rem;
        right: 0.5rem;
        bottom: 0.5rem;

        content: "";
        display: block;
        border: 1px solid transparent;
        border-radius: 0.25rem;
      }

      &.active {
        &::after {
          border: 1px solid #999;
        }
      }
    }
  }
}
</style>