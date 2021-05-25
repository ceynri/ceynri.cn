<template>
  <div class="social">
    <a
      v-for="(item, name) in social"
      class="social__link"
      :title="showTooltip ? item.tooltip : ''"
      :href="item.link"
      :key="name"
      rel="noopener noreferrer"
      target="_blank"
    >{{ item.name }}</a>
  </div>
</template>

<script>
import objFilter from '~/utils/objFilter';
import { social } from '~/config';

export default {
  props: {
    at: {
      type: String,
      default: 'default',
    },
    showTooltip: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    social() {
      if (this.at === 'default') {
        return social;
      }
      return objFilter(social, (item) => item.showOn.includes(this.at));
    },
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
