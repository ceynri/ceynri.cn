<template>
  <Layout>
    <div class="post-title">
      <h1 class="post-title__text">
        {{ $page.post.title }}
      </h1>

      <PostMeta :post="$page.post" />

    </div>

    <div class="post content-box">
      <div class="post__header">
        <g-image
          alt="Cover image"
          v-if="$page.post.cover_image"
          :src="$page.post.cover_image"
        />
      </div>

      <div
        class="post__content link-highlight"
        :class="$page.post.add_classes"
        v-html="$page.post.content"
      />

      <div class="post__footer">
        <PostTags :post="$page.post" />
      </div>
    </div>

    <div class="post-comments">
      <!-- Add comment widgets here -->
    </div>
  </Layout>
</template>

<script>
import PostMeta from '~/components/PostMeta';
import PostTags from '~/components/PostTags';

export default {
  components: {
    PostMeta,
    PostTags,
  },
  metaInfo() {
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

<page-query>
query Post ($id: ID!) {
  post: post (id: $id) {
    title
    path
    date (format: "YYYY.MM.DD")
    tags {
      id
      title
      path
    }
    description
    content
    cover_image (width: 860, blur: 10)
    add_classes
  }
}
</page-query>

<style lang="scss">
.post-title {
  padding: calc(var(--space) / 2) 0;
  text-align: center;
}

.post {
  &__header {
    width: calc(100% + var(--space) * 2);
    margin-left: calc(var(--space) * -1);
    margin-top: calc(var(--space) * -1);
    margin-bottom: calc(var(--space) / 2);
    overflow: hidden;
    border-radius: var(--radius) var(--radius) 0 0;

    img {
      width: 100%;
    }

    &:empty {
      display: none;
    }
  }

  &__content {
    h1:first-child {
      display: none;
    }

    @for $i from 1 through 5 {
      // 连续的标题
      h#{$i} + h#{$i + 1},
      // br标签后的标题
      br + h#{$i},
      // 处于开头的标题
      h#{$i}:first-child {
        margin-top: 0;
      }
    }

    img {
      display: block;
      margin-left: auto;
      margin-right: auto;
      max-width: 100%;
    }

    &.image {
      &--small img {
        max-width: 50%;
      }

      &--medium img {
        max-width: calc(0.618 * (100% + 2 * var(--space)));
      }

      &--large img {
        max-width: 100%;
      }

      &--full img {
        margin: {
          left: calc(var(--space) * -1);
          right: calc(var(--space) * -1);
        }
        max-width: none;
        width: calc(100% + var(--space) * 2);
      }
    }
  }
}

.post-comments {
  padding: calc(var(--space) / 2);

  &:empty {
    display: none;
  }
}

.post-author {
  margin-top: calc(var(--space) / 2);
}
</style>
