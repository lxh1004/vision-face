<template>
  <div id="table">
    <el-table
      :data="data"
      :row-class-name="getRowClassName"
      row-key="id"
      @cell-mouse-enter="handleMouseEnter"
      @cell-mouse-leave="handleMouseLeave"
      @sort-change="handleSort"
    >
      <el-table-column label="事业部" prop="department" />
      <el-table-column label="公司" prop="company" />
      <el-table-column label="设备名称" prop="name" />
      <el-table-column label="设备IP" prop="ip" />
      <el-table-column label="时间" prop="time" />
      <el-table-column label="图片" width="100px" class-name="table__image">
        <template #default="{ row: { image, region, rectify } }">
          <SignedImage
            :image="image"
            :region="region"
            :rectify="rectify"
            :style="{
              width: rectify == 1 ? '96px' : '100px',
              height: rectify == 1 ? '71px' : '75px',
            }"
            @mouseenter.native="
              handleShowPopover({ image, region, rectify }, $event)
            "
            @mouseleave.native="handleHidePopover"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="置信度"
        prop="confidence"
        sortable="custom"
        width="60px"
      />
      <el-table-column label="生产现场操作" width="120px">
        <template #default="{ row: { region, audit, smartCube }, $index }">
          <el-button-group v-if="flag">
            <el-button
              size="mini"
              type="danger"
              :plain="audit !== 2"
              circle
              icon="el-icon-document-delete"
              title="标记为不合格"
              @click="handleAudit($index, 2)"
            />
            <el-button
              size="mini"
              type="warning"
              :plain="audit !== 3"
              circle
              icon="el-icon-table-lamp"
              title="标记为灯塔工厂不合格"
              @click="handleAudit($index, 3)"
            />
            <el-button
              size="mini"
              type="info"
              :plain="audit !== 4"
              circle
              icon="el-icon-user"
              title="作业期间不合格"
              @click="handleAudit($index, 4)"
            />
          </el-button-group>
          <br />
          <el-button-group v-if="flag">
            <el-button
              size="mini"
              type="success"
              :plain="audit !== 0"
              circle
              icon="el-icon-check"
              title="标记为合格"
              @click="handleAudit($index, 0)"
            />
            <el-button
              size="mini"
              type="primary"
              circle
              icon="el-icon-edit-outline"
              title="标注违规区域"
              @click="handleDraw($index, smartCube)"
            />
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column label="标准图册操作" width="120px">
        <template #default="{ row: { region, audit, smartCube }, $index }">
          <el-button-group v-if="!flag">
            <el-button
              size="mini"
              type="success"
              :plain="audit !== 0"
              circle
              icon="el-icon-check"
              title="标记为合格"
              @click="handlePhoto($index, 0)"
            />
            <el-button
              size="mini"
              type="danger"
              :plain="audit !== 2"
              circle
              icon="el-icon-document-delete"
              title="标记为不合格"
              @click="handlePhoto($index, 2)"
            />

            <el-button
              size="mini"
              type="primary"
              circle
              icon="el-icon-edit-outline"
              title="标注违规区域"
              @click="handleDraw($index, smartCube)"
            />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <Draw
      v-if="drawId !== null"
      :src="drawSrc"
      :drawType="drawType"
      :smart="drawSmart"
      :region="drawRegion"
      @submit="handleSubmitRegion"
      @close="handleCloseBoard"
    />
  </div>
</template>

<script>
import {
  getInspections,
  editInspectRegion,
  editInspectAudit,
  editNotInspect,
} from '@/api/inspect'
import {
  edditPhotoesAudit,
  getPhotoInspections,
  editPhotoRegion,
  // getInspections,
} from '@/api/photoes'
// components
import SignedImage from '@/components/signedImage'
import Draw from '@/components/draw'

