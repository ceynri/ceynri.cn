<template>
  <PostLayout v-if="$page.post.published">
    <article>
      <header class="post__title">
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
        <ClientOnly>
          <Comment v-if="showComment" />
        </ClientOnly>
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
    comment
  }
}
</page-query>

<script>
import PostMeta from '~/components/PostMeta';
import PostFooter from '~/components/PostFooter';
import Page404 from '~/pages/404';

export default {
  computed: {
    scheme() {
      return this.$store.state.scheme;
    },
    showComment() {
      return this.$page.post.comment;
    },
  },
  watch: {
    scheme() {
      this.reloadComment();
    },
  },
  methods: {
    reloadComment() {
      if (!this.showComment) {
        return;
      }
      // use v-if to forced refresh component
      this.showComment = false;
      this.$nextTick(() => {
        this.showComment = true;
      });
    },
  },
  components: {
    PostMeta,
    PostFooter,
    Page404,
    Comment: () => import('~/components/Comment.vue'),
  },
  metaInfo() {
    if (!this.$page.post.published) {
      return { title: '404' };
    }
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
.post-comments {
  margin: calc(var(--padding-width)) 0;

  &:empty {
    display: none;
  }
}
</style>
