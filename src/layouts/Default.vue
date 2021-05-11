<template>
  <div id="app">
    <header class="header">
      <div class="header__left">
        <Logo v-if="showLogo" />
      </div>

      <div class="header__right">
        <ToggleTheme />
      </div>
    </header>

    <main class="main">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue';
import ToggleTheme from '~/components/ToggleTheme.vue';
import Footer from '~/components/Footer.vue';

export default {
  props: {
    showLogo: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Logo,
    ToggleTheme,
    Footer,
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

  &__left,
  &__right {
    display: flex;
    align-items: center;
  }

  @media screen and (min-width: 1300px) {
    // Make header sticky for large screens
    position: sticky;
    width: 100%;
  }
}

.main {
  margin: 0 auto;
  padding: 16px 16px 0;
}
</style>
