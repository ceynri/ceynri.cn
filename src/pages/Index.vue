<template>
  <div class="home">
    <div class="frame">
      <div
        class="logo"
        ref="logo"
      >
        {{ $static.metadata.siteName }}
      </div>

      <g-image
        class="impression-image"
        src="~/assets/images/the-sun-at-night.jpg"
        ref="impressionImage"
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
          v-for="(item, name) in $static.metadata.nav.home"
          :to="item.link"
          :key="name"
        >{{ item.name }}</g-link>
      </div>

      <div
        class="frame__intro"
        ref="intro"
      >
        Hello. I'm a frontend developer, like to create meaningful things.
      </div>

      <Social
        at="home"
        class="frame__social"
        :items="$static.metadata.social.home"
      />

      <div class="frame__copyright">
        <div>© {{ new Date().getFullYear() }} Ceynri</div>
        <a
          v-if="$static.metadata.beian"
          :href="$static.metadata.beian.link"
        >{{ $static.metadata.beian.text }}</a>
      </div>

    </div>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
    nav {
      home {
        name
        link
      }
    }
    social {
      home {
        name
        link
        tooltip
      }
    }
    beian {
      link
      text
    }
  }
}
</static-query>

<script>
import Social from '~/components/Social';

// import { isPc } from '~/utils/env';
import { Perspective } from '~/utils/perspective';

export default {
  metaInfo: {
    titleTemplate: '%s',
  },
  mounted() {
    // if (isPc()) {
    this.applyPerspective();
    // }
  },
  methods: {
    applyPerspective() {
      const perspective = new Perspective();
      const logo = this.$refs.logo;
      const impressionImage = this.$refs.impressionImage;
      perspective.apply(logo, {
        float: -0.16,
        blur: 0.008,
      });
      perspective.apply(impressionImage, {
        float: 0.16,
        blur: -0.02,
      });
    },
  },
  components: {
    Social,
  },
};
</script>

<style lang="scss" src="./Index.scss"></style>
