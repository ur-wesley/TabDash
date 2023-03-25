import { type Setting } from "../../types/setting.js";
import crypto from "../../utils/crypto.js";

export default eventHandler(async (event) => {
	try {
		let settings: Setting[] = await useStorage().getItem("db:settings.json");
		if (!settings) {
			settings = [];
		}
		const query = getQuery(event);
		const value = await readRawBody(event);
		const { key, p } = query;
		const settingIndex = settings.findIndex((s) => Object.keys(s)[0] == key);
		const setting = { [key]: crypto.encrypt(value, p) };
		if (settingIndex == -1) {
			settings.push(setting);
			await useStorage().setItem("db:settings.json", settings);
			setResponseStatus(event, 201);
			return { status: 201, body: "created" };
		}

		if (settingIndex > -1) {
			settings[settingIndex] = setting;
			setResponseStatus(event, 200);
			return { status: 200, body: "patched" };
		}
	} catch (error) {
		console.error(error);
		setResponseStatus(event, 400);
		return { status: 400, body: "could not create setting entry" };
	}
});
