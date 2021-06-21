<script>
export default {
  props: {
    /**
     * enum: [0, 1]
     */
    enableReactions: {
      type: Number,
      default: 1,
    },
    /**
     * enum: ['dark', 'light', 'preferred_color_scheme']
     */
    theme: {
      type: String,
    },
  },
  data() {
    return {
      scheme: this.theme || this.$store.state.scheme,
    };
  },
  render(h) {
    return (
      <div class="giscus">
        <script
          src="https://giscus.app/client.js"
          data-repo="ceynri/ceynri.cn"
          data-repo-id="MDEwOlJlcG9zaXRvcnkyMzg4NDQwNzg="
          data-category="Announcements"
          data-category-id="MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMzMDQxNzg2"
          data-mapping="title"
          data-reactions-enabled={this.enableReactions}
          data-theme={this.scheme}
          crossorigin="anonymous"
          async
        />
      </div>
    );
  },
};
</script>
