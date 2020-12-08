<template>
  <el-container class="draw">
    <el-main>
      <Canvas :styles="style" @draw="handleDraw" :drawType="drawType" />
      <SignedImage
        :image="src"
        :region="regions"
        :highlight="selected"
        @style="handleSetStyle"
        @scale="handleSetScale"
      />
    </el-main>
    <el-aside width="300px">
      <Sidebar
        :region="regions"
        :selected.sync="selected"
        @submit="handleSubmit"
        @close="handleClose"
        @delete="handleDelete"
      />
    </el-aside>
    <el-dialog
      :visible.sync="selectRegionType"
      title="请选择6S事件类型"
      custom-class="checkRegionType"
      width="570px"
      @close="handleCloseDialog"
      append-to-body
    >
      {{ drawType }}
      <el-form class="demo-ruleForm">
        <el-form-item>
          <el-checkbox-group v-model="regionType">
            <el-checkbox
              name="type"
              v-for="type in regionTypes"
              :key="type"
              :label="type"
              :value="type"
            ></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseDialog">取消</el-button>
        <!-- <el-button @click="selectRegionType = false">取消</el-button> -->
        <el-button type="primary" @click="handleAddRegion">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
import Canvas from './canvas'
import SignedImage from '@/components/signedImage'
import Sidebar from './sidebar'

export default {
  // global awareness
  name: 'Draw',

  // template dependencies
  components: {
    Canvas,
    SignedImage,
    Sidebar,
  },

  // interface
  props: {
    src: {
      type: String,
      required: true,
    },
    region: Array,
    smart: Number,
    drawType: String,
  },

  // local state
  data() {
    return {
      regions: this.region || [],
      style: {
        width: '0',
        height: '0',
        top: '0',
        left: '0',
      },
      scale: 0,
      selected: null,
      selectRegionType: false,
      regionType: [],
      regionTypes: [
        '物料摆放不整齐',
        '物料占道',
        '物料混放',
        '物料压线',
        '有遮挡布',
        '黄线破损、不清晰、缺失',
        '物品破损、积灰',
        '物料乱放',
        '物料堆叠超高',
        '物料超出定容',
        '地面破损',
        '地面脏',
        '地面有垃圾',
        '地面有水渍/油渍',
        '物品乱放',
        '物品/设备积灰',
        '设备平台未打扫',
        '线束乱',
        '工件着地',
        '废料混放',
        '垃圾超出堆放区域',
        '焊渣未清理',
        '垃圾超出定容',
      ],
      newRegion: [],
    }
  },

  // non-reactive properties
  methods: {
    // handle save current region
    handleDraw(region) {
      this.selectRegionType = true
      this.newRegion = region
    },

    // handle set style
    handleSetStyle(style) {
      this.style = style
    },

    // handle set style
    handleSetScale(scale) {
      this.scale = scale
    },

    // handle submit region
    handleSubmit() {
      this.$emit('submit', this.regions, this.smart)
    },

    // handle close board
    handleClose() {
      this.$emit('close')
    },

    // handle delete a region
    handleDelete(index) {
      this.regions.splice(index, 1)
    },

    // handle save current region
    handleAddRegion() {
      this.regions.push({
        polygon: this.newRegion.map((r) => this._fix(r)),
        type: this.regionType,
      })
      this.selectRegionType = false
      this.regionType = []
    },

    handleCloseDialog() {
      this.selectRegionType = false
      this.regionType = []
    },
    // private functions
    // fix points
    _fix({ x, y }) {
      return { x: x * this.scale, y: y * this.scale }
    },
  },
}
</script>

<style lang="scss">
.draw {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;
  .signed-image {
    width: 100%;
    height: 100%;
  }
}
.demo-ruleForm .el-checkbox {
  width: 136px;
}
.checkRegionType .el-dialog__body {
  padding: 13px 20px;
}
</style>