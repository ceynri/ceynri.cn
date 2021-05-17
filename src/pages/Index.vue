<template>
  <Layout :show-logo="false">
    <section class="hero">
      <h1 class="hero__title">Ceynri's Blog</h1>
    </section>

    <!-- List posts -->
    <div class="posts">
      <PostCard v-for="edge in $page.posts.edges" :key="edge.node.id" :post="edge.node" />
    </div>
  </Layout>
</template>

<page-query>
query {
  posts: allPost(filter: { published: { eq: true }}) {
    edges {
      node {
        id
        title
        date (format: "YYYY.MM.DD")
        description
        cover_image (width: 860, height: 400, blur: 10)
        path
        tags {
          id
          title
          path
        }
      }
    }
  }
}
</page-query>

<script>
import PostCard from '~/components/PostCard.vue';

export default {
  components: {
    PostCard,
  },
  metaInfo: {
    title: 'Blogs',
  },
};
</script>

<style lang="scss">
.hero {
  padding: calc(var(--space) / 2) 0;

  &__title {
    font-size: 3em;
    color: var(--title-color);
    text-align: center;
  }
}
</style>
