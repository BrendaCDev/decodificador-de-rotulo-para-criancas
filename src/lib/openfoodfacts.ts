import type { EcoScore, Food, NutriScore } from "./game-data";

const SEARCH_V2 = "https://world.openfoodfacts.org/api/v2/search";
const SEARCH_LEGACY = "https://world.openfoodfacts.org/cgi/search.pl";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";

const FIELDS = [
  "code", "product_name", "product_name_pt", "generic_name", "brands",
  "categories", "categories_tags", "image_front_small_url",
  "nutriscore_grade", "nutrition_grades", "nutriments",
  "ecoscore_grade", "ecoscore_score", "ecoscore_data",
  "environmental_score_grade", "environmental_score_score",
].join(",");

function pickEmoji(name: string, categories?: string): string {
  const s = `${name} ${categories ?? ""}`.toLowerCase();
  const map: [RegExp, string][] = [
    [/maç[aã]|apple/, "🍎"], [/banan/, "🍌"], [/laranj|orange/, "🍊"],
    [/uva|grape/, "🍇"], [/morang|strawberry/, "🍓"], [/melancia|watermelon/, "🍉"],
    [/abacaxi|pineapple/, "🍍"], [/manga|mango/, "🥭"],
    [/br[óo]colis|broccoli/, "🥦"], [/cenoura|carrot/, "🥕"], [/tomate|tomato/, "🍅"],
    [/alface|salad|lettuce/, "🥬"], [/milho|corn/, "🌽"], [/batata|potato/, "🥔"],
    [/p[ãa]o|bread/, "🍞"], [/queijo|cheese/, "🧀"], [/leite|milk/, "🥛"],
    [/iogurte|yogurt/, "🥛"], [/ovo|egg/, "🥚"], [/manteiga|butter/, "🧈"],
    [/carne|beef|steak/, "🥩"], [/frango|chicken/, "🍗"], [/peixe|fish/, "🐟"],
    [/arroz|rice/, "🍚"], [/macarr[ãa]o|pasta|noodle/, "🍝"], [/pizza/, "🍕"],
    [/hamburg/, "🍔"], [/cachorr|hot dog/, "🌭"], [/sandu[íi]/, "🥪"],
    [/biscoit|cookie|bolacha/, "🍪"], [/bolo|cake/, "🍰"], [/chocolat/, "🍫"],
    [/doce|candy|bala/, "🍬"], [/sorvete|ice cream/, "🍦"], [/donut|rosquinha/, "🍩"],
    [/refrigerant|soda|cola/, "🥤"], [/suco|juice/, "🧃"], [/[áa]gua|water/, "💧"],
    [/caf[ée]|coffee/, "☕"], [/ch[áa]|tea/, "🍵"], [/cerveja|beer/, "🍺"],
    [/vinho|wine/, "🍷"], [/salgadinh|chips|snack/, "🍿"],
    [/cereal/, "🥣"], [/granola|aveia|oat/, "🌾"], [/mel|honey/, "🍯"],
    [/azeite|olive oil/, "🫒"], [/sal /, "🧂"], [/a[çc][úu]car|sugar/, "🍬"],
  ];
  for (const [r, e] of map) if (r.test(s)) return e;
  return "🍽️";
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
}

// Estimate Nutri-Score from nutriments when missing (simplified Nutri-Score 2017)
function estimateScore(n: any): NutriScore {
  const sugars = num(n?.sugars_100g) ?? 0;
  const fat = num(n?.saturated_fat_100g) ?? num(n?.fat_100g) ?? 0;
  const sodium = num(n?.sodium_100g) != null ? (num(n?.sodium_100g) as number) * 1000 : (num(n?.salt_100g) ?? 0) * 400;
  const fiber = num(n?.fiber_100g) ?? 0;
  const protein = num(n?.proteins_100g) ?? 0;

  let bad = 0;
  if (sugars > 22.5) bad += 4; else if (sugars > 13.5) bad += 3; else if (sugars > 9) bad += 2; else if (sugars > 4.5) bad += 1;
  if (fat > 20) bad += 4; else if (fat > 10) bad += 3; else if (fat > 5) bad += 2; else if (fat > 2) bad += 1;
  if (sodium > 900) bad += 4; else if (sodium > 540) bad += 3; else if (sodium > 270) bad += 2; else if (sodium > 90) bad += 1;
  let good = 0;
  if (fiber > 4.7) good += 4; else if (fiber > 3.5) good += 3; else if (fiber > 2.1) good += 2; else if (fiber > 0.9) good += 1;
  if (protein > 8) good += 4; else if (protein > 6.4) good += 3; else if (protein > 4.8) good += 2; else if (protein > 3.2) good += 1;

  const score = bad - good;
  if (score <= -1) return "A";
  if (score <= 2) return "B";
  if (score <= 10) return "C";
  if (score <= 18) return "D";
  return "E";
}

