<template>
  <PostLayout v-if="$page.post.published">
    <article>
      <section class="post content-box">
        <header class="post__header">
          <div
            v-if="showCover"
            class="post__cover"
          >
            <g-image
              alt="Cover image"
              :src="$page.post.cover_image"
            />
          </div>

          <div
            class="post__title"
            :class="{ embedded: showCover }"
          >
            <h1 class="post-title__text">
              {{ $page.post.title }}
            </h1>

            <PostMeta :post="$page.post" />
          </div>
        </header>

        <section
          class="post__content"
          v-html="$page.post.content"
        />
        <PostFooter :post="$page.post" />
      </section>

      <div class="post__end">
        <ReturnBar />
      </div>

      <article
        v-if="showComment"
        class="post__comments"
      >
        <ClientOnly>
          <Comment v-if="commentVisible" />
        </ClientOnly>
      </article>
    </article>

    <FloatingImage
      v-for="(linkDom, i) in linkDoms"
      :key="i"
      :target-dom="linkDom"
    />
  </PostLayout>

  <!-- Bottom-up strategy -->
  <Page404 v-else />
</template>

<page-query>
query Post ($id: ID!) {
  post (id: $id) {
    title
    path
    date (format: "MMM DD, YYYY")
    lastmod (format: "MMM DD, YYYY")
    tags {
      id
      title
      path
    }
    description
    content
    cover_image (width: 1800, blur: 10, quality: 90)
    published
    comment
  }
}
</page-query>

<script>
import { mapState } from 'vuex';

import FloatingImage from '~/components/FloatingImage';
import PostMeta from '~/components/PostMeta';
import PostFooter from '~/components/PostFooter';
import ReturnBar from '~/components/ReturnBar';
import Page404 from '~/pages/404';
import { findAllImageLinkDom } from '~/utils/dom';

export default {
  data() {
    return {
      linkDoms: [],
      commentVisible: true,
    };
  },
  computed: {
    ...mapState(['scheme']),
    showCover() {
      return !!this.$page.post.cover_image;
    },
    showComment() {
      return this.$page.post.comment;
    },
  },
  watch: {
    scheme() {
      this.reloadComment();
    },
  },
  // 提前设置 document.title 以修复 giscus 初始化时获取的 title 为上一个页面的 title 的问题
  beforeMount() {
    if (!this.$page.post.published) {
      document.title = '404';
      return;
    }
    document.title = this.$page.post.title;
  },
  mounted() {
    this.linkDoms = findAllImageLinkDom();
    this.linkDoms.forEach(dom => dom.classList.add('image-link'));
  },
  methods: {
    reloadComment() {
      if (!this.showComment) {
        return;
      }
      // use v-if to forced refresh component
      this.commentVisible = false;
      this.$nextTick(() => {
        this.commentVisible = true;
      });
    },
  },
  components: {
    PostMeta,
    PostFooter,
    Page404,
    FloatingImage,
    ReturnBar,
    Comment: () => import('~/components/Comment.vue'),
  },
  metaInfo() {
    if (!this.$page.post.published) {
      return { title: '404' };
    }
    return {
      title: this.$page.post.title,
      meta: [
        {
          name: 'description',
          content: this.$page.post.description,
        },
      ],
    };
  },
};
</script>
