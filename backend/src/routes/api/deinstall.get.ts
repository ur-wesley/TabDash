import { type Statistic } from "../../types/stats.js";

export default eventHandler(async (event) => {
	try {
		const stats: Statistic = await useStorage().getItem("db:stats.json");
		if (!stats) {
			throw new Error();
		}

		const query = getQuery(event);
		const { id, browser } = query;
		const index = stats[browser].installs.findIndex((b) => b == id);
		if (index == -1) {
			throw new Error();
		}

		stats[browser].installs.splice(index);
		stats[browser].deinstalls.push(id);
		await useStorage().setItem("db:stats.json", stats);
		setResponseStatus(event, 200);
		return { status: 200, body: "updated" };
	} catch (error) {
		console.error(error);
		setResponseStatus(event, 400);
		return { status: 400, body: "could not update statistic entry" };
	}
});
