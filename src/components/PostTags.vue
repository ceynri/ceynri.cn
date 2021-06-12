<template>
  <div class="post-tags">
    <g-link
      class="post-tags__link"
      v-for="tag in tags"
      :key="tag.id"
      :to="tag.path"
    >
      <span>#</span> {{ tag.title }}
      <span v-if="tag.count">{{ tag.count }}</span>
    </g-link>
  </div>
</template>

<script>
export default {
  props: {
    tags: Array | Object,
  },
};
</script>

<style lang="scss">
.post-tags {
  display: flex;
  flex-wrap: wrap;

  &__link {
    margin-top: 0.3em;
    margin-bottom: 0.3em;
    margin-right: 0.7em;
    font-size: 0.8em;
    color: currentColor;
    text-decoration: none;
    background-color: var(--bg-color);
    padding: 0.5em 0.7em;
    border-radius: var(--radius);
  }
}
</style>
