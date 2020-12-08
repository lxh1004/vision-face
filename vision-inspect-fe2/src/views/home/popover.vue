<template>
  <div v-if="popover" id="popover" :style="{ width: `${popover.left}px`, height: `${height}px` }">
    <SignedImage :image="popover.image" :region="popover.region" :rectify="popover.rectify" />
  </div>
</template>

<script>
import SignedImage from "@/components/signedImage";

export default {
  // global awareness
  name: "Popover",

  // template dependencies
  components: {
    SignedImage,
  },

  // interface
  props: {
    popover: Object,
  },

  // local state
  data() {
    return {
      height: window.innerHeight - 70,
    };
  },
};
</script>

<style lang="scss">
#popover {
  width: 600px;
  height: 450px;
  position: fixed;
  top: 70px;
  left: 0;
  z-index: 10;
  .signed-image {
    width: 100%;
    height: 100%;
  }
}
</style>
