const Browser = ['Chrome', 'Firefox', 'Edge', 'Safari'] as const;

type AvailableBrowser = (typeof Browser)[number];

interface BrowserStats {
  deinstalls: number;
  installs: number;
}

type StatisticResponse = Record<AvailableBrowser, BrowserStats>;

export { Browser };
export type { AvailableBrowser, BrowserStats, StatisticResponse };
