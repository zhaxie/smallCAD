<template>
  <div class="ma-5 openedFile-modules">
    <div class="d-flex align-items-center pa-5 file-list">
      <div class="d-flex align-items-center mx-5 file-item">
        <div class="col pl-10 text-over-one file-name">文件文件名文件名文件名名</div>
        <div class="iconfont mx-10 icon-close remove-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.openedFile-modules {
  background-color: #f4f4f4;
  border-radius: 0.25rem;

  .file-list {
    .file-item {
      border: 1px solid #999;
      border-radius: 0.25rem;

      .file-name {
        width: 150px;
        line-height: 2.25;
        font-size: 14px;
        color: #333;
      }

      .icon-close{
          color:  #999;
      }
    }
  }
}
</style>