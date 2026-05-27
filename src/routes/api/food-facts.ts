import { createFileRoute } from "@tanstack/react-router";

const SEARCH_LEGACY = "https://world.openfoodfacts.org/cgi/search.pl";
const SEARCH_V2 = "https://world.openfoodfacts.org/api/v2/search";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const USER_AGENT = "NutriQuestKids/1.0 (educational food label app)";

const FIELDS = [
  "code", "_id", "product_name", "product_name_pt", "generic_name", "brands",
  "categories", "categories_tags", "image_front_small_url",
  "nutriscore_grade", "nutrition_grades", "nutriments",
  "ecoscore_grade", "ecoscore_score", "ecoscore_data",
  "environmental_score_grade", "environmental_score_score",
].join(",");

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    });
    if (!res.ok) throw new Error(`Open Food Facts respondeu ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}

export const Route = createFileRoute("/api/food-facts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get("type");

        try {
          if (type === "search") {
            const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
            if (q.length < 2) return json({ ok: true, products: [] });

            const legacyParams = new URLSearchParams({
              search_terms: q,
              search_simple: "1",
              action: "process",
              json: "1",
              page_size: "24",
              sort_by: "unique_scans_n",
              fields: FIELDS,
            });
            const v2Params = new URLSearchParams({ search_terms: q, page_size: "24", fields: FIELDS });

            let data = await fetchJson(`${SEARCH_LEGACY}?${legacyParams.toString()}`).catch(() => null);
            if (!data || !Array.isArray(data.products) || data.products.length === 0) {
              data = await fetchJson(`${SEARCH_V2}?${v2Params.toString()}`).catch(() => null);
            }

            return json({ ok: true, products: Array.isArray(data?.products) ? data.products : [] });
          }

          if (type === "product") {
            const code = (url.searchParams.get("code") ?? "").replace(/\D/g, "").slice(0, 32);
            if (!code) return json({ ok: false, product: null, error: "Código inválido" }, 400);

            const data = await fetchJson(`${PRODUCT_URL}/${encodeURIComponent(code)}.json?fields=${encodeURIComponent(FIELDS)}`);
            return json({ ok: true, product: data?.status === 1 ? data.product : null });
          }

          return json({ ok: false, error: "Tipo de consulta inválido" }, 400);
        } catch (error) {
          console.error("Open Food Facts proxy error", error);
          return json({ ok: false, error: "SERVICE_UNAVAILABLE", fallback: true });
        }
      },
    },
  },
});