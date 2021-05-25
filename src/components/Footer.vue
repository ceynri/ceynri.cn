<template>
  <footer class="footer">
    <div class="footer__content center-content">
      <div class="footer__left">
        <Social
          class="footer__social"
          at="footer"
        />
        <span class="footer__copyright">
          <div>Copyright © 2020-{{ new Date().getFullYear() }} Ceynri</div>
          <a
            v-if="beian"
            class="footer__beian"
            :href="beian.link"
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
import objFilter from '~/utils/objFilter';
import Social from '~/components/Social.vue';
import { social, beian } from '~/config';

export default {
  data() {
    return {
      beian,
    };
  },
  computed: {
    social() {
      return objFilter(social, (item) => item.showOn.includes('blog'));
    },
  },
  components: {
    Social,
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

  &__social {
    margin-bottom: 1rem;
  }
}
</style>
