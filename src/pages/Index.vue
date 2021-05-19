<template>
  <div id="app">
    <div class="frame">
      <div class="frame__website frame__lt">ceynri.cn</div>

      <div
        class="frame__intro frame__lb"
        ref="intro"
      >
        Hello. I'm a frontend developer, like to create some gadgets.
      </div>

      <div
        class="frame__nav frame__lm"
        ref="nav"
      >
        <g-link
          class="link"
          v-for="(item, name) in nav"
          :to="item.link"
          :key="name"
        >{{ item.name }}</g-link>
      </div>

      <div class="frame__copyright frame__rb">
        <div>© {{ new Date().getFullYear() }} Ceynri</div>
        <a
          v-if="beian"
          :href="beian.link"
        >{{ beian.text }}</a>
      </div>

      <div class="frame__social frame__rt">
        <a
          v-for="(item, name) in social"
          class="link"
          :href="item.link"
          :key="name"
        >{{ item.name }}</a>
      </div>

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
import { Float } from '~/utils/float';
import { nav, social, beian } from '~/config';
import objFilter from '~/utils/objFilter';

export default {
  data() {
    return {
      nav,
      beian,
      float: new Float(),
    };
  },
  computed: {
    social() {
      return objFilter(social, (item) => item.showOn.includes('home'));
    },
  },
  mounted() {
    const logo = this.$refs.logo;
    const pic = this.$refs.pic;
    this.float.addFloat(logo, 10);
    this.float.addFloat(pic, 2);
  },
};
</script>

<style lang="scss" scoped src="./Index.scss"></style>
