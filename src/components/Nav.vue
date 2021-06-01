<template>
  <nav class="nav">
    <template
      v-for="item in $static.metadata.nav.blog"
    >
      <a
        v-if="item.use === 'a'"
        class="nav__item"
        :href="item.link"
        :key="item.name"
      >
        <div class="icon">
          <svg-icon :src="`/assets/icons/${item.icon}.svg`" />
        </div>
        {{ item.name }}
      </a>
      <g-link
        v-else
        class="nav__item"
        :to="item.link"
        :key="item.name"
      >
        <div class="icon">
          <svg-icon :src="`/assets/icons/${item.icon}.svg`" />
        </div>
        {{ item.name }}
      </g-link>
    </template>
  </nav>
</template>

<static-query>
query {
  metadata {
    nav {
      blog {
        name
        link
        icon
        use
      }
    }
  }
}
</static-query>

<script>
export default {

}
</script>

<style lang="scss">
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

    color: var(--light-color);

    &.active--exact {
      color: var(--body-color);
    }
  }
}
</style>
