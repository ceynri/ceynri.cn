<template>
  <Layout>
    <div class="posts">
      <PostCard
        v-for="edge in $page.posts.edges"
        :key="edge.node.id"
        :post="edge.node"
      />
    </div>
    <Pagination :page-info="$page.posts.pageInfo" />
  </Layout>
</template>

<page-query>
query ($page: Int) {
  posts: allPost(
    filter: { published: { eq: true } },
    perPage: 8,
    page: $page
  ) @paginate {
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        date (format: "MMM DD, YYYY")
        description
        cover_image (width: 1800, height: 800, blur: 10, quality: 90)
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
import Pagination from '~/components/Pagination.vue';

export default {
  mounted() {
    window.__checkColorScheme();
  },
  components: {
    PostCard,
    Pagination,
  },
  metaInfo: {
    title: '山风的小角落',
    titleTemplate: '%s',
  },
};
</script>

<style lang="scss">
</style>
