<template>
  <Layout v-if="$page.page.published">
    <article class="single-page">
      <section class="content-box post">
        <div class="post__header">
          <g-image
            alt="Cover image"
            v-if="$page.page.cover_image"
            :src="$page.page.cover_image"
          />
        </div>
        <header class="post__title">
          <h1>{{ $page.page.title }}</h1>
        </header>

        <section class="post__content" v-html="$page.page.content" />

        <footer class="post__footer">
          <PostTags :tags="tags" />
        </footer>
      </section>
    </article>
  </Layout>

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
    if (!this.$page.page.published) {
      return { title: '404' };
    }
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
// overwrite
.single-page {
  .post {
    &__title {
      padding: 0 0 3em;
      text-align: left;

      h1 {
        font-size: 2em;
        margin-bottom: 0;
      }
    }

    &__content {
      // h1:first-child {
      //   display: block;
      // }

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
}
</style>
