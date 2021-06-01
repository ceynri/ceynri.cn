<template>
  <button
    role="button"
    aria-label="Toggle dark/light"
    @click.prevent="toggleTheme"
    class="toggle-theme button"
  >
    <!--
      `v-show` prop not on svg-icon is because there is a bug
      issue #11: https://github.com/ceynri/ceynri.cn/issues/11
    -->
    <i v-show="theme === 'dark'">
      <svg-icon
        class="icon"
        src="/assets/icons/moon.svg"
      />
    </i>
    <i v-show="theme === 'light'">
      <svg-icon
        class="icon"
        src="/assets/icons/sun.svg"
      />
    </i>
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
