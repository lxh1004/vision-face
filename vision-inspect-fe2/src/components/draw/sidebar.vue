<template>
  <div class="draw__sidebar">
    <div class="draw__sidebar__header">
      <el-button-group class="board__button-group">
        <el-button size="small" type="success" round
          plain icon="el-icon-check"
          @click="handleSubmit" />
        <el-button size="small" type="danger" round
          plain icon="el-icon-close"
          @click="handleClose" />
      </el-button-group>
    </div>
    <div class="draw__sidebar__main">
      <ul class="draw__sidebar__list">
        <li v-for="(r, index) in region"
          :key="index"
          :class="{ selected: selected === index }"
          @click="handleSelect(index)">
          <p>{{Array.isArray(r.type) ? r.type.join(',') : r.type}}</p>
          <el-button size="mini" type="danger" plain
            circle icon="el-icon-delete"
            @click.stop="handleDelete(index)" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  // global awareness
  name: 'DrawSidebar',

  // interface
  props: {
    region: Array,
    selected: Number
  },

  // non-reactive properties
  methods: {
    // handle submit
    handleSubmit () {
      this.$emit('submit')
    },

    // handle close
    handleClose () {
      this.$emit('close')
    },

    // handle select a region
    handleSelect (index) {
      if (index !== this.selected) {
        this.$emit('update:selected', index)
      }
      else {
        this.$emit('update:selected', null)
      }
    },

    // handle select a region
    handleDelete (index) {
      if (index === this.selected) {
        this.$emit('update:selected', null)
      }
      this.$emit('delete', index)
    }
  }
}
</script>

<style lang="scss">
.draw__sidebar {
  height: 100%;
  background: #eee;
  border-left: 1px solid #dcdcdc;
  display: flex;
  flex-direction: column;
  &>div {padding: 15px 20px;}
  .draw__sidebar__header {border-bottom: 1px solid #dcdcdc;display: flex;justify-content: flex-end;}
  .draw__sidebar__main {
    flex: auto;
    .draw__sidebar__list {
      height: 100%;
      background: #fff;
      border: 1px solid #dcdcdc;
      box-sizing: border-box;
      list-style: none;
      li {
        padding: 15px 20px;
        font-size: 14px;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {background: #ecf5ff;}
        &.selected {background: #d9ecff;}
        &>p {flex: auto;margin-right: 10px;}
      }
    }
  }
}
</style>