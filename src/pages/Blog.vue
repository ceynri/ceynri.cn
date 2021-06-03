<template>
  <Layout>
    <div class="posts">
      <PostCard
        v-for="edge in $page.posts.edges"
        :key="edge.node.id"
        :post="edge.node"
      />
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
        cover_image (width: 900, height: 400, blur: 10, quality: 90)
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
  mounted() {
    setTimeout(() => {
      // add loaded class to add css transition on the body
      document.body.classList.add('loaded');
    }, 1000);
  },
  components: {
    PostCard,
  },
  metaInfo: {
    title: '山风的小角落',
    titleTemplate: '%s',
  },
};
</script>

<style lang="scss">
</style>
