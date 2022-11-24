import type { APIRoute } from "astro";
import useQuery from "../../../helper/useQuery.js";
import useDb from "../../../helper/useDb.js";

export const get: APIRoute = async ({ params, request }) => {
  const db = await useDb();
  const { source, action } = params;
  const { key } = useQuery(request.url);
  console.info({ source, action, key });
  if (source == "firefox" || source == "chrome") {
    switch (action) {
      case "install":
        const exist = db.data![source].install.includes(key);
        if (!exist) db.data![source].install.push(key);
        break;
      case "remove":
        const index = db.data![source].install.findIndex((id) => id == key);
        if (index > -1) {
          db.data![source].deinstall.push(key);
          db.data![source].install.splice(index, 1);
        }
        break;
    }
    await db.write();
    return {
      status: 200,
      body: JSON.stringify({
        message: action + " from " + source + " successfull",
      }),
    };
  } else {
    return {
      status: 400,
      body: JSON.stringify({
        message: "this browser is not supported",
      }),
    };
  }
};
