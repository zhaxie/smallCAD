<!--
 * @Date         : 2020-10-20 15:15:49
 * @LastEditors  : cxx
 * @LastEditTime : 2021-01-22 14:47:19
 * @FilePath     : \small_cad\src\views\CAD\imgWithCovers.vue
-->
<template>
  <div class="target-img-box" ref="targetImgBox">
    <div class="position-relative d-inline-block">
      <img class="w-100" :src="targetImg" />
      <div
        class="position-absolute rect-box"
        v-for="(item, index) in coverList"
        :key="index"
        :style="{
          left: item.left,
          top: item.top,
          width: item.width,
          height: item.height,
        }"
      ></div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      coverList: [],
      targetImg: "",
    };
  },
  mounted() {
    this.targetImg =
      "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1603191292676&di=37e18b62512e71ca6645792851b3d426&imgtype=0&src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F6%2F577dff88921e2.jpg";
    this.coverList = [
      {
        left: "31.924797485189217%",
        top: "25.722403578769192%",
        width: "20.79555071938097%",
        height: "25.341554830129372%",
      },
    ];
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.target-img-box {
  margin-left: 4rem;
  margin-top: 4rem;
  .rect-box {
    border: 1px solid red;
  }
}
</style>