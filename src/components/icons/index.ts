// Re-export lucide-astro and simple-icons-astro in .ts file to make vite-plugin-entry-shaking work
export type { AstroComponent as LucideComponent } from '@lucide/astro';
export {
  Archive,
  Feather,
  House,
  Info,
  Mail,
  Menu,
  Moon,
  RefreshCw,
  Rss,
  Sun,
} from '@lucide/astro';

export { Github, X } from 'simple-icons-astro';
