import type { Preset } from 'unocss';
import mdi from '@iconify-json/mdi/icons.json';

type MdiIcon = { body: string };
type MdiPack = {
  aliases?: Record<string, { parent: string }>;
  height?: number;
  icons: Record<string, MdiIcon>;
  width?: number;
};

const pack = mdi as MdiPack;
const defaultSize = pack.width ?? 24;

function encodeSvgForCss(svg: string): string {
  let useSvg = svg.startsWith('<svg>') ? svg.replace('<svg>', '<svg >') : svg;
  if (!useSvg.includes(' xmlns=')) {
    useSvg = useSvg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }
  return useSvg
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\s+/g, ' ');
}

function resolveMdiBody(name: string): string | undefined {
  const seen = new Set<string>();
  let current = name;
  while (true) {
    if (seen.has(current)) {
      return undefined;
    }
    seen.add(current);
    const icon = pack.icons[current];
    if (icon) {
      return icon.body;
    }
    const parent = pack.aliases?.[current]?.parent;
    if (!parent) {
      return undefined;
    }
    current = parent;
  }
}

function mdiIconCss(name: string): Record<string, string> | undefined {
  const body = resolveMdiBody(name);
  if (!body) {
    return undefined;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${defaultSize}" height="${defaultSize}" viewBox="0 0 ${defaultSize} ${defaultSize}">${body}</svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeSvgForCss(svg)}")`;
  return {
    '--un-icon': url,
    '-webkit-mask': 'var(--un-icon) no-repeat',
    '-webkit-mask-size': '100% 100%',
    'background-color': 'currentColor',
    display: 'inline-block',
    height: '1em',
    'mask-size': '100% 100%',
    mask: 'var(--un-icon) no-repeat',
    'vertical-align': 'middle',
    width: '1em',
  };
}

export const presetMdiIconsSync = (): Preset => ({
  enforce: 'pre',
  name: 'tabdash-mdi-icons-sync',
  rules: [
    [
      /^i-mdi-([a-z0-9-]+)$/,
      ([, iconName]) => {
        if (!iconName) {
          return undefined;
        }
        return mdiIconCss(iconName);
      },
    ],
  ],
});
