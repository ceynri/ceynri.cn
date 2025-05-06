import { Archive, Feather, Home, Info, Rss } from 'lucide-astro';

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

/** 站点欢迎语 */
export const SITE_WELCOME = `👋 Hi there. I'm a frontend developer, like to create meaningful stuff.`;

/** 导航栏项信息 */
export const NAV_ITEMS: Array<{
  name: string;
  icon: any;
  href: string;
}> = [
  {
    name: 'Blog',
    icon: Feather,
    href: '/blog/',
  },
  {
    name: 'About',
    icon: Info,
    href: '/about/',
  },
  {
    name: 'Archive',
    icon: Archive,
    href: '/blog/archive/',
  },
  {
    name: 'RSS',
    icon: Rss,
    href: '/feed.xml',
  },
  {
    name: 'Home',
    icon: Home,
    href: '/',
  },
] as const;

/** 备案信息 */
export const FILING = {
  link: 'https://beian.miit.gov.cn/',
  text: '粤ICP备20009331号',
} as const;

/** 博客每页文章数量 */
export const BLOG_POST_PER_PAGE = 10;
