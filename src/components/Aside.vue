<template>
  <aside class="aside">
    <header class="aside__header">
      <SiteInfo />
    </header>

    <Nav />

    <footer class="aside__footer">
      <ToggleTheme class="button" />
    </footer>
  </aside>
</template>

<script>
import SiteInfo from '~/components/SiteInfo.vue';
import Nav from '~/components/Nav.vue';
import ToggleTheme from '~/components/ToggleTheme.vue';

export default {
  components: {
    SiteInfo,
    Nav,
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

  &__header {
    margin-bottom: var(--space);
  }

  &__footer {
    .button {
      width: 1.5em;
      height: 1.5em;
      color: var(--body-color);

      transition: opacity var(--duration), transform calc(var(--duration) / 2);

      &:hover {
        opacity: 0.8;
      }

      &:active {
        transform: scale(0.8);
      }

      &:not(:last-child) {
        margin-right: 0.75em;
      }
    }
  }
}
</style>
