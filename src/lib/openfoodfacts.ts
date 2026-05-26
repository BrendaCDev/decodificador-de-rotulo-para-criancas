import type { Food, NutriScore } from "./game-data";

const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";

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

function toNutriScore(grade?: string): NutriScore {
  const g = (grade ?? "").toUpperCase();
  if (g === "A" || g === "B" || g === "C" || g === "D" || g === "E") return g;
  return "C";
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : fallback;
}

function productToFood(p: any): Food | null {
  if (!p) return null;
  const name: string = p.product_name || p.product_name_pt || p.generic_name || p.brands || "";
  if (!name.trim()) return null;
  const n = p.nutriments || {};
  const sodium_g = n["sodium_100g"];
  const salt_g = n["salt_100g"];
  const sodiumMg =
    sodium_g != null ? num(sodium_g) * 1000 :
    salt_g != null ? num(salt_g) * 400 : 0;
  return {
    barcode: String(p.code || p._id || ""),
    name: name.length > 60 ? name.slice(0, 60) + "…" : name,
    emoji: pickEmoji(name, p.categories),
    score: toNutriScore(p.nutriscore_grade || p.nutrition_grades),
    sugar: num(n["sugars_100g"]),
    sodium: Math.round(sodiumMg),
    fat: num(n["fat_100g"]),
    fiber: num(n["fiber_100g"]),
    protein: num(n["proteins_100g"]),
  };
}

export async function searchFoodsByName(query: string, signal?: AbortSignal): Promise<Food[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,product_name_pt,generic_name,brands,categories,nutriscore_grade,nutrition_grades,nutriments`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OFF search ${res.status}`);
  const data = await res.json();
  const products: any[] = Array.isArray(data.products) ? data.products : [];
  return products.map(productToFood).filter((f): f is Food => !!f && !!f.barcode);
}

export async function lookupBarcode(barcode: string, signal?: AbortSignal): Promise<Food | null> {
  const code = barcode.trim();
  if (!code) return null;
  const url = `${PRODUCT_URL}/${encodeURIComponent(code)}.json`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1) return null;
  return productToFood(data.product);
}
