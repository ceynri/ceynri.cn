<template>
  <footer class="footer">
    <span class="footer__copyright">
      Copyright © 2020-{{ new Date().getFullYear() }} Ceynri
    </span>
    <a
      v-if="$static.metadata.beian"
      class="footer__beian"
      :href="$static.metadata.beian.link"
    >{{ $static.metadata.beian.text }}</a>
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

<style lang="scss">
.footer {
  display: flex;
  flex-direction: column;
  margin: var(--padding-width) 0;
  line-height: 2;

  color: var(--light-color);
  transition: color var(--duration);

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
