<template>
  <aside class="aside">
    <header class="aside__header">
      <SiteInfo />
    </header>

    <nav class="nav">
      <g-link
        class="nav__item"
        v-for="(item, name) in $static.metadata.nav.blog"
        :to="item.link"
        :key="name"
      >
        <div class="icon">
          <svg-icon :src="`/assets/icons/${item.icon}.svg`" />
        </div>
        {{ item.name }}
      </g-link>
    </nav>

    <footer class="aside__footer">
      <ToggleTheme class="button" />
    </footer>
  </aside>
</template>

<static-query>
query {
  metadata {
    nav {
      blog {
        name
        link
        icon
      }
    }
  }
}
</static-query>

<script>
import SiteInfo from '~/components/SiteInfo.vue';
import ToggleTheme from '~/components/ToggleTheme.vue';

export default {
  components: {
    SiteInfo,
    ToggleTheme,
  },
};
</script>

<style lang="scss">
.aside {
  width: var(--aside-width);
  max-height: 100vh;
  padding: var(--top-margin-width) var(--space);
  margin-right: var(--space);
  color: var(--title-color);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &__header {
    margin-bottom: var(--space);
  }

  .nav {
    display: flex;
    flex-direction: column;
    flex: 1;

    &__item {
      padding: calc(var(--space) / 2) 0;
      margin: calc(var(--space) / 2) 0;

      display: flex;
      align-items: center;

      .icon {
        width: 1em;
        height: 1em;
        margin-right: 1em;
      }
    }
  }

  &__footer {
    .button {
      width: 1.5em;
      height: 1.5em;
      color: var(--body-color);

      transition: opacity var(--duration), transform calc(var(--duration) / 2);

      &:hover {
        opacity: 0.8;
      }

      &:active {
        transform: scale(0.8);
      }

      &:not(:last-child) {
        margin-right: 0.75em;
      }
    }
  }
}
</style>
