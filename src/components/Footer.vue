<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__left">
        <div class="social">
          <a
            class="social__link"
            v-for="(item, name) in social"
            :href="item.url"
            :key="name"
            :data-true-color="item.color"
            @mouseover="iconColor($event, darkmode ? item.darkmodeColor : item.color)"
            @mouseleave="iconColor($event)"
          >
            <Icon
              class="social__icon"
              :name="name"
              :html="item.icon"
            />
          </a>
        </div>
        <span class="footer__copyright">
          Copyright © 2020-{{ new Date().getFullYear() }} Ceynri
        </span>
        <a
          v-if="beian"
          class="footer__beian"
          :href="beian.url"
        >{{ beian.text }}</a>
      </div>
    </div>
  </footer>
</template>

<script>
import Icon from '~/components/Icon.vue';
import { social, beian } from '~/config';

export default {
  data() {
    return {
      social,
      beian,
    };
  },
  methods: {
    iconColor(event, color = '') {
      const dom = event.target;
      if (!dom) return;
      dom.style.color = color;
    },
  },
  components: {
    Icon,
  },
};
</script>

<style lang="scss">
.footer {
  margin: 0 auto;
  padding: 16px;

  &__content {
    display: flex;
    justify-content: space-between;

    max-width: var(--content-width);
    margin: 0 auto;
    padding: var(--space) 0;

    color: var(--light-color);
  }

  &__left {
    display: flex;
    flex-direction: column;
  }

  &__copyright,
  &__beian {
    font-size: 0.6em;
  }

  @media screen and (max-width: 650px) {
    flex-direction: column;
  }
}

.social {
  display: flex;
  margin: 1em 0;

  &__link {
    transition: color calc(var(--duration) / 2);

    &:hover {
      opacity: 1;
    }

    & > svg {
      display: block;
    }
  }

  &__icon {
    width: 32px;
    height: 32px;
    margin-right: 4px;
  }
}
</style>
