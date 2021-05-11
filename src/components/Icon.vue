<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 1024 1024"
    :aria-labelledby="name"
    role="presentation"
  >
    <title :id="name" lang="en">{{ name }} icon</title>
    <g :fill="color" v-if="html" v-html="html"></g>
    <g :fill="color" v-else><slot /></g>
  </svg>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: '',
    },
    width: {
      type: [Number, String],
      default: 20,
    },
    height: {
      type: [Number, String],
      default: 20,
    },
    color: {
      type: String,
      default: 'currentColor',
    },
    html: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  /* margin-bottom: -2px; */

  pointer-events: none;
}
</style>
