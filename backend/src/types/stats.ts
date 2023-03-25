export const Browser = ["Chrome", "Firefox", "Edge", "Safari"] as const;
export type AvailableBrowser = (typeof Browser)[number];

export type Statistic = {
	[key in AvailableBrowser]: BrowserStats;
};

export type BrowserStats = {
	installs: string[];
	deinstalls: string[];
};
