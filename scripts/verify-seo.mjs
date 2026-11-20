import { readFileSync } from "node:fs";

const origin = "https://brandifycoo.br";
const pages = JSON.parse(readFileSync("src/data/seo-pages.json", "utf8"));
const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const robots = readFileSync("dist/robots.txt", "utf8");

function assert(ok, message) {
  if (!ok) throw new Error("[SEO check] " + message);
}
assert(sitemap.includes("<urlset"), "Invalid or missing sitemap root");
assert(robots.includes("Sitemap: " + origin + "/sitemap.xml"), "Sitemap not declared in robots.txt");
const routeCount = Object.keys(pages).length;
assert(routeCount >= 8, "Missing SEO route");

for (const [path, page] of Object.entries(pages)) {
  const file = path === "/" ? "dist/index.html" : "dist/" + path.slice(1) + "/index.html";
  const html = readFileSync(file, "utf8");
  const canonical = origin + path;
  assert(html.includes("<title>" + page.title + "</title>"), "Wrong title for " + path);
  assert(html.includes('content="' + page.description + '"'), "Wrong description for " + path);
  assert(html.includes('<link rel="canonical" href="' + canonical + '"'), "Wrong canonical for " + path);
  assert(html.includes('property="og:url" content="' + canonical + '"'), "Wrong Open Graph URL for " + path);
  assert(sitemap.includes("<loc>" + canonical + "</loc>"), "Route absent from sitemap: " + path);
  assert(!html.includes('name="robots" content="noindex'), "Public page marked noindex: " + path);

  const match = html.match(/<script id="brandify-structured-data" type="application\/ld\+json">\s*([\s\S]*?)<\/script>/);
  if (page.type === "service" || path === "/") {
    assert(match, "Structured data missing on " + path);
    const parsed = JSON.parse(match[1]);
    const types = parsed["@graph"].map(node => node["@type"]);
    assert(types.includes("Organization"), "Organization schema missing: " + path);
    if (page.type === "service") {
      assert(types.includes("Service"), "Service schema missing: " + path);
      assert(types.includes("BreadcrumbList"), "Breadcrumb schema missing: " + path);
    }
  } else {
    assert(!match, "Irrelevant structured data on " + path);
  }
}
assert((sitemap.match(/<loc>/g) ?? []).length === routeCount, "Sitemap URL count does not match public routes");
console.log("[SEO] Passed metadata, canonical, sitemap, robots and JSON-LD checks for " + routeCount + " public routes.");
