<template>
  <Pager
    class="navigation"
    :info="pageInfo"
    :show-navigation="false"
    link-class="navigation__link"
  />
</template>

<script>
import { Pager } from 'gridsome';
export default {
  props: ['page-info'],
  components: {
    Pager,
  },
};
</script>

<style lang="scss">
.navigation {
  background-color: var(--bg-content-color);
  display: flex;
  border-radius: var(--radius);
  overflow: hidden;
  flex-wrap: wrap;

  &__link {
    padding: var(--space) calc(var(--space) * 2);

    &.active {
      background-color: var(--border-color);

      &:hover {
        filter: none;
      }
    }
  }
}
</style>
