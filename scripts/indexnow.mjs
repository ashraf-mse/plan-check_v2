import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const HOST = "plancheck.dev";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

const files = await readdir("public");
const keyFile = files.find((name) => /^[a-f0-9]{32,128}\.txt$/i.test(name));
if (!keyFile) {
  console.error("IndexNow key file not found in public/.");
  process.exit(2);
}

const key = (await readFile(join("public", keyFile), "utf8")).trim();
if (!key || basename(keyFile, ".txt") !== key) {
  console.error("IndexNow key file name and contents must match.");
  process.exit(2);
}

const rawUrls = process.argv.slice(2);
if (!rawUrls.length) {
  console.error("Usage: npm run indexnow -- https://plancheck.dev/page [more URLs]");
  process.exit(2);
}

const urlList = rawUrls.map((raw) => {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.hostname !== HOST) {
    throw new Error(`URL must belong to https://${HOST}: ${raw}`);
  }
  return url.toString();
});

const response = await fetch(INDEXNOW_ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${keyFile}`,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  console.error(`IndexNow failed: HTTP ${response.status}${body ? ` — ${body}` : ""}`);
  process.exit(1);
}

console.log(`IndexNow accepted ${urlList.length} URL(s) with HTTP ${response.status}.`);
