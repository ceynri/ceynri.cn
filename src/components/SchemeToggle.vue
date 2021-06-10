<template>
  <button
    role="button"
    title="Toggle dark/light"
    aria-label="Toggle dark/light"
    @click.prevent="toggleColorScheme"
    class="toggle-theme button"
  >
    <!--
      `v-show` prop not on svg is because there is a bug
      issue #11: https://github.com/ceynri/ceynri.cn/issues/11
    -->
    <i v-show="scheme === 'dark'">
      <img svg-inline class="icon" src="~/assets/icons/moon.svg" />
    </i>
    <i v-show="scheme === 'light'">
      <img svg-inline class="icon" src="~/assets/icons/sun.svg" />
    </i>
  </button>
</template>

<script>
export default {
  data() {
    return {
      // Create a local scheme to synchronize with the window scheme in Vue.js
      scheme: 'dark',
    };
  },
  mounted() {
    this.scheme = window.__colorScheme;
  },
  methods: {
    toggleColorScheme() {
      const newColorScheme =
        window.__colorScheme === 'light' ? 'dark' : 'light';
      window.__setColorScheme(newColorScheme);
      this.scheme = newColorScheme;
    },
  },
};
</script>

<style lang="scss">
.toggle-theme {
}
</style>
