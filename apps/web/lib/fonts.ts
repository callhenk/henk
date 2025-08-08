import {
  Sora as HeadingFont,
  Plus_Jakarta_Sans as SansFont,
} from 'next/font/google';

/**
 * @sans
 * @description Define here the sans font.
 * By default, it uses the Inter font from Google Fonts.
 */
const sans = SansFont({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

/**
 * @heading
 * @description Define here the heading font.
 */
const heading = HeadingFont({
  subsets: ['latin'],
  variable: '--font-heading',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

// we export these fonts into the root layout
export { heading, sans };
