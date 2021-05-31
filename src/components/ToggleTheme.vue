<template>
  <button
    role="button"
    aria-label="Toggle dark/light"
    @click.prevent="toggleTheme"
    class="toggle-theme button"
  >
    <svg-icon
      v-if="theme === 'light'"
      class="icon"
      src="/assets/icons/sun.svg"
    />
    <svg-icon
      v-else
      class="icon"
      src="/assets/icons/moon.svg"
    />
  </button>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  computed: {
    ...mapState(['theme']),
  },
  mounted() {
    this.setTheme(window.__theme);
  },
  methods: {
    ...mapMutations(['setTheme']),
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    },
  },
};
</script>

<style lang="scss">
.toggle-theme {
}
</style>
