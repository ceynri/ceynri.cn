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
      :src="picUrl"
      alt=""
      class="floating-image"
    >
  </div>
</template>

<script>
export default {
  props: {
    targetDom: {
      type: HTMLAnchorElement,
      default: null,
    },
  },
  data() {
    return {
      picUrl: '',
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
        this.posX = event.clientX;
        this.posY = event.clientY;
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
  }
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
    max-width: 80vw;
    max-height: 80vh;
  }
}
</style>
