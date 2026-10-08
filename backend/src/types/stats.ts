export const Browser = ['Chrome', 'Firefox', 'Edge', 'Safari'] as const;
export type AvailableBrowser = (typeof Browser)[number];

export interface BrowserStats {
  installs: number;
  deinstalls: number;
}

export type StatisticResponse = Record<AvailableBrowser, BrowserStats>;
