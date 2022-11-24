import { join, dirname } from "node:path";
import { mkdir, open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { version } from '../../package.json';
import type { DB } from "./types.js";
export default async () => {
  const __dirname = import.meta.env.SECRET_DB_LOCATION ?? dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, "db.json");
  try {
    await mkdir(__dirname, { recursive: true }).catch(console.error);
  } catch {
    await open(file, 'w');
  }
  const adapter = new JSONFile(file);
  const db = new Low<DB>(adapter);
  await db.read();
  db.data ||= {
    version,
    firefox: { deinstall: new Array<string>(), install: new Array<string>() },
    chrome: { deinstall: new Array<string>(), install: new Array<string>() },
    settings: [],
  };
  if (db.data.version != version) {
    db.data.version = version;
    await db.write()
  }
  return db;
};
