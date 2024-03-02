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
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['scheme']),
  },
  methods: {
    toggleColorScheme() {
      this.$store.commit('toggleColorScheme');
    },
  },
};
</script>

<style lang="scss">
.toggle-theme {
}
</style>
