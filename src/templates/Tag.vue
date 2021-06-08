<template>
  <Layout>
    <header class="tag__header">
      <h1 class="tag__title space-bottom">
        <span class="hash">#</span> {{ $page.tag.title.toUpperCase() }}
      </h1>
      <div class="tag__info">
        {{ $page.tag.belongsTo.edges.length }} POST{{ $page.tag.belongsTo.edges.length > 1 ? 'S' : '' }}
      </div>
    </header>

    <div class="posts">
      <PostCard
        v-for="edge in $page.tag.belongsTo.edges"
        :key="edge.node.id"
        :post="edge.node"
      />
    </div>
  </Layout>
</template>

<page-query>
query Tag ($id: ID!) {
  tag (id: $id) {
    title
    belongsTo {
      edges {
        node {
          ...on Post {
            title
            path
            date (format: "MMM DD, YYYY")
            description
            content
          }
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

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 10px;
      height: 100%;
      background-color: var(--border-color);
      transition: background-color var(--duration);
    }
  }

  &__title {
    margin: 0;
  }

  &__info {
    margin-top: 1em;
    font-size: 0.8em;
  }
}
</style>
