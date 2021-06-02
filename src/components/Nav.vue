<template>
  <nav class="nav">
    <ul>
      <li
        v-for="item in $static.metadata.nav.blog"
        :key="item.name"
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
      </li>
    </ul>
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
export default {};
</script>

<style lang="scss">
.nav {
  
  ul {
    // reset
    list-style: none;
    margin: 0;

    display: flex;
    flex-direction: column;
  }

  li {
    margin: 0 0 var(--space);
  }

  &__item {
    padding: calc(var(--space) / 2);
    padding-left: 0;
    width: fit-content;

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

  @media screen and (max-width: $md - 1px) {
    ul {
      flex-direction: row;
      justify-content: center;

      li {
        margin: 0;
      }
    }

    &__item {
      padding: var(--space);
    }

    .icon {
      display: none;
    }
  }
}
</style>
