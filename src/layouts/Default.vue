<template>
  <div id="app">
    <Header />
    <main class="main">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';

export default {
  components: {
    Header,
    Footer,
  },
};
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  width: 100%;
  margin: 0 auto;
  padding: 16px 16px 0;
  flex: 1;
}
</style>
