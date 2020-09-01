<template>
  <div class="side-bar-modules">
    <div class="px-10 tool-title">工具</div>
    <div class="d-flex flex-column align-items-center tool-list">
      <div
        class="position-relative pa-20 iconfont cursor-pointer tool-item"
        v-for="(item, index) in sideToolList"
        :key="'sideToolList' + index"
        :class="{active: item.model === currentToolMode, [item.icon]: item.icon}"
        @click="handleSwitchTool(item)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentToolMode: null,
      sideToolList: [
        {
          model: "drawRect",
          icon: "icon-rect",
        },
        {
          model: "drawStraightLine",
          icon: "icon-zhixian",
        },
        // {
        //     icon: "icon-yuanhuxian",
        // },
        {
          model: "drawCircular",
          icon: "icon-yuan",
        },
      ],
    };
  },
  methods: {
    handleSwitchTool(thisTool) {
      this.$bus_unique.emit("switchTool", thisTool);

      this.currentToolMode = thisTool.model;
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