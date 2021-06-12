<template>
  <footer class="post__footer">
    <blockquote v-if="post.lastmod" class="footer-info">
      <p>Last modified on {{ post.lastmod }}.</p>
    </blockquote>
    <PostTags :tags="post.tags" />
  </footer>
</template>

<script>
import PostTags from '~/components/PostTags';

export default {
  props: {
    post: Object,
  },
  components: {
    PostTags,
  },
};
</script>

<style lang="scss">
.post__footer {
  margin-top: var(--padding-width);

  .footer-info {
    color: var(--light-color);
    font-size: 0.9em;
  }
}
</style>
