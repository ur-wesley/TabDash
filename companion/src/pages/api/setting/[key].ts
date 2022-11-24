import type { APIRoute } from "astro";
import useDb from "../../../helper/useDb.js";
import useQuery from "../../../helper/useQuery.js";
import useCrypto from "../../../helper/useCrypto.js";

export const get: APIRoute = async ({ params, request }) => {
  const crypto = new useCrypto();
  const db = await useDb();
  const { key } = params;
  const { p } = useQuery(request.url);
  const encryptedSettings = db.data!.settings.find(
    (s) => Object.keys(s)[0] == key
  );
  if (!encryptedSettings)
    return {
      status: 404,
      body: "Not Found",
    };
  const settings = crypto.decrypt(encryptedSettings[key!], p);
  return {
    status: 200,
    body: settings,
  };
};

export const post: APIRoute = async ({ params, request }) => {
  const { key } = params;
  const db = await useDb();
  const crypto = new useCrypto();
  const { p } = useQuery(request.url);
  const settings = await request.json();
  const encryptedSettings = crypto.encrypt(JSON.stringify(settings), p);
  const map = db.data!.settings.filter(
    (s) => Object.keys(s)[0] === key!.toString()
  );
  if (map.length > 0) {
    const index = db.data!.settings.findIndex(
      (s) => Object.keys(s)[0] == key!.toString()
    );
    db.data!.settings[index] = { [key!.toString()]: encryptedSettings };
  } else {
    db.data!.settings.push({ [key!.toString()]: encryptedSettings });
  }
  await db.write();
  return {
    status: 201,
    body: "settings saved",
  };
};