function toNutriScore(grade: unknown, n: any): NutriScore {
  const g = String(grade ?? "").toUpperCase();
  if (g === "A" || g === "B" || g === "C" || g === "D" || g === "E") return g;
  return estimateScore(n);
}

function productToFood(p: any): Food | null {
  if (!p) return null;
  const rawName: string =
    p.product_name_pt || p.product_name || p.generic_name || p.brands || "";
  const name = rawName.trim();
  if (!name) return null;
  const n = p.nutriments || {};
  const sodium_g = num(n.sodium_100g);
  const salt_g = num(n.salt_100g);
  const sodiumMg =
    sodium_g != null ? sodium_g * 1000 :
    salt_g != null ? salt_g * 400 : 0;

  return {
    barcode: String(p.code || p._id || ""),
    name: name.length > 60 ? name.slice(0, 60) + "…" : name,
    emoji: pickEmoji(name, p.categories),
    score: toNutriScore(p.nutriscore_grade ?? p.nutrition_grades, n),
    sugar: num(n.sugars_100g) ?? 0,
    sodium: Math.round(sodiumMg),
    fat: num(n.fat_100g) ?? 0,
    fiber: num(n.fiber_100g) ?? 0,
    protein: num(n.proteins_100g) ?? 0,
  };
}

export async function searchFoodsByName(query: string, signal?: AbortSignal): Promise<Food[]> {
  const q = query.trim();
  if (!q) return [];

  // Try v2 search first (more reliable, JSON-native)
  const v2 = `${SEARCH_V2}?search_terms=${encodeURIComponent(q)}&page_size=24&fields=${FIELDS}`;
  try {
    const res = await fetch(v2, { signal, headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json();
      const products: any[] = Array.isArray(data.products) ? data.products : [];
      const list = products.map(productToFood).filter((f): f is Food => !!f && !!f.barcode);
      if (list.length) return list;
    }
  } catch (e: any) {
    if (e?.name === "AbortError") throw e;
  }

  // Fallback: legacy CGI search
  const legacy = `${SEARCH_LEGACY}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=24&fields=${FIELDS}`;
  const res = await fetch(legacy, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`OFF search ${res.status}`);
  const data = await res.json();
  const products: any[] = Array.isArray(data.products) ? data.products : [];
  return products.map(productToFood).filter((f): f is Food => !!f && !!f.barcode);
}

export async function lookupBarcode(barcode: string, signal?: AbortSignal): Promise<Food | null> {
  const code = barcode.trim();
  if (!code) return null;
  const url = `${PRODUCT_URL}/${encodeURIComponent(code)}.json?fields=${FIELDS}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1) return null;
  return productToFood(data.product);
}

/** Re-fetch a food's complete data from OFF when nutritional info is incomplete. */
export async function enrichFood(food: Food, signal?: AbortSignal): Promise<Food> {
  // Local mock barcodes are unlikely to exist on OFF — keep as-is.
  const hasNoNutrition =
    food.sugar === 0 && food.fat === 0 && food.fiber === 0 &&
    food.protein === 0 && food.sodium === 0;
  if (!food.barcode || !hasNoNutrition) return food;
  try {
    const full = await lookupBarcode(food.barcode, signal);
    return full ?? food;
  } catch {
    return food;
  }
}
