<template>
  <div class="social">
    <a
      v-for="(item, name) in items"
      class="social__link"
      :title="item.tooltip || ''"
      :href="item.link"
      :key="name"
      rel="noopener noreferrer"
      target="_blank"
    >{{ item.name }}</a>
  </div>
</template>

<script>
export default {
  props: {
    items: Array,
  },
};
</script>

<style lang="scss">
.social {
  display: flex;
  align-items: center;

  &__link {
    font-size: 0.9em;

    &:not(:last-child) {
      margin-right: 1.5em;
    }

    & > svg {
      display: block;
    }
  }

  &__icon {
    width: 1.6em;
    height: 1.6em;
  }
}
</style>
