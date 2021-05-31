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
  margin-top: var(--space);
  padding: 16px;
  background: var(--bg-content-color);
  transition: background-color var(--duration);

  &__content {
    display: flex;
    justify-content: space-between;
    padding: var(--space) 0;
    color: var(--light-color);
    transition: color var(--duration);
    @media screen and (max-width: 639px) {
      justify-content: center;
      text-align: center;
    }
  }

  &__bio {
    font-size: 2em;
    margin-bottom: 0.25em;
    line-height: 1;
    text-align: end;
    @media screen and (max-width: 639px) {
      display: none;
    }
  }

  &__copyright,
  &__beian {
    font-size: 0.6em;
    line-height: 1;
  }

  &__social {
    margin-bottom: 1rem;
  }
}
</style>
