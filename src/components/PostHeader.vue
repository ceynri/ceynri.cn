<template>
  <nav class="post-header">
    <ul>
      <li>
        <g-link class="post-header__item" to="/blog/" key="Blog">
          <g-image
            alt="avatar"
            class="blog-avatar"
            src="~/assets/images/avatar.jpg"
            width="48"
            height="48"
            blur="0"
          />
          <div class="post-header__item-text">Blog</div>
        </g-link>
      </li>
      <li v-for="tag in tags" :key="tag.id">
        <g-link class="post-header__item" :to="tag.path" :key="tag.id">
          # {{ tag.title }}
        </g-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: ['tags'],
};
</script>

<style lang="scss">
.post-header {
  overflow-x: auto;
  margin: var(--space) 0;

  ul {
    // reset
    list-style: none;
    margin: 0;

    display: flex;
    flex-wrap: wrap;
    gap: 0.5em 1em;

    li {
      margin: 0;
      flex: none;
    }
  }

  .post-header__item {
    padding: 0.5em 1em;

    display: flex;
    align-items: center;

    border-radius: 2em;
    background-color: var(--bg-content-color);

    .blog-avatar {
      width: 1.5em;
      height: 1.5em;
      border-radius: 1em;
      margin-right: 0.5em;
    }

    color: var(--light-color);
  }
}
</style>
