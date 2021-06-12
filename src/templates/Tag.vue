<template>
  <Layout>
    <header class="tag__header">
      <h1 class="tag__title">
        <span class="hash">#</span> {{ $page.tag.title.toUpperCase() }}
      </h1>
      <div class="tag__info">
        {{ totalCount }} POST{{ totalCount > 1 ? 'S' : '' }}
      </div>
    </header>

    <section class="posts">
      <PostCard
        v-for="edge in $page.tag.belongsTo.edges"
        :key="edge.node.id"
        :post="edge.node"
      />
    </section>
    <Pagination :page-info="$page.tag.belongsTo.pageInfo" />
  </Layout>
</template>

<page-query>
query Tag ($id: ID!, $page: Int) {
  tag (id: $id) {
    title
    belongsTo (perPage: 8, page: $page) @paginate {
      pageInfo {
        totalPages
        currentPage
      }
      edges {
        node {
          ...on Post {
            title
            path
            date (format: "MMM DD, YYYY")
            description
          }
        }
      }
      totalCount
    }
  }
}
</page-query>

<script>
import PostCard from '~/components/PostCard.vue';
import Pagination from '~/components/Pagination.vue';

export default {
  computed: {
    totalCount() {
      return this.$page.tag.belongsTo.totalCount;
    },
  },
  components: {
    PostCard,
    Pagination,
  },
  metaInfo() {
    return {
      title: `# ${this.$page.tag.title}`,
    };
  },
};
</script>

<style lang="scss">
.tag {
  &__header {
    padding: var(--padding-width);
    background-color: var(--bg-content-color);
    transition: background-color var(--duration);
    border-radius: var(--radius);
    margin-bottom: calc(var(--padding-width) / 2);

    position: relative;
    overflow: hidden;

    // &::before {
    //   content: '';
    //   display: block;
    //   position: absolute;
    //   top: 0;
    //   left: 0;
    //   width: 10px;
    //   height: 100%;
    //   background-color: var(--border-color);
    //   transition: background-color var(--duration);
    // }
  }

  &__title {
    margin: 0;

    .hash {
      transition: color var(--duration), text-shadow var(--duration);
      color: var(--link-color);
      text-shadow: 0 0 0.2em var(--link-shadow-color);
    }
  }

  &__info {
    margin-top: 1em;
    font-size: 0.8em;
  }
}
</style>
