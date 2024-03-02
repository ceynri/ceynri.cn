<template>
  <Layout>
    <div class="content-box">
      <h1>404{{ scheme === 'dark' ? '🥱' : '🧭' }}</h1>
      {{ scheme === 'dark' ? 'Have a good night.' : 'Have a nice day!' }}
    </div>
  </Layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  metaInfo: {
    title: '404',
  },
  computed: {
    ...mapState(['scheme']),
  }
};
</script>
