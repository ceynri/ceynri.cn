<template>
  <aside class="aside">
    <header class="header">
      <SiteInfo />
    </header>

    <nav class="nav">
      <g-link
        class="nav__item"
        v-for="(item, name) in $static.metadata.nav.blog"
        :to="item.link"
        :key="name"
      >{{ item.name }}</g-link>
    </nav>
    <ToggleTheme />
  </aside>
</template>

<static-query>
query {
  metadata {
    nav {
      blog {
        name
        link
      }
    }
  }
}
</static-query>

<script>
import SiteInfo from '~/components/SiteInfo.vue';
import ToggleTheme from '~/components/ToggleTheme.vue';

export default {
  components: {
    SiteInfo,
    ToggleTheme,
  },
};
</script>

<style lang="scss">
.aside {
  width: var(--aside-width);
  max-height: 100vh;
  padding: var(--top-margin-width) var(--space);
  margin-right: var(--space);
  color: var(--title-color);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .header {
    margin-bottom: var(--space);
  }

  .nav {
    display: flex;
    flex-direction: column;
    flex: 1;

    &__item {
      padding: calc(var(--space) / 2) 0;
      margin: calc(var(--space) / 2) 0;

      &::before {
        content: '- ';
      }
    }
  }
}
</style>
