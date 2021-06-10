<template>
  <Layout>
    <div class="archive">
      <section class="archive__tags content-box">
        <h2 class="archive__title">TAGS</h2>
        <PostTags class="tag-list" :tags="tags" />
      </section>

      <dl class="archive__posts">
        <div
          v-for="postGroup in postGroupList"
          :key="postGroup.year"
          class="post-group content-box"
        >
          <dt class="archive__title">{{ postGroup.year }}</dt>
          <dd class="post-list">
            <PostStrip
              v-for="post in postGroup.list"
              :key="post.node.id"
              :post="post.node"
            />
          </dd>
        </div>
      </dl>
    </div>
    <Pagination :page-info="$page.posts.pageInfo" />
  </Layout>
</template>

<page-query>
query ($page: Int) {
  tags: allTag(sortBy: "title", order: ASC) {
    edges {
      node {
        id
        title
        path
        belongsTo {
          totalCount
        }
      }
    }
  }
  posts: allPost(
    filter: { published: { eq: true } },
    perPage: 16,
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
        year: date (format: "YYYY")
        date: date (format: "MMM DD")
        path
      }
    }
  }
}
</page-query>

<script>
import PostTags from '~/components/PostTags';
import PostStrip from '~/components/PostStrip.vue';
import Pagination from '~/components/Pagination.vue';

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
    tags() {
      return this.$page.tags.edges
        .map((item) => item.node)
        .sort((a, b) => b.belongsTo.totalCount - a.belongsTo.totalCount);
    },
  },
  components: {
    PostTags,
    PostStrip,
    Pagination,
  },
  metaInfo: {
    title: 'Archives',
  },
};
</script>

<style lang="scss">
.archive {
  &__title {
    margin: 0;
    font-size: 1em;
    font-weight: normal;
  }

  &__tags {
    padding: calc(var(--padding-width) / 2);
    margin-bottom: calc(var(--padding-width) / 2);

    .tag-list {
      padding: calc(var(--padding-width) / 2);
    }
  }

  &__posts {
    .post-group {
      padding: calc(var(--padding-width) / 2);
      margin-bottom: calc(var(--padding-width) / 2);
    }

    .post-list {
      border-radius: var(--radius);
      overflow: hidden;
    }
  }
}
</style>
