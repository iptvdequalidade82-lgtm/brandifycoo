import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const origin = "https://brandifycoo.br";
const pages = JSON.parse(readFileSync("src/data/seo-pages.json", "utf8"));
const base = readFileSync("dist/index.html", "utf8");
const escape = s => String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");

function structuredData(path, meta) {
  const organization = {
    "@type": "Organization",
    "@id": origin + "/#organizacao",
    name: "Brandify",
    url: origin + "/",
    description: "Estúdio de criação de sites institucionais, landing pages e design de lojas virtuais.",
    email: "brandifycoo@gmail.com",
    telephone: "+5543991065129",
    areaServed: { "@type": "Country", name: "Brasil" },
    sameAs: ["https://www.instagram.com/brandifycoo"],
  };
  if (path !== "/" && meta.type === "service") return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "Service",
        "@id": origin + path + "#servico",
        name: meta.serviceType,
        serviceType: meta.serviceType,
        description: meta.description,
        url: origin + path,
        provider: { "@id": organization["@id"] },
        areaServed: { "@type": "Country", name: "Brasil" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: origin + "/" },
          { "@type": "ListItem", position: 2, name: meta.serviceType, item: origin + path },
        ],
      },
    ],
  };
  return null;
}

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
    const data = structuredData(path, meta);
    const jsonLd = data
      ? '<script id="brandify-structured-data" type="application/ld+json">' +
        JSON.stringify(data).replace(/</g, "\\u003c") + '</script>'
      : "";
    html = html.replace(/<script id="brandify-structured-data"[^>]*>[\s\S]*?<\/script>/, jsonLd);
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
