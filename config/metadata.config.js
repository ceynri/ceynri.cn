module.exports = {
  my: {
    name: '山风',
    id: 'ceynri',
    bio: 'Stay thinking.',
  },
  link: {
    feed: '/feed.xml',
  },
  nav: {
    home: [
      {
        name: 'Blog',
        link: '/blog/',
      },
      {
        name: 'Note',
        link: 'https://notes.ceynri.cn/',
      },
    ],
    blog: [
      {
        name: 'Blog',
        link: '/blog/',
        icon: 'feather',
      },
      {
        name: 'About',
        // link: '/about/',
        link: 'javascript:alert("Coming soon! 😂");',
        use: 'a',
        icon: 'info',
      },
      {
        name: 'Archive',
        link: '/blog/archive/',
        icon: 'archive',
      },
      {
        name: 'Feed',
        link: '/feed.xml',
        icon: 'rss',
        use: 'a',
      },
      {
        name: 'Home',
        link: '/',
        icon: 'home',
      },
    ],
  },
  social: {
    home: [
      {
        name: 'GitHub',
        link: 'https://github.com/ceynri',
        tooltip: '@ceynri',
      },
      {
        name: 'Mail',
        link: 'mailto:ceynri@gmail.com',
        tooltip: 'ceynri@gmail.com',
      },
    ],
    blog: [
      {
        name: 'Bangumi',
        link: 'https://bgm.tv/anime/list/558747',
        tooltip: '@山风',
      },
      {
        name: 'Bilibili',
        link: 'https://space.bilibili.com/937275',
        tooltip: '@山风P',
      },
      {
        name: 'RSS',
        link: '/feed.xml',
        tooltip: '',
      },
    ],
  },
  beian: {
    link: 'https://beian.miit.gov.cn/',
    text: '粤ICP备20009331号',
  },
};
