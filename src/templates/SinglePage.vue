<template>
  <PostLayout>
    <article v-if="$page.page.published">
      <header class="post-page__title">
        <h1>{{ $page.page.title }}</h1>
      </header>

      <section class="post-page content-box">
        <header class="post-page__header">
          <g-image
            alt="Cover image"
            v-if="$page.page.cover_image"
            :src="$page.page.cover_image"
          />
        </header>

        <section class="post-page__content" v-html="$page.page.content" />

        <footer class="post-page__footer">
          <PostTags :tags="tags" />
        </footer>
      </section>
    </article>

    <template v-else class="post-page content-box"
      >该 Blog 暂未公开 🤕</template
    >
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
.post-page {
  &__title {
    padding: calc(var(--padding-width) / 2) 0;
    text-align: center;
  }
  &__content {
    font-size: var(--article-font-size);
    margin-bottom: calc(var(--padding-width) / 2);

    h1:first-child {
      display: none;
    }

    @for $i from 1 through 5 {
      // Consecutive headings
      h#{$i} + h#{$i + 1},
      // Title after <br>
      br + h#{$i},
      // At the beginning heading
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

    a {
      font-size: 100%;
      transition: color var(--duration);

      position: relative;

      &:before {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        width: 61.8%;
        background-color: var(--link-color);
        transition: width var(--duration);
      }

      &:hover {
        color: var(--link-color);

        &::before {
          width: 100%;
        }
      }
    }
  }
}
</style>
