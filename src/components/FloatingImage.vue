<template>
  <div
    class="floating-image-container"
    :class="{
      'hovering': isHovering,
      'move-ease': moveEase,
    }"
    :style="{
      transform: `translate(${posX}px, ${posY}px)`,
    }"
  >
    <img
      ref="floatingImageRef"
      :src="picUrl"
      alt=""
      class="floating-image"
      @load="onPicLoad"
    >
  </div>
</template>

<script>
import { limitToInterval } from '~/utils/number';

export default {
  props: ['targetDom'],
  data() {
    return {
      picUrl: '',
      picWidth: 0,
      picHeight: 0,
      posX: 0,
      posY: 0,
      easeTimer: null,
      isHovering: false,
      moveEase: false,
    };
  },
  mounted() {
    if (this.targetDom) {
      this.addFloatingImageForLink(this.targetDom);
    }
  },
  methods: {
    addFloatingImageForLink(targetDom) {
      // image DOM
      this.picUrl = targetDom.href;

      targetDom.addEventListener('mousemove', (event) => {
        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;
        const halfPicWidth = this.picWidth / 2;
        const halfPicHeight = this.picHeight / 2;
        this.posX = limitToInterval(event.clientX, [halfPicWidth, windowWidth - halfPicWidth]);
        this.posY = limitToInterval(event.clientY, [halfPicHeight, windowHeight - halfPicHeight]);

        this.isHovering = true;

        // delay a little time to avoid the image moving from the previous position with animation
        clearTimeout(this.easeTimer);
        this.easeTimer = setTimeout(() => {
          this.moveEase = true;
        }, 100);
      });

      targetDom.addEventListener('mouseleave', () => {
        this.isHovering = false;
        // delay to avoid the image moving animation end suddenly
        clearTimeout(this.easeTimer);
        this.easeTimer = setTimeout(() => {
          this.moveEase = false;
        }, 500);
      });
    },
    onPicLoad() {
      this.picWidth = this.$refs.floatingImageRef.width;
      this.picHeight = this.$refs.floatingImageRef.height;
    },
  },
};
</script>

<style lang="scss">
.floating-image-container {
  position: fixed;
  opacity: 0;
  pointer-events: none;
  z-index: 99;
  top: 0;
  left: 0;
  transition: opacity 0.5s ease;

  &.hovering {
    opacity: 1;
  }

  &.move-ease {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  
  .floating-image {
    transform: translate(-50%, -50%);
    $widthScale: 0.5;
    $heightScale: 0.5;
    width: $widthScale * 100%;
    height: $heightScale * 100%;
    max-width: calc(80vw / $widthScale);
    max-height: calc(80vh / $heightScale);
  }
}
</style>
