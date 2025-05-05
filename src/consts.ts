import { Archive, Feather, Home, Info, Rss } from 'lucide-astro';

export const SITE_TITLE = 'ceynri.cn';
export const SITE_DESCRIPTION = '';

export const SITE_OWNER_NAME = '山风';
export const SITE_OWNER_ID = 'ceynri';
export const SITE_OWNER_BIO = 'Stay thinking.';
export const SITE_WELCOME = `👋 Hi there. I'm a frontend developer, like to create meaningful stuff.`;

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
