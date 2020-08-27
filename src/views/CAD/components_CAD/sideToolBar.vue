<template>
  <div class="side-bar-modules">
    <div class="px-10 tool-title">工具</div>
    <div class="d-flex flex-column align-items-center tool-list" >
      <div
        class="pa-20 iconfont cursor-pointer"
        v-for="(item, index) in state.sideToolList"
        :key="'sideToolList' + index"
        :class="{active: item.type === state.currentToolModelType, [item.icon]: item.icon}"
        @click="$storeCAD.switchCurrentToolModel(item)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$storeCAD.state,
    };
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
    .active {
      position: relative;

      &::after {
        position: absolute;
        left: 0.5rem;
        top: 0.5rem;
        right: 0.5rem;
        bottom: 0.5rem;

        content: "";
        display: block;
        border: 1px solid #999;
        border-radius: 0.25rem;
      }
    }
  }
}
</style>