<template>
  <div class="post-meta">
    {{ post.date }}
    <template v-if="post.timeToRead">
      {{ post.timeToRead }} min read.
    </template>
  </div>
</template>

<script>
export default {
  props: ['post'],
};
</script>

<style lang="scss">
.post-meta {
  font-size: 0.8em;
  opacity: 0.8;
}
</style>
