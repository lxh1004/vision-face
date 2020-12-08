<template>
  <canvas
    ref="canvas"
    class="draw__canvas"
    :width="styles.width"
    :height="styles.height"
    :style="styles"
    @click="handleDraw"
    @mousemove="handleMove"
    @contextmenu.prevent="handleStopDraw"
  />
</template>

<script>
import _ from 'lodash'

export default {
  // global awareness
  name: 'DrawCanvas',

  // interface
  props: {
    styles: {
      type: Object,
      required: true,
    },
    drawType: String,
  },

  // local state
  data() {
    return {
      polygon: [],
      current: { x: 0, y: 0 },
      startX: '', //画画开始的X坐标
      startY: '', //画画开始的Y坐标
      endX: '', //画画结束的X坐标
      endY: '', //画画结束的Y坐标
      isMouseDownInCanvas: '', //鼠标是否按下
    }
  },
  computed: {
    left() {
      return parseFloat(this.styles.left)
    },
    top() {
      return parseFloat(this.styles.top)
    },
  },

  // non-reactive properties
  methods: {
    // handle draw
    handleDraw(e) {
      if (this.drawType === 'polygon') {
        this.polygon.push(this._fix(e))
      } else if (this.drawType === 'rect') {
        this.isMouseDownInCanvas = true
        // 鼠标按下时开始位置与结束位置相同
        // 防止鼠标在画完矩形后 点击图画形成第二个图形
        this.endX = e.clientX - this.left
        this.endY = e.clientY - this.top
        this.startX = e.clientX - this.left
        this.startY = e.clientY - this.top
        this.handleMove(e)
      }
    },

    // handle moving
    handleMove(e) {
      if (this.drawType === 'polygon') {
        this.current = this._fix(e)
        if (this.polygon.length > 0) {
          this._draw()
        }
      } else if (this.drawType === 'rect') {
        if (this.isMouseDownInCanvas) {
          // 当鼠标有按下操作时执行
          const context = this.$refs.canvas.getContext('2d')
          context.clearRect(
            0,
            0,
            this.$refs.canvas.width,
            this.$refs.canvas.height
          )
          this.endX = e.clientX - this.left
          this.endY = e.clientY - this.top
          let wwidth = this.endX - this.startX
          let wheigth = this.endY - this.startY

          // 清除指定区域的所有像素

          context.beginPath()
          context.strokeStyle = '#409eff' //矩形框颜色
          context.lineWidth = '2' //矩形框宽度

          context.strokeRect(this.startX, this.startY, wwidth, wheigth) //绘制矩形
          context.closePath()
        }
      }
    },

    // handle stop drawing
    handleStopDraw() {
      if (this.drawType === 'polygon') {
        if (this.polygon.length >= 3) {
          this.$emit('draw', _.cloneDeep(this.polygon))
        }
      } else if (this.drawType === 'rect') {
        this.isMouseDownInCanvas = false
        //坐标 为 (a,b)  (a,d) (c,d) ,(c,b)
        let arr = [
          {
            x: this.startX,
            y: this.startY,
          },
          {
            x: this.startX,
            y: this.endY,
          },
          {
            x: this.endX,
            y: this.endY,
          },
          {
            x: this.endX,
            y: this.startY,
          },
        ]
        this.$emit('draw', _.cloneDeep(arr))
      }
      this.polygon = []
      this._draw()
    },

    // private functions
    // fit point
    _fix(e) {
      return { x: e.clientX - this.left, y: e.clientY - this.top }
    },

    // draw polygon
    _draw() {
      if (this.$refs.canvas) {
        const context = this.$refs.canvas.getContext('2d')
        context.clearRect(
          0,
          0,
          this.$refs.canvas.width,
          this.$refs.canvas.height
        )
        if (this.drawType === 'polygon') {
          if (this.polygon.length > 0) {
            context.lineWidth = 2
            context.strokeStyle = '#409eff'
            context.beginPath()
            context.moveTo(this.polygon[0].x, this.polygon[0].y)
            for (let i = 1; i < this.polygon.length; i++) {
              context.lineTo(this.polygon[i].x, this.polygon[i].y)
            }
            context.lineTo(this.current.x, this.current.y)
            context.closePath()
            context.stroke()
          }
        }
      }
    },
  },
}
</script>

<style lang="scss">
.draw__canvas {
  position: absolute;
  z-index: 10;
}
</style>