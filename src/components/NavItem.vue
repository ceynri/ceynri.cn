<template>
  <li>
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
  </li>
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
  props: {
    item: Object,
  },
};
</script>

<style lang="scss">
.nav {
  ul li {
    margin: 0 0 1em;
  }

  &__item {
    padding: 0.5em;
    padding-left: 0;
    width: fit-content;

    display: flex;
    align-items: center;

    .icon {
      width: 1em;
      height: 1em;
      margin-right: 1em;
      // English baseline offset
      margin-bottom: 0.2em;
    }

    color: var(--light-color);

    &.active--exact {
      color: var(--body-color);
    }
  }

  @media screen and (max-width: $md - 1px) {
    ul li {
      margin: 0;
    }

    &__item {
      padding: 1em;

      .icon {
        display: none;
      }
    }
  }
}
</style>
