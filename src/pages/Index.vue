<template>
  <div id="app">

    <div class="frame">
      <div
        class="logo"
        ref="logo"
      >
        {{ $static.metadata.siteName }}
      </div>

      <g-image
        class="impression-pic"
        src="~/assets/images/the-sun-at-night.jpg"
        ref="pic"
      />
    </div>

    <div class="frame">
      <div class="frame__website">ceynri.cn</div>

      <div
        class="frame__nav"
        ref="nav"
      >
        <g-link
          class="link"
          v-for="(item, name) in nav"
          :to="item.link"
          :key="name"
        >{{ item.name }}</g-link>
      </div>

      <div
        class="frame__intro"
        ref="intro"
      >
        Hello. I'm a frontend developer, like to create some gadgets.
      </div>

      <Social
        at="home"
        class="frame__social"
      />

      <div class="frame__copyright">
        <div>© {{ new Date().getFullYear() }} Ceynri</div>
        <a
          v-if="beian"
          :href="beian.link"
        >{{ beian.text }}</a>
      </div>

    </div>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
import Social from '~/components/Social';

import objFilter from '~/utils/objFilter';
import { isPc } from '~/utils/env';
import { Float } from '~/utils/float';

import { nav, social, beian } from '~/config';

export default {
  metaInfo: {
    titleTemplate: '%s',
  },
  data() {
    return {
      beian,
    };
  },
  computed: {
    social() {
      return objFilter(social, (item) => item.showOn.includes('home'));
    },
    nav() {
      return objFilter(nav, (item) => item.showOn.includes('home'));
    },
  },
  mounted() {
    if (isPc()) {
      const float = new Float();
      const logo = this.$refs.logo;
      const pic = this.$refs.pic;
      float.addFloat(logo, -8);
      float.addFloat(pic, 4);
    }
    document.documentElement.setAttribute('data-theme', 'dark');
  },
  components: {
    Social,
  },
};
</script>

<style lang="scss" scoped src="./Index.scss"></style>
