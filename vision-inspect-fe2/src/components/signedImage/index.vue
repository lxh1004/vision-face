<template>
  <div ref="wrap" class="signed-image" >
    <canvas ref="canvas" :width="style.width" :height="style.height"  :style="style" />
    <img :src="image" alt :style="style"    :class="[rectify==1?'cheek':'']" @load="handleLoad" />
  </div>
</template>

<script>
export default {
  // global awareness
  name: "SignedImage",

  // interface
  props: {
    image: {
      type: String,
      required: true
    },
    rectify: Number,
    region: Array,
    highlight: {
      type: Number,
      default: null
    }
  },

  // local state
  data() {
    return {
      // sizes and positions
      size: { width: 0, height: 0 },
      naturalSize: { width: 0, height: 0 }
    };
  },
  computed: {
    // sizes and positions
    scale() {
      if (
        this.size.width === 0 ||
        this.size.height === 0 ||
        this.naturalSize.width === 0 ||
        this.naturalSize.height === 0
      ) {
        return 1;
      } else if (
        this.size.width / this.size.height >
        this.naturalSize.width / this.naturalSize.height
      ) {
        return this.naturalSize.height / this.size.height;
      } else {
        return this.naturalSize.width / this.size.width;
      }
    },
    imageSize() {
      return {
        width: this.naturalSize.width / this.scale ,
        height: this.naturalSize.height / this.scale 
      };
    },
    imagePosition() {
      return {
        top: (this.size.height - this.imageSize.height) / 2 ,
        left: (this.size.width - this.imageSize.width) / 2 
      };
    },
    style() {
      return {
        width: `${this.imageSize.width}px`,
        height: `${this.imageSize.height}px`,
        top: `${this.imagePosition.top}px`,
        left: `${this.imagePosition.left}px`
      };
    }
  },

  // events
  watch: {
    region(newRegion) {
      this._draw(newRegion, this.highlight);
    },
    highlight(newHighlight) {
      this._draw(this.region, newHighlight);
    },
    style(newStyle) {
      this.$emit("style", newStyle);
    },
    scale(newScale) {
      this.$emit("scale", newScale);
    }
  },
  async mounted() {
    this._setSize();
    await this.$nextTick();
    this._draw(this.region, this.highlight);
  },

  // non-reactive properties
  methods: {
    // handle image loaded
    async handleLoad(e) {
      this.naturalSize = {
        width: e.target.naturalWidth,
        height: e.target.naturalHeight
      };
      await this.$nextTick();
      this._draw(this.region, this.highlight);
    },

    // set size
    _setSize() {
      this.size = {
        width: this.$refs.wrap.clientWidth,
        height: this.$refs.wrap.clientHeight
      };
    },

    // draw figure
    _draw(region, highlight) {
      if (!this.$refs.canvas) {
        return;
      }
      const context = this.$refs.canvas.getContext("2d");
      context.clearRect(
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height
      );
      if (region) {
        context.lineWidth = 2;
        context.strokeStyle = "#f00";
        context.fillStyle = "rgba(255, 0, 0, .3)";
        for (let i = 0; i < region.length; i++) {
          if (highlight === null || highlight === i) {
            const { polygon } = region[i];
            context.beginPath();
            context.moveTo(
              polygon[0].x / this.scale,
              polygon[0].y / this.scale
            );
            for (let i = 1; i < polygon.length; i++) {
              context.lineTo(
                polygon[i].x / this.scale,
                polygon[i].y / this.scale
              );
            }
            context.closePath();
            context.stroke();
          }
          if (highlight === i) {
            context.fill();
          }
        }
      }
    }
  }
};
</script>

<style lang="scss">
.signed-image {
  position: relative;
  canvas {
    position: absolute;
    z-index: 1;
  }
  img {
    display: block;
    position: absolute;
    z-index: 0;
  }
}
.cheek {
  border: 2px solid #f00;
}
</style>
