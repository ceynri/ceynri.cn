<template>
  <header class="header">
    <div class="header__left">
      <g-link class="nav__item" to="/blog/">
        <Logo />
      </g-link>
    </div>

    <nav class="header__right nav">
      <g-link
        class="nav__item"
        v-for="(item, name) in nav"
        :to="item.link"
        :key="name"
      >{{ item.name }}</g-link>
      <ToggleTheme />
    </nav>
  </header>
</template>

<script>
import Logo from '~/components/Logo.vue';
import ToggleTheme from '~/components/ToggleTheme.vue';

import objFilter from '~/utils/objFilter';
import { nav } from '~/config';

export default {
  computed: {
    nav() {
      return objFilter(nav, (item) => item.showOn.includes('blog'));
    },
  },
  components: {
    Logo,
    ToggleTheme,
  },
};
</script>

<style lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: var(--header-height);
  padding: 0 calc(var(--space) / 2);
  top: 0;
  z-index: 10;

  color: var(--title-color);

  &__left,
  &__right {
    display: flex;
    align-items: center;
  }

  @media screen and (min-width: 1536px) {
    // Make header sticky for large screens
    position: sticky;
    width: 100%;
  }

  .nav {
    &__item {
      padding: 0 0.2em;

      & + * {
        margin-left: 2em;
      }
    }
  }
}
</style>
