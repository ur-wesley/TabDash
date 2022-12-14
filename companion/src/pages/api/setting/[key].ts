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
    return new Response('Not Found',
      {
        status: 404,
      });
  const settings = crypto.decrypt(encryptedSettings[key!], p);
  if (!settings) {
    return new Response(
      'might not be the correct password',
      {
        status: 400,
      });
  }
  return new Response(settings,
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
};

export const option: APIRoute = async () => new Response('ok',
  {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  })

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
  return new Response("settings saved",
    {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
};
