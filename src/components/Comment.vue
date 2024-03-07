<template>
  <giscus-widget
    id="giscus"
    repo="ceynri/ceynri.cn"
    repoid="MDEwOlJlcG9zaXRvcnkyMzg4NDQwNzg="
    category="Announcements"
    categoryid="MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMzMDQxNzg2"
    mapping="title"
    reactionsenabled="1"
    emitmetadata="0"
    inputposition="top"
    :theme="scheme"
    lang="zh-CN"
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
  },
  data() {
    return {
      scheme: this.theme || this.$store.state.scheme,
    };
  },
};
</script>
