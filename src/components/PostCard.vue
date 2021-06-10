<template>
  <div
    class="post-card content-box"
    :class="{ 'post-card--has-poster': post.poster }"
  >
    <div class="post-card__header">
      <g-image
        alt="Cover image"
        v-if="post.cover_image"
        class="post-card__image"
        :src="post.cover_image"
      />
    </div>
    <div class="post-card__content">
      <h2 class="post-card__title" v-html="post.title" />
      <p class="post-card__description" v-html="post.description" />

      <PostMeta class="post-card__meta" :post="post" />
      <PostTags class="post-card__tags" :tags="post.tags" />

      <g-link class="post-card__link" :to="post.path">Link</g-link>
    </div>
  </div>
</template>

<script>
import PostMeta from '~/components/PostMeta';
import PostTags from '~/components/PostTags';

export default {
  components: {
    PostMeta,
    PostTags,
  },
  props: ['post'],
};
</script>

<style lang="scss">
.post-card {
  margin-bottom: calc(var(--padding-width) / 2);
  position: relative;

  &__header {
    margin-left: calc(var(--padding-width) * -1);
    margin-right: calc(var(--padding-width) * -1);
    margin-bottom: calc(var(--padding-width) / 2);
    margin-top: calc(var(--padding-width) * -1);
    overflow: hidden;
    border-radius: var(--radius) var(--radius) 0 0;

    &:empty {
      display: none;
    }
  }

  &__image {
    min-width: 100%;
  }

  &__title {
    margin-top: 0;
  }

  &:hover {
    transform: translateY(-4px);
    // transform: scale(1.005);
    box-shadow: 2px 8px 48px 4px rgba(#000, 0.05);
  }

  &__tags {
    margin: var(--space) 0 0;
    position: relative;
    z-index: 1;
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
