<template>
  <el-dialog
    title="提示"
    :visible.sync="dialogVisible"
    width="30%"
    :before-close="handleClose"
  >
    <div 
      @mousedown.stop="" 
      @mousemove.stop="" 
      @mouseup.stop=""
    >
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleComfirm()">确 定</el-button>
      </span>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
    };
  },
  methods: {
    render(options) {
      this.dialogVisible = true;

      this.initOptions = options;
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },

    handleComfirm() {
      this.dialogVisible = false;
      const { success } = this.initOptions;
      const testRet = "绑定后的的回调结果";

      success && success(testRet);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>