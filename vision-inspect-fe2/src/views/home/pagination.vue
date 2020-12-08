<template>
  <div id="pagination">
    <el-pagination
      background
      layout="total, prev, pager, next, jumper"
      :page-size="pageSize"
      :total="total"
      :current-page="page"
      @current-change="handlePage"
    />
  </div>
</template>

<script>
export default {
  // global awareness
  name: "pagination",
  data() {
    return {
      
    };
  },
  // interface
  props: {
    pageSize: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
  },
  created() {
  
  },
  // non-reative properties
  methods: {
    // handle change current page
    handlePage(page) {
      // this.pagenum = page;
      this.$emit("page", page);
    },
  },
};
</script>

<style lang="scss">
#pagination {
  padding: 30px;
  background: #fff;
  display: flex;
  justify-content: right;
  .el-pagination {
    margin-left: auto;
  }
}
</style>