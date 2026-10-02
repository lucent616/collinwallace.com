// Compile src/*.jsx (in the same order index.html used to load them) into one
// plain-JS bundle at dist/app.js, so visitors no longer download Babel and
// compile the site in their browser. Output is committed; GitHub Pages serves it.
//
//   npm install && npm run build      (or: npm run watch while editing)
import { readFileSync, writeFileSync, mkdirSync, watch, statSync } from "node:fs";
import { transformSync } from "@babel/core";
import { minify } from "terser";

const ORDER = ["data", "cms", "primitives", "chrome", "home", "writing", "book", "speaking", "about", "contact", "app"];

async function build() {
  const t0 = Date.now();
  const parts = ORDER.map((name) => {
    const file = `src/${name}.jsx`;
    const { code } = transformSync(readFileSync(file, "utf8"), {
      filename: file,
      presets: [["@babel/preset-react", { runtime: "classic" }]],
      sourceType: "script",
      compact: false,
      babelrc: false,
      configFile: false,
    });
    // Each source file declared top-level consts (e.g. `const { useState } = React`)
    // and exposed components via Object.assign(window, …). Wrapping each file in
    // its own block scope keeps those declarations from colliding when concatenated.
    return `/* ---- ${file} ---- */\n{\n${code}\n}\n`;
  });
  const joined = `"use strict";\n` + parts.join("\n");
  const min = await minify(joined, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
  mkdirSync("dist", { recursive: true });
  writeFileSync("dist/app.js", min.code);
  const kb = (statSync("dist/app.js").size / 1024).toFixed(0);
  console.log(`built dist/app.js (${kb} KB) in ${Date.now() - t0} ms`);
}

await build();
if (process.argv.includes("--watch")) {
  console.log("watching src/ …");
  let timer;
  watch("src", () => { clearTimeout(timer); timer = setTimeout(() => build().catch((e) => console.error(e.message)), 80); });
}
