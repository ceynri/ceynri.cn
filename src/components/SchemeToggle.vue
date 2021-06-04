<template>
  <button
    role="button"
    aria-label="Toggle dark/light"
    @click.prevent="toggleColorScheme"
    class="toggle-theme button"
  >
    <!--
      `v-show` prop not on svg-icon is because there is a bug
      issue #11: https://github.com/ceynri/ceynri.cn/issues/11
    -->
    <i v-show="scheme === 'dark'">
      <svg-icon
        class="icon"
        src="/assets/icons/moon.svg"
      />
    </i>
    <i v-show="scheme === 'light'">
      <svg-icon
        class="icon"
        src="/assets/icons/sun.svg"
      />
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
  created() {
    this.scheme = window.__colorScheme;
  },
  methods: {
    toggleColorScheme() {
      const newColorScheme = window.__colorScheme === 'light' ? 'dark' : 'light';
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
