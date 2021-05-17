<template>
  <footer class="footer">
    <div class="footer__content center-content">
      <div class="footer__left">
        <div class="social">
          <a
            class="social__link"
            v-for="(item, name) in social"
            :title="item.tooltip"
            :href="item.url"
            :key="name"
          >
            {{ item.name }}
          </a>
        </div>

        <span class="footer__copyright">
          <div>Copyright © 2020-{{ new Date().getFullYear() }} Ceynri</div>
          <a
            v-if="beian"
            class="footer__beian"
            :href="beian.url"
          >{{ beian.text }}</a>
        </span>
      </div>
      <div class="footer__right">
        <div class="footer__bio">Stay<br>Thinking</div>
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
  margin-top: var(--space);
  padding: 16px;
  background: var(--bg-content-color);
  transition: background-color var(--duration);

  &__content {
    display: flex;
    justify-content: space-between;
    padding: var(--space) 0;
    color: var(--light-color);
    transition: color var(--duration);
    @media screen and (max-width: 639px) {
      justify-content: center;
      text-align: center;
    }
  }

  &__bio {
    font-size: 2em;
    margin-bottom: 0.25em;
    line-height: 1;
    text-align: end;
    @media screen and (max-width: 639px) {
      display: none;
    }
  }

  &__copyright,
  &__beian {
    font-size: 0.6em;
    line-height: 1;
  }
}

.social {
  display: flex;
  margin-bottom: 1rem;

  &__title {
    font-size: 0.9em;
    margin-right: 1.5em;
  }

  &__link {
    font-size: 0.9em;
    margin-right: 1.5em;

    &:last-child {
      margin-right: 0;
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
