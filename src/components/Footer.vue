<template>
  <footer class="footer" :style="{ alignItems }">
    <span class="footer__copyright">
      Copyright © 2020-{{ new Date().getFullYear() }} Ceynri
    </span>
    <a
      v-if="$static.metadata.beian"
      class="footer__beian"
      :href="$static.metadata.beian.link"
      >{{ $static.metadata.beian.text }}</a
    >
  </footer>
</template>

<static-query>
query {
  metadata {
    beian {
      link
      text
    }
  }
}
</static-query>

<script>
export default {
  props: {
    align: {
      type: String,
      default: 'left',
    },
  },
  computed: {
    alignItems() {
      switch (this.align) {
        case 'center':
          return 'center';
        case 'right':
          return 'flex-end';
        case 'left':
        default:
          return 'flex-start';
      }
    },
  },
};
</script>

<style lang="scss">
.footer {
  display: flex;
  flex-direction: column;
  margin: var(--padding-width) 0;
  line-height: 2;

  color: var(--light-color);

  // mobile
  @media screen and (max-width: $md - 1px) {
    justify-content: center;
    text-align: center;
  }

  &__copyright,
  &__beian {
    font-size: 0.6em;
  }
}
</style>
