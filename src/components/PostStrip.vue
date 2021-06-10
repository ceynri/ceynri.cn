<template>
  <div class="post-strip content-box">
    <div class="post-strip__content">
      <h4 class="post-strip__title" v-html="post.title" />
      <PostMeta class="post-strip__meta" :post="post" />
      <g-link class="post-strip__link" :to="post.path">Link</g-link>
    </div>
  </div>
</template>

<script>
import PostMeta from '~/components/PostMeta';

export default {
  components: {
    PostMeta,
  },
  props: ['post'],
};
</script>

<style lang="scss">
.post-strip {
  padding: calc(var(--padding-width) * 0.5);
  border-radius: 0;

  position: relative;

  &:not(:last-child) {
    border-bottom: 1px dotted var(--border-color);
  }

  // &__content {
  //   transition: transform var(--duration);

  //   &:hover {
  //     transform: translateY(-4px);
  //   }
  // }

  &__title {
    margin-top: 0;
  }

  &__link {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    overflow: hidden;
    text-indent: -9999px;
    z-index: 0;
  }
}
</style>
