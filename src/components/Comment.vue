<template>
  <giscus-widget
    id="giscus"
    :key="id"
    repo="ceynri/ceynri.cn"
    repoid="MDEwOlJlcG9zaXRvcnkyMzg4NDQwNzg="
    category="Comments"
    categoryid="DIC_kwDODjx4rs4Cdy2e"
    mapping="title"
    strict="1"
    reactionsenabled="1"
    emitmetadata="0"
    inputposition="top"
    :theme="scheme"
    lang="en"
  ></giscus-widget>
</template>

<script>
import 'giscus';

export default {
  props: {
    /**
     * enum: ['dark', 'light', 'preferred_color_scheme']
     */
    theme: {
      type: String,
    },
    id: {
      type: String,
    }
  },
  data() {
    return {
      scheme: this.theme || this.$store.state.scheme,
    };
  },
};
</script>
