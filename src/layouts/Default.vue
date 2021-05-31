<template>
  <div class="layout__default main-container">
    <Aside class="aside" />
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
    max-width: calc(100% - var(--aside-width) - var(--space));
  }

  @media screen and (max-width: 767px) {
    flex-direction: column;

    .aside {
      position: static;
      top: none;
      width: 100%;
      margin: 0;
    }

    .main {
      width: 100%;
      max-width: none;
      padding: 0;
    }
  }
}
</style>
