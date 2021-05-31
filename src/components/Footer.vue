<template>
  <footer class="footer">
    <div class="footer__content">
      <span class="footer__copyright">
        Copyright © 2020-{{ new Date().getFullYear() }} Ceynri
      </span>
      <a
        v-if="$static.metadata.beian"
        class="footer__beian"
        :href="$static.metadata.beian.link"
      >{{ $static.metadata.beian.text }}</a>
    </div>

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
  &__content {
    display: flex;
    flex-direction: column;
    margin: var(--space) 0;
    line-height: 2;

    color: var(--light-color);
    transition: color var(--duration);

    @media screen and (max-width: 639px) {
      justify-content: center;
      text-align: center;
    }
  }

  &__copyright,
  &__beian {
    font-size: 0.6em;
  }
}
</style>
