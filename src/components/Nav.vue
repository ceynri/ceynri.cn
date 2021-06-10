<template>
  <nav class="nav">
    <ul>
      <li>
        <g-link class="nav__item" to="/blog/" key="Blog">
          <img svg-inline class="icon" src="~/assets/icons/feather.svg" />
          Blog
        </g-link>
      </li>
      <li>
        <a
          class="nav__item"
          href="javascript:alert('Coming soon! 😂');"
          key="About"
        >
          <img svg-inline class="icon" src="~/assets/icons/info.svg" />
          About
        </a>
      </li>
      <li>
        <g-link class="nav__item" to="/blog/archive/" key="Archive">
          <img svg-inline class="icon" src="~/assets/icons/archive.svg" />
          Archive
        </g-link>
      </li>
      <li>
        <a class="nav__item" href="/feed.xml" key="Feed">
          <img svg-inline class="icon" src="~/assets/icons/rss.svg" />
          Feed
        </a>
      </li>
      <li>
        <g-link class="nav__item" to="/" key="Home">
          <img svg-inline class="icon" src="~/assets/icons/home.svg" />
          Home
        </g-link>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss">
.nav {
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  margin-bottom: var(--space);

  ul {
    // reset
    list-style: none;
    margin: 0;

    display: flex;
    flex-direction: column;

    li {
      margin: 0 0 1em;
    }
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
    ul {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;

      li {
        margin: 0;
      }
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
