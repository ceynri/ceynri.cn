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
  max-width: var(--layout-width);

  .aside {
    position: sticky;
    top: 0;
  }

  .main {
    box-sizing: content-box;
    margin: 0;
    padding: var(--top-margin-width) var(--space) 0;
    width: var(--main-width);
  }

  @media screen and (max-width: $md - 1px) {
    flex-direction: column;

    .main {
      z-index: 1;
      width: 100%;
      max-width: none;
      background-color: var(--bg-color);
      box-shadow: 0 0 20px -4px var(--bg-color);
      transition: background-color calc(var(--duration) * 2),
        box-shadow calc(var(--duration) * 2);
      padding: 0;
    }
  }
}
</style>
