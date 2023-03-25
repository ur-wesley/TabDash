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

		const query = getQuery(event);
		const { id, browser } = query;
		if (stats[browser].installs.includes(id)) {
			throw new Error();
		}

		stats[browser].installs.push(id);
		await useStorage().setItem("db:stats.json", stats);
		setResponseStatus(event, 201);
		return { status: 201, body: "created" };
	} catch (error) {
		console.error(error);
		setResponseStatus(event, 400);
		return { status: 400, body: "could not create statistic entry" };
	}
});
