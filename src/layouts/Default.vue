<template>
  <div class="main-container">
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
.main-container {
  margin: 0 auto;
  width: fit-content;
  display: flex;
  padding: 0 20px;
  position: relative;
}

.main {
  margin: 0;
  padding: 60px 20px 0;
}
</style>
