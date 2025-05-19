import { Archive, Feather, Github, Home, Info, Mail, Rss, X } from '~/components/icons';

/** 站点信息 */
export const SITE_TITLE = '山风的小角落';

/** 站点描述 */
export const SITE_DESCRIPTION = `山风的个人网站 / Ceynri's personal website`;

/** 站点所有者名称 */
export const SITE_OWNER_NAME = '山风';

/** 站点所有者 ID */
export const SITE_OWNER_ID = 'ceynri';

/** 站点所有者简介 */
export const SITE_OWNER_BIO = 'Stay thinking.';

/** 导航栏项类型 */
interface NavItem {
  name: string;
  icon: any;
  href: string;
}

/** 导航栏项信息表 */
export const NAV_ITEM_MAP = {
  home: {
    name: 'Home',
    icon: Home,
    href: '/',
  },
  blog: {
    name: 'Blog',
    icon: Feather,
    href: '/blog/',
  },
  about: {
    name: 'About',
    icon: Info,
    href: '/about/',
  },
  archive: {
    name: 'Archive',
    icon: Archive,
    href: '/blog/archive/',
  },
  rss: {
    name: 'RSS',
    icon: Rss,
    href: '/feed.xml',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    href: 'https://github.com/ceynri',
  },
  twitter: {
    name: 'Twitter',
    icon: X,
    href: 'https://x.com/ceynri',
  },
  email: {
    name: 'Email',
    icon: Mail,
    href: 'mailto:ceynri@gmail.com',
  },
} as const satisfies Record<string, NavItem>;

/** 导航栏项列表 */
export const NAV_ITEMS = [
  NAV_ITEM_MAP.blog,
  NAV_ITEM_MAP.about,
  NAV_ITEM_MAP.archive,
  NAV_ITEM_MAP.rss,
  NAV_ITEM_MAP.home,
] as const;

/** 首页入口项列表 */
export const HOME_ENTRY_ITEMS = [
  NAV_ITEM_MAP.home,
  NAV_ITEM_MAP.blog,
  NAV_ITEM_MAP.about,
] as const;

/** 首页顶部外链列表 */
export const HOME_TOP_NAV_ITEMS = [
  NAV_ITEM_MAP.github,
  NAV_ITEM_MAP.twitter,
  NAV_ITEM_MAP.email,
] as const;

/** 备案信息 */
export const FILING = {
  link: 'https://beian.miit.gov.cn/',
  text: '粤ICP备20009331号',
} as const;

/** 博客每页文章数量 */
export const BLOG_POST_PER_PAGE = 10;
