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
import Logo from '~/components/Logo.vue';
import ToggleTheme from '~/components/ToggleTheme.vue';

export default {
  data() {
    return {};
  },
  components: {
    SiteInfo,
    Logo,
    ToggleTheme,
  },
};
</script>

<style lang="scss">
.aside {
  width: 210px;
  max-height: 100vh;
  padding: 60px 20px;
  margin-right: 20px;
  color: var(--title-color);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  position: sticky;
  top: 0;

  .header {
    margin-bottom: 30px;
  }

  .nav {
    display: flex;
    flex-direction: column;
    flex: 1;

    &__item {
      padding: 10px 0;
      margin: 10px 0;

      &::before {
        content: '- ';
      }
    }
  }
}
</style>
