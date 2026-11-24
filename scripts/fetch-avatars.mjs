// Downloads one distinct portrait per person into public/avatars for the simulated WhatsApp window.
// Run once from the project root:  node scripts/fetch-avatars.mjs
// Source: randomuser.me portraits (free to use for development and demos). To use your own photos,
// skip this script and put JPGs with the same names in public/avatars instead.
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "avatars");
const PEOPLE = {
  adaeze: "women/44",
  ngozi: "women/65",
  chiamaka: "women/17",
  folake: "women/26",
  tunde: "men/32",
  ibrahim: "men/75",
  henry: "men/46",
  me: "men/52",
};

await mkdir(OUT, { recursive: true });
for (const [name, path] of Object.entries(PEOPLE)) {
  const file = join(OUT, `${name}.jpg`);
  if (await access(file).then(() => true, () => false)) {
    console.log(`skip  ${name}.jpg (already there)`);
    continue;
  }
  const response = await fetch(`https://randomuser.me/api/portraits/${path}.jpg`);
  if (!response.ok) {
    console.error(`FAIL  ${name}.jpg (${response.status})`);
    continue;
  }
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  console.log(`saved ${name}.jpg`);
}
