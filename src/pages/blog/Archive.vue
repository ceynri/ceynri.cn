<template>
  <Layout>
    <dl class="archive-posts">
      <div
        v-for="postGroup in postGroupList"
        :key="postGroup.year"
        class="post-group content-box"
      >
        <dt>{{ postGroup.year }}</dt>
        <dd class="post-list">
          <PostStrip
            v-for="post in postGroup.list"
            :key="post.node.id"
            :post="post.node"
          />
        </dd>
      </div>
    </dl>
  </Layout>
</template>

<page-query>
query {
  posts: allPost(filter: { published: { eq: true }}) {
    edges {
      node {
        id
        title
        year: date (format: "YYYY")
        date: date (format: "MMM DD")
        path
      }
    }
  }
}
</page-query>

<script>
import PostStrip from '~/components/PostStrip.vue';

export default {
  computed: {
    /**
     * posts grouped by year
     */
    postGroupList() {
      const posts = this.$page.posts.edges;
      // group by year
      const postGroup = posts.reduce((acc, item) => {
        acc[item.node.year] = acc[item.node.year] || [];
        acc[item.node.year].push(item);
        return acc;
      }, {});
      // Convert object to array for sorting
      const postList = [];
      for (const [year, list] of Object.entries(postGroup)) {
        postList.push({
          year,
          list,
        });
      }
      // reverse order
      return postList.sort((a, b) => b.year - a.year);
    },
  },
  components: {
    PostStrip,
  },
  metaInfo: {
    title: 'Archives',
  },
};
</script>

<style lang="scss">
.archive-posts {
  .post-group {
    padding: calc(var(--padding-width) / 2);
    margin-bottom: calc(var(--padding-width) / 2);
  }

  .post-list {
    border-radius: var(--radius);
    overflow: hidden;
  }
}
</style>
