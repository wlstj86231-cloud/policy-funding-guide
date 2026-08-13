import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const document = JSON.parse(await fs.readFile(path.join(root, "data", "verified-funds.json"), "utf8"));
const funds = Array.isArray(document) ? document : document.items;
const failures = [];

for (let index = 0; index < funds.length; index += 4) {
  const batch = funds.slice(index, index + 4);
  const results = await Promise.all(batch.map(async (fund) => {
    try {
      const response = await fetch(fund.sourceUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
        headers: { "user-agent": "policyfundpedia-source-check/1.0" }
      });
      return { title: fund.title, status: response.status, ok: response.ok, url: response.url };
    } catch (error) {
      return { title: fund.title, status: 0, ok: false, error: error.message, url: fund.sourceUrl };
    }
  }));
  for (const result of results) {
    console.log(`${result.ok ? "OK" : "FAIL"} ${result.status} ${result.title} -> ${result.url}`);
    if (!result.ok) failures.push(result);
  }
}

if (failures.length) {
  console.error(`${failures.length} official source checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`All ${funds.length} official source URLs responded successfully.`);
}
