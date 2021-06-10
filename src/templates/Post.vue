<template>
  <PostLayout>
    <template v-if="$page.post.published">
      <div class="post-title">
        <h1 class="post-title__text">
          {{ $page.post.title }}
        </h1>

        <PostMeta :post="$page.post" />
      </div>

      <div class="post content-box">
        <div class="post__header">
          <g-image
            alt="Cover image"
            v-if="$page.post.cover_image"
            :src="$page.post.cover_image"
          />
        </div>

        <div
          class="post__content link-highlight"
          v-html="$page.post.content"
        />

        <div class="post__footer">
          <PostTags :tags="$page.post.tags" />
        </div>
      </div>

      <div class="post-comments">
        <!-- Add comment widgets here -->
      </div>
    </template>
    <template
      v-else
      class="post content-box"
    >
      该 Post 暂未公开！
    </template>
  </PostLayout>
</template>

<page-query>
query Post ($id: ID!) {
  post: post (id: $id) {
    title
    path
    date (format: "MMM DD, YYYY")
    tags {
      id
      title
      path
    }
    description
    content
    cover_image (width: 900, blur: 10, quality: 98)
    published
  }
}
</page-query>

<script>
import PostMeta from '~/components/PostMeta';
import PostTags from '~/components/PostTags';

export default {
  components: {
    PostMeta,
    PostTags,
  },
  metaInfo() {
    return {
      title: this.$page.post.title,
      meta: [
        {
          name: 'description',
          content: this.$page.post.description,
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
    overflow: hidden;
    border-radius: var(--radius) var(--radius) 0 0;

    img {
      width: 100%;
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

      &[alt$="?size=small"],
      &[alt$="?size=medium"],
      &[alt$="?size=large"],
      &[alt$="?size=auto"] {
        margin-left: auto;
        margin-right: auto;
        width: initial;
      }

      &[alt$="?size=small"] {
        max-width: 50%;
      }

      &[alt$="?size=medium"] {
        max-width: calc(0.618 * (100% + 2 * var(--padding-width)));
      }

      &[alt$="?size=large"],
      &[alt$="?size=auto"] {
        max-width: 100%;
      }

      &[alt$="?size=full"] {
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
