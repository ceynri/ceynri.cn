module.exports = {
  nav: {
    // home: {
    //   name: 'Home',
    //   link: '/',
    //   showOn: ['blog'],
    // },
    blog: {
      name: 'Blog',
      link: '/blog/',
      showOn: ['home', 'blog'],
    },
    note: {
      name: 'Note',
      link: 'https://notes.ceynri.cn/',
      showOn: ['home', 'blog'],
    },
    v1: {
      name: 'V1',
      link: 'https://ceynri.cn/v1/',
      showOn: [],
    },
  },
  social: {
    github: {
      name: 'GitHub',
      link: 'https://github.com/ceynri',
      tooltip: '@ceynri',
      showOn: ['home', 'blog'],
    },
    bangumi: {
      name: 'Bangumi',
      link: 'https://bgm.tv/anime/list/558747',
      tooltip: '@山风',
      showOn: ['home', 'blog'],
    },
    bilibili: {
      name: 'Bilibili',
      link: 'https://space.bilibili.com/937275',
      tooltip: '@山风P',
      showOn: ['blog'],
    },
    mail: {
      name: 'Mail',
      link: 'mailto:ceynri@gmail.com',
      tooltip: 'ceynri@gmail.com',
      showOn: ['blog'],
    },
    rss: {
      name: 'RSS',
      link: '/feed.xml',
      tooltip: '',
      showOn: ['blog'],
    },
  },
  beian: {
    link: 'https://beian.miit.gov.cn/',
    text: '粤ICP备20009331号',
  },
};
