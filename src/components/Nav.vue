<template>
  <nav class="nav">
    <ul>
      <NavItem
        v-for="item in $static.metadata.nav.blog"
        :item="item"
        :key="item.name"
      />
    </ul>
  </nav>
</template>

<static-query>
query {
  metadata {
    nav {
      blog {
        name
        link
        icon
        use
      }
    }
  }
}
</static-query>

<script>
import NavItem from './NavItem.vue';
export default {
  components: {
    NavItem,
  },
};
</script>

<style lang="scss">
.nav {
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  margin-bottom: var(--space);

  ul {
    // reset
    list-style: none;
    margin: 0;

    display: flex;
    flex-direction: column;
  }

  @media screen and (max-width: $md - 1px) {
    ul {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}
</style>
