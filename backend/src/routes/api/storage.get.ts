import { type Setting } from "../../types/setting.js";
import crypto from "../../utils/crypto.js";

export default eventHandler(async (event) => {
	try {
		const settings: Setting[] = await useStorage().getItem("db:settings.json");
		const query = getQuery(event);
		const { key, p } = query;
		const setting = settings.find((s) => Object.keys(s)[0] == key);
		if (!setting) throw new Error("Not Found");
		setHeader(event, "Content-Type", "application/json");
		setResponseStatus(event, 200);
		return crypto.decrypt(Object.values(setting)[0], p);
	} catch (error) {
		console.error(error);
		setResponseStatus(event, 400);
		return { status: 400, body: "could not get storage entry" };
	}
});
