<template>
  <PostLayout v-if="$page.page.published">
    <article>
      <header class="single-page__title">
        <h1>{{ $page.page.title }}</h1>
      </header>

      <section class="single-page content-box">
        <header class="single-page__header">
          <g-image
            alt="Cover image"
            v-if="$page.page.cover_image"
            :src="$page.page.cover_image"
          />
        </header>

        <section class="single-page__content" v-html="$page.page.content" />

        <footer class="single-page__footer">
          <PostTags :tags="tags" />
        </footer>
      </section>
    </article>
  </PostLayout>
  
  <!-- Bottom-up strategy -->
  <Page404 v-else />
</template>

<page-query>
query SinglePage ($id: ID!) {
  page: singlePage (id: $id) {
    title
    path
    date (format: "MMM DD, YYYY")
    tags
    content
    published
  }
}
</page-query>

<script>
import PostTags from '~/components/PostTags';
import Page404 from '~/pages/404';

export default {
  components: {
    PostTags,
    Page404,
  },
  computed: {
    tags() {
      const tags = this.$page.page.tags;
      // SinglePage is not included in the tags list, so it needs to be compatible
      if (typeof tags?.[0] === 'string') {
        return tags.map((tag) => ({
          id: tag,
          title: tag,
          path: `/blog/tags/${tag}`,
        }));
      }
      return tags;
    },
  },
  metaInfo() {
    if (this.$page.page.published) {
      return {
        title: this.$page.page.title,
        meta: [
          {
            name: 'description',
            content: this.$page.page.description,
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
.single-page {
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
