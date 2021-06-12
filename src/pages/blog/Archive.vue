<template>
  <Layout>
    <div class="archive">
      <section class="archive__tags content-box">
        <header class="archive__title">TAGS</header>
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
          edges {
            node {
              ...on Post {
                published
              }
            }
          }
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
    /**
     * get the published tags with count number
     */
    tags() {
      const tags = this.$page.tags.edges;
      // filter out the published tags
      const filteredTags = tags
        .map((edge) => {
          const tag = edge.node;
          const publishedPosts = tag.belongsTo.edges.filter(
            (edge) => edge.node.published
          );
          return {
            ...tag,
            count: publishedPosts.length,
          };
        })
        .filter((tag) => tag.count !== 0);
      // sort by count
      const sortedTags = filteredTags.sort((a, b) => b.count - a.count);
      return sortedTags;
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
    font-size: 0.9em;
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
