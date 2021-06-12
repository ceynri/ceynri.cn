<template>
  <PostLayout v-if="$page.post.published">
    <article>
      <header class="post-title">
        <h1 class="post-title__text">
          {{ $page.post.title }}
        </h1>

        <PostMeta :post="$page.post" />
      </header>

      <section class="post content-box">
        <header class="post__header">
          <g-image
            alt="Cover image"
            v-if="$page.post.cover_image"
            :src="$page.post.cover_image"
          />
        </header>

        <section
          class="post__content link-highlight"
          v-html="$page.post.content"
        />
        <PostFooter :post="$page.post" />
      </section>

      <article class="post-comments">
        <!-- Add comment widgets here -->
      </article>
    </article>
  </PostLayout>

  <!-- Bottom-up strategy -->
  <Page404 v-else />
</template>

<page-query>
query Post ($id: ID!) {
  post (id: $id) {
    title
    path
    date (format: "MMM DD, YYYY")
    lastmod (format: "MMM DD, YYYY")
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
import PostFooter from '~/components/PostFooter';
import Page404 from '~/pages/404';

export default {
  components: {
    PostMeta,
    PostFooter,
    Page404,
  },
  metaInfo() {
    if (this.$page.post.published) {
      return {
        title: this.$page.post.title,
        meta: [
          {
            name: 'description',
            content: this.$page.post.description,
          },
        ],
      };
    }
    return {
      title: '404',
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

    br:last-child {
      display: none;
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