export default {
  // global awareness
  name: 'Table',

  // template dependencies
  components: {
    SignedImage,
    Draw,
  },

  // interface
  prop: {
    popover: String,
  },

  // local state
  data() {
    return {
      data: [],
      currentData: {},
      currentPage: 1,
      // drawing board parameters
      drawId: null,
      drawSrc: null,
      drawRegion: null,
      drawSmart: null,
      flag: true,
      drawType: 'rect', // 'polygon'  多边形 rect  矩形
      // sort parameters
      sort: { prop: '', order: null },
    }
  },

  // non-reactive properties
  methods: {
    // handle show popover
    handleShowPopover(popover, e) {
      const rect = e.target.getBoundingClientRect()
      this.$emit('update:popover', {
        ...popover,
        left: rect.left - 10,
      })
    },

    //mouse enter
    handleMouseEnter(row, column, cell, event) {
      if (column.label == '置信度') {
        let popover = {
          image: row.image,
          region: row.region,
          rectify: row.rectify,
        }
        const rect = event.target.getBoundingClientRect()
        this.$emit('update:popover', {
          ...popover,
          left: rect.left - 10 - 100,
        })
      } else if (column.label == '生产现场操作') {
        let popover = {
          image: row.image,
          region: row.region,
          rectify: row.rectify,
        }
        const rect = event.target.getBoundingClientRect()
        this.$emit('update:popover', {
          ...popover,
          left: rect.left - 10 - 160,
        })
      } else if (column.label == '标准图册操作') {
        let popover = {
          image: row.image,
          region: row.region,
          rectify: row.rectify,
        }
        const rect = event.target.getBoundingClientRect()
        this.$emit('update:popover', {
          ...popover,
          left: rect.left - 10 - 280,
        })
      }
    },

    // handle photo
    async handlePhoto(index, audit) {
      try {
        await edditPhotoesAudit(this.data[index].id, audit)

        this.$set(this.data[index], 'audit', audit)
        this.$message.success('已标注审核结果。')
      } catch (e) {
        console.error(e)
        this.$message.error(`标注审核结果失败：${e.message}`)
      }
    },

    //mouse leave
    handleMouseLeave() {
      this.$emit('update:popover', null)
    },
    // handle hide popover
    handleHidePopover() {
      this.$emit('update:popover', null)
    },

    // handle draw figure
    handleDraw(index, val) {
      this.drawId = this.data[index].id || null
      this.drawSrc = this.data[index].image || null
      this.drawRegion = this.data[index].region || null
      this.drawSmart = val || null
    },

    // handle audit image
    async handleAudit(index, audit) {
      try {
        await editInspectAudit(this.data[index].id, audit)
        this.$set(this.data[index], 'audit', audit)

        // if (this.currentData["page" + this.currentPage]) {
        //   this.currentData["page" + this.currentPage].splice(index, 1);
        //   console.log('操作后：',this.currentData["page" + this.currentPage]);
        // }

        this.$message.success('已标注审核结果。')
      } catch (e) {
        console.error(e)
        this.$message.error(`标注审核结果失败：${e.message}`)
      }
    },

    // handle sign camera as not_inspect
    async handleNotInspect(index) {
      try {
        await this.$confirm(
          '此操作将使该设备不再提供审核，不可撤回，是否继续？',
          '提示',
          { type: 'warning' }
        )
      } catch (e) {
        return
      }
      try {
        const cameraId = this.data[index].camera_id
        await editNotInspect(cameraId)
        this.$message.success('已将该设备标注为非6S设备。')
      } catch (e) {
        console.error(e)
        this.$message.error(`将该设备标注为非6S设备失败：${e.message}`)
      }
    },

    // handle submit region
    async handleSubmitRegion(region, val) {
      try {
        if (val == null) {
          await editInspectRegion(this.drawId, region)
          for (const i in this.data) {
            if (this.data[i].id === this.drawId) {
              this.$set(this.data[i], 'region', region)
              break
            }
          }
          this.handleCloseBoard()
          this.$message.success('违规区域保存成功。')
        } else {
          await editPhotoRegion(this.drawId, region)
          for (const i in this.data) {
            if (this.data[i].id === this.drawId) {
              this.$set(this.data[i], 'region', region)
              break
            }
          }
          this.handleCloseBoard()
          this.$message.success('违规区域保存成功。')
        }
      } catch (e) {
        console.error(e)
        this.$message.error(`违规区域保存失败：${e.message}`)
      }
    },

    // handle close drawing board
    handleCloseBoard() {
      this.drawId = null
    },

    // handle sort
    handleSort({ prop, order }) {
      this.sort = { prop, order }
      this.$emit('sort')
    },

    // get row class name  confidence  is_atlas
    getRowClassName({ row: { rectify, is_atlas } }) {
      let backone = ''
      let backtwo = ''
      if (is_atlas) {
        backone = 'bg'
      }
      if (rectify !== 0) {
        backtwo = 'rectify'
      }
      return backone + ' ' + backtwo
      // return confidence == 0 ? "bg" : "";
      // return rectify !== 0 ? "rectify" : "";
    },

    // search
    async search(query) {
      if (query.is_atlas) {
        const { total, data } = await getPhotoInspections(query, this.sort)

        this.data = data
        this.flag = false
        this.$emit('setTotal', total)
      } else {
        const { total, data } = await getInspections(query, this.sort)
        // let key = "page" + query.page_num;
        // this.currentPage = query.page_num;
        // this.currentData[key] = data;
        // if(this.currentPage){
        //  console.log(this.currentData["page" + this.currentPage],4555454555555555)
        // }
        this.data = data
        this.flag = true
        this.$emit('setTotal', total)
      }
    },
  },
}
</script>

<style lang="scss">
#table {
  .el-table {
    .el-button {
      margin: 2px 0;
    }
    .signed-image {
      cursor: zoom-in;
    }
    .rectify {
      color: #f56c6c;
    }
    .bg {
      background: rgb(225, 243, 216);
    }
    .table__image .cell {
      padding: 0;
    }
  }
}
</style>
