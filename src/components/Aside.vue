<template>
  <aside class="aside">
    <header class="aside__header">
      <SiteInfo />
    </header>

    <Nav />

    <footer class="aside__footer">
      <SchemeToggle class="button" />
    </footer>
  </aside>
</template>

<script>
import SiteInfo from '~/components/SiteInfo.vue';
import Nav from '~/components/Nav.vue';
import SchemeToggle from '~/components/SchemeToggle.vue';

export default {
  components: {
    SiteInfo,
    Nav,
    SchemeToggle,
  },
};
</script>

<style lang="scss">
.aside {
  width: var(--aside-width);
  flex: none;
  max-height: 100vh;
  padding: var(--top-margin-width) var(--space);
  margin-right: var(--space);
  color: var(--title-color);

  display: flex;
  flex-direction: column;

  &__header {
    margin-bottom: var(--space);
  }

  &__footer {
    .button {
      width: 1.5em;
      height: 1.5em;
      color: var(--body-color);

      transition: opacity var(--duration), transform var(--duration);

      &:hover {
        opacity: 0.8;
      }

      &:active {
        transform: scale(0.667);
      }

      &:not(:last-child) {
        margin-right: 0.75em;
      }
    }
  }

  // mobile
  @media screen and (max-width: $md - 1px) {
    position: static;
    width: 100%;
    height: auto;
    max-height: none;
    margin: 0;
    align-items: center;
    text-align: center;
  }
}
</style>
