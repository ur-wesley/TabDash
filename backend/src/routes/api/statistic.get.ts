import { type Statistic, Browser } from "../../types/stats.js";

export default eventHandler(async (event) => {
	try {
		let stats: Statistic = await useStorage().getItem("db:stats.json");
		if (!stats) {
			stats = Object.assign(
				{},
				...Browser.map(
					(b) =>
					({
						[b]: {
							installs: [],
							deinstalls: [],
						},
					} as Statistic)
				)
			);
		}

		const mappedStats = Object.entries(stats).map(([k, v]) => ({ [k]: v }));
		setResponseStatus(event, 200);
		return Object.assign(
			{},
			...mappedStats.map((x) => {
				const key = Object.keys(x)[0];
				const [installs, deinstalls] = Object.values(x[key]);
				return {
					[key]: { installs: installs.length, deinstalls: deinstalls.length },
				};
			})
		);
	} catch (error) {
		console.error(error);
		setResponseStatus(event, 400);
		return { status: 400, body: "could not get statistic entries" };
	}
});
