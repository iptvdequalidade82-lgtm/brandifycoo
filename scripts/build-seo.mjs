import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const origin = "https://brandifycoo.br";
const pages = JSON.parse(readFileSync("src/data/seo-pages.json", "utf8"));
const base = readFileSync("dist/index.html", "utf8");
const escape = s => String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");

function generate(path, meta) {
  let html = base;
  const url = origin + path;
  html = html.replace(/<title>[^<]*<\/title>/, "<title>" + escape(meta.title) + "</title>");
  const fields = [
    ["name", "description", meta.description],
    ["property", "og:title", meta.title],
    ["property", "og:description", meta.description],
    ["property", "og:url", url],
    ["name", "twitter:title", meta.title],
    ["name", "twitter:description", meta.description]
  ];
  for (const [attr, key, value] of fields) {
    const needle = new RegExp("(<meta " + attr + '="' + key + '" content=")[^"]*(")');
    if (!needle.test(html)) throw new Error("Missing head tag " + key);
    html = html.replace(needle, (_, start, end) => start + escape(value) + end);
  }
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, '<link rel="canonical" href="' + url + '" />');
  if (path !== "/") {
    html = html.replace(/<script id="brandify-structured-data"[^>]*>[\s\S]*?<\/script>/, "");
  }
  return html;
}

const routes = Object.entries(pages);
for (const [path, meta] of routes) {
  if (meta.title.length > 64 || meta.description.length > 160) throw new Error("Invalid SEO metadata " + path);
  const dest = path === "/" ? "dist/index.html" : "dist/" + path.slice(1) + "/index.html";
  if (path !== "/") mkdirSync("dist/" + path.slice(1), {recursive:true});
  writeFileSync(dest, generate(path, meta), "utf8");
}
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes.map(([path]) => '  <url><loc>' + origin + path + '</loc></url>').join('\n') +
  '\n</urlset>\n';
writeFileSync("dist/sitemap.xml", xml, "utf8");
console.log("[SEO] " + routes.length + " HTML heads + sitemap.xml generated.");
