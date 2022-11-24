import type { APIRoute } from "astro";
import useDb from "../../helper/useDb.js";

export const get: APIRoute = async ({ params, request }) => {
  const db = await useDb();
  const stats = {
    firefox: {
      installs: db.data!.firefox.install.length,
      deinstalls: db.data!.firefox.deinstall.length,
    },
    chrome: {
      installs: db.data!.chrome.install.length,
      deinstalls: db.data!.chrome.deinstall.length,
    },
    overall: {
      installs:
        db.data!.firefox.install.length + db.data!.chrome.install.length,
      deinstalls:
        db.data!.firefox.deinstall.length + db.data!.chrome.deinstall.length,
    },
  };
  return {
    status: 200,
    body: JSON.stringify(stats),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
