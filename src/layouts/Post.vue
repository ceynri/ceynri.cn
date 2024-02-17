<template>
  <div class="layout__post main-container">
    <main class="main">
      <slot />
      <Footer align="center" />
    </main>
  </div>
</template>

<script>
import Footer from '~/components/Footer.vue';

export default {
  components: {
    Footer,
  },
};
</script>

<style lang="scss">
.layout__post {
  box-sizing: content-box;
  margin: 0 auto;
  display: flex;
  padding: 0 calc(var(--padding-width) / 2);
  position: relative;
  max-width: var(--main-width);
  justify-content: center;

  .main {
    margin: 0;
    max-width: 100%;
    padding: var(--top-margin-width) 0 0;
  }
}
</style>
