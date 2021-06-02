<template>
  <div class="layout__default main-container">
    <Aside />
    <main class="main">
      <slot />
      <Footer />
    </main>
  </div>
</template>

<script>
import Aside from '~/components/Aside.vue';
import Footer from '~/components/Footer.vue';

export default {
  components: {
    Aside,
    Footer,
  },
};
</script>

<style lang="scss">
.layout__default {
  box-sizing: content-box;
  margin: 0 auto;
  display: flex;
  padding: 0 var(--padding-width);
  position: relative;
  max-width: var(--main-width);

  .aside {
    position: sticky;
    top: 0;
  }

  .main {
    margin: 0;
    padding: var(--top-margin-width) 20px 0;
    width: calc(100% - var(--aside-width) - var(--space));
  }

  @media screen and (max-width: $md - 1px) {
    flex-direction: column;

    .main {
      z-index: 1;
      width: 100%;
      max-width: none;
      background-color: var(--bg-color);
      transition: background-color var(--duration), box-shadow var(--duration);
      padding: 0;

      box-shadow: 0 0 20px -4px var(--bg-color);
    }
  }
}
</style>
