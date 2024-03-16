<template>
  <article
    class="post-card content-box"
    :class="{ 'post-card--has-poster': post.poster }"
  >
    <div class="post-card__cover">
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
      <footer>
        <PostMeta class="post-card__meta" :post="post" />
        <PostTags class="post-card__tags" :tags="post.tags" />
      </footer>

      <g-link class="post-card__link" :to="post.path">Link</g-link>
    </div>
  </article>
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

  .post-card__cover {
    margin-left: calc(var(--padding-width) * -1);
    margin-right: calc(var(--padding-width) * -1);
    margin-bottom: calc(var(--padding-width) / 2);
    margin-top: calc(var(--padding-width) * -1);
    overflow: hidden;
    border-radius: var(--radius) var(--radius) 0 0;

    aspect-ratio: 9 / 4;
    position: relative;

    &:empty {
      display: none;
    }
  }

  .post-card__image {
    min-width: 100%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .post-card__title {
    margin-top: 0;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 2px 8px 48px 4px rgba(#000, 0.05);
  }

  .post-card__tags {
    margin: var(--space) 0 0;
    position: relative;
    z-index: 1;

    &:empty {
      display: none;
    }
  }

  .post-card__link {
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
