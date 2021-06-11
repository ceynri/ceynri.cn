<template>
  <PostLayout>
    <template v-if="$page.page.published">
      <div class="post-title">
        <h1 class="post-title__text">
          {{ $page.page.title }}
        </h1>
      </div>

      <div class="post content-box">
        <div class="post__header">
          <g-image
            alt="Cover image"
            v-if="$page.page.cover_image"
            :src="$page.page.cover_image"
          />
        </div>

        <div class="post__content link-highlight" v-html="$page.page.content" />

        <div class="post__footer">
          <PostTags :tags="$page.page.tags" />
        </div>
      </div>
    </template>
    <template v-else class="post content-box">该 Blog 暂未公开 🤕</template>
  </PostLayout>
</template>

<page-query>
query SinglePage ($id: ID!) {
  page: singlePage (id: $id) {
    title
    path
    date (format: "MMM DD, YYYY")
    tags {
      id
      title
      path
    }
    content
    published
  }
}
</page-query>

<script>
import PostTags from '~/components/PostTags';

export default {
  components: {
    PostTags,
  },
  metaInfo() {
    return {
      title: this.$page.page.title,
      meta: [
        {
          name: 'description',
          content: this.$page.page.description,
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.post-title {
  padding: calc(var(--padding-width) / 2) 0;
  text-align: center;
}

.post {
  &__header {
    width: calc(100% + var(--padding-width) * 2);
    margin-left: calc(var(--padding-width) * -1);
    margin-top: calc(var(--padding-width) * -1);
    margin-bottom: calc(var(--padding-width) / 2);

    border-radius: var(--radius) var(--radius) 0 0;
    overflow: hidden;

    display: flex;

    img {
      width: var(--thin-main-width);
      flex: 1;
    }

    &:empty {
      display: none;
    }
  }

  &__content {
    font-size: var(--article-font-size);
    margin-bottom: calc(var(--padding-width) / 2);

    h1:first-child {
      display: none;
    }

    @for $i from 1 through 5 {
      // 连续的标题
      h#{$i} + h#{$i + 1},
      // br标签后的标题
      br + h#{$i},
      // 处于开头的标题
      h#{$i}:first-child {
        margin-top: 0;
      }
    }

    img {
      display: block;

      // full
      margin-left: calc(var(--padding-width) * -1);
      margin-right: calc(var(--padding-width) * -1);
      width: calc(100% + var(--padding-width) * 2);
      max-width: none;

      &[alt*='size=small'],
      &[alt*='size=medium'],
      &[alt*='size=large'],
      &[alt*='size=auto'] {
        margin-left: auto;
        margin-right: auto;
        width: initial;
      }

      &[alt*='size=small'] {
        max-width: 50%;
      }

      &[alt*='size=medium'] {
        max-width: calc(0.618 * (100% + 2 * var(--padding-width)));
      }

      &[alt*='size=large'],
      &[alt*='size=auto'] {
        max-width: 100%;
      }

      &[alt*='size=full'] {
        // default
      }
    }
  }
}

.post-comments {
  padding: calc(var(--padding-width) / 2);

  &:empty {
    display: none;
  }
}
</style>
