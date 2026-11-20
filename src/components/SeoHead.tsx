import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import seoPages from "@/data/seo-pages.json";

const SITE_ORIGIN = "https://brandifycoo.br"; // Confirm production DNS before launch.
type SeoPage = {
  title: string;
  description: string;
  type: "website" | "service" | "legal";
  serviceType?: string;
};
const pages = seoPages as Record<string, SeoPage>;

function getOrCreateMeta(attribute: "name" | "property", key: string) {
  let el = document.head.querySelector<HTMLMetaElement>('meta[' + attribute + '="' + key + '"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.append(el);
  }
  return el;
}

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": SITE_ORIGIN + "/#organizacao",
    name: "Brandify",
    url: SITE_ORIGIN + "/",
    description: "Estúdio de criação de sites institucionais, landing pages e design de lojas virtuais.",
    email: "brandifycoo@gmail.com",
    telephone: "+5543991065129",
    areaServed: { "@type": "Country", name: "Brasil" },
    sameAs: ["https://www.instagram.com/brandifycoo"],
  };
}

function schemaForRoute(path: string, page: SeoPage | undefined) {
  if (!page) return null;
  const org = organizationSchema();
  if (path === "/") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        org,
        {
          "@type": "WebSite",
          "@id": SITE_ORIGIN + "/#website",
          name: "Brandify",
          url: SITE_ORIGIN + "/",
          inLanguage: "pt-BR",
          publisher: { "@id": org["@id"] },
        },
      ],
    };
  }
  if (page.type === "service") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        org,
        {
          "@type": "Service",
          "@id": SITE_ORIGIN + path + "#servico",
          name: page.serviceType,
          serviceType: page.serviceType,
          description: page.description,
          url: SITE_ORIGIN + path,
          provider: { "@id": org["@id"] },
          areaServed: { "@type": "Country", name: "Brasil" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE_ORIGIN + "/" },
            { "@type": "ListItem", position: 2, name: page.serviceType, item: SITE_ORIGIN + path },
          ],
        },
      ],
    };
  }
  return null;
}

/** Route-aware metadata: no invented ratings, reviews, or FAQ rich-result claims. */
export default function SeoHead() {
  const location = useLocation();
  useEffect(() => {
    const pathname = location.pathname.length > 1
      ? location.pathname.replace(/\/+$/, "")
      : "/";
    const page = pages[pathname];
    const canonical = page ? SITE_ORIGIN + pathname : null;

    document.documentElement.lang = "pt-BR";
    document.title = page?.title ?? "Página não indexável | Brandify";
    getOrCreateMeta("name", "description").content = page?.description ?? "Área interna ou página não encontrada.";
    getOrCreateMeta("name", "robots").content = page
      ? "index, follow, max-image-preview:large"
      : "noindex, nofollow, noarchive";

    const canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const link = canonicalEl ?? document.createElement("link");
      link.rel = "canonical";
      link.href = canonical;
      if (!canonicalEl) document.head.append(link);
    } else canonicalEl?.remove();

    getOrCreateMeta("property", "og:type").content = "website";
    getOrCreateMeta("property", "og:title").content = page?.title ?? "Brandify";
    getOrCreateMeta("property", "og:description").content = page?.description ?? "";
    getOrCreateMeta("property", "og:url").content = canonical ?? SITE_ORIGIN + "/";
    getOrCreateMeta("name", "twitter:card").content = "summary_large_image";
    getOrCreateMeta("name", "twitter:title").content = page?.title ?? "Brandify";
    getOrCreateMeta("name", "twitter:description").content = page?.description ?? "";

    const schema = schemaForRoute(pathname, page);
    const script = document.head.querySelector<HTMLScriptElement>("#brandify-structured-data");
    if (schema) {
      const el = script ?? document.createElement("script");
      el.id = "brandify-structured-data";
      el.type = "application/ld+json";
      el.textContent = JSON.stringify(schema);
      if (!script) document.head.append(el);
    } else script?.remove();
  }, [location.pathname]);

  return null;
}
