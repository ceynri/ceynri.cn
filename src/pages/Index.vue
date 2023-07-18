<template>
  <main class="home">
    <header class="frame">
      <h1 class="logo" ref="logo">
        {{ $static.metadata.siteName }}
      </h1>

      <g-image
        class="impression-image"
        src="~/assets/images/the-sun-at-night.jpg"
        ref="impressionImage"
      />
    </header>

    <section class="frame">
      <header class="frame__website">ceynri.cn</header>

      <nav class="frame__nav" ref="nav">
        <g-link
          class="link"
          v-for="(item, name) in $static.metadata.nav"
          :to="item.link"
          :key="name"
          >{{ item.name }}</g-link
        >
      </nav>

      <div class="frame__intro" ref="intro">
        {{ $static.metadata.my.welcome }}
      </div>

      <Social class="frame__social" :items="$static.metadata.social" />

      <footer class="frame__copyright">
        <div>© {{ new Date().getFullYear() }} Ceynri</div>
        <a v-if="$static.metadata.beian" :href="$static.metadata.beian.link">
          {{ $static.metadata.beian.text }}
        </a>
      </footer>
    </section>
  </main>
</template>

<static-query>
query {
  metadata {
    siteName
    my {
      welcome
    }
    nav {
      name
      link
    }
    social {
      name
      link
      tooltip
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

import { Perspective } from '~/utils/perspective';

export default {
  metaInfo: {
    titleTemplate: '%s',
  },
  mounted() {
    // force setting to Dark Scheme on the home
    window.__setColorScheme('dark', true);
    this.applyPerspective();
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
