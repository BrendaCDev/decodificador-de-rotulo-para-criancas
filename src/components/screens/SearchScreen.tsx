import { useEffect, useRef, useState } from "react";
import { FOODS, type Food } from "@/lib/game-data";
import { enrichFood, lookupBarcode, searchFoodsByName } from "@/lib/openfoodfacts";

export function SearchScreen({ onPick }: { onPick: (food: Food) => void }) {
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Food[]>(FOODS.slice(0, 6));
  const abortRef = useRef<AbortController | null>(null);

  // Debounced live search via Open Food Facts
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(FOODS.slice(0, 6));
      setLoading(false);
      setError(null);
      abortRef.current?.abort();
      return;
    }
    setLoading(true);
    setError(null);
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const list = await searchFoodsByName(q, ctrl.signal);
        if (ctrl.signal.aborted) return;
        // Mix local mocks that match as fallback
        const local = FOODS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
        const merged = [...list, ...local].slice(0, 24);
        setResults(merged);
        if (merged.length === 0) setError("Nenhum produto encontrado.");
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError("Falha ao consultar o banco da Guilda. Tente de novo.");
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [query]);

  async function simulateScan() {
    setScanning(true);
    // Pick a random known barcode from the local mocks to simulate a real scan
    const sample = FOODS[Math.floor(Math.random() * FOODS.length)];
    try {
      const found = await lookupBarcode(sample.barcode);
      setTimeout(() => {
        setScanning(false);
        onPick(found ?? sample);
      }, 1200);
    } catch {
      setTimeout(() => {
        setScanning(false);
        onPick(sample);
      }, 1200);
    }
  }

  async function doLookupBarcode() {
    const code = barcode.trim();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const found = await lookupBarcode(code);
      if (found) {
        onPick(found);
      } else {
        const local = FOODS.find((x) => x.barcode === code);
        if (local) onPick(local);
        else setError("Código não encontrado no banco da Guilda!");
      }
    } catch {
      setError("Falha ao consultar a API. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-xl text-accent neon-glow">⚔️ Posto da Guilda ⚔️</h2>
        <p className="opacity-80">Escaneie um item para descobrir seus efeitos no seu herói.</p>
      </div>

      <div className="pixel-border bg-card p-5 space-y-4">
        <div className={`relative h-44 border-4 border-dashed border-accent bg-background/70 flex items-center justify-center overflow-hidden ${scanning ? "shake" : ""}`}>
          {scanning ? (
            <>
              <div className="absolute inset-x-0 h-1 bg-neon-pink shadow-[0_0_20px_var(--color-neon-pink)]" style={{ animation: "scan 1.6s linear" }} />
              <div className="font-display text-xs text-neon-cyan crt-flicker">ESCANEANDO...</div>
            </>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-5xl">📷</div>
              <div className="font-display text-xs opacity-70">CÂMERA DO HERÓI</div>
            </div>
          )}
          <style>{`@keyframes scan { 0%{top:0} 100%{top:100%} }`}</style>
        </div>
        <button className="pixel-btn w-full" onClick={simulateScan} disabled={scanning}>
          📸 Escanear código de barras
        </button>
      </div>

      <div className="pixel-border bg-card p-5 space-y-3">
        <label className="font-display text-xs">Digitar código de barras (Open Food Facts)</label>
        <div className="flex gap-2">
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => { if (e.key === "Enter") doLookupBarcode(); }}
            placeholder="Ex: 7622210449283"
            className="flex-1 px-3 py-2 bg-input border-2 border-border font-body text-lg"
            inputMode="numeric"
          />
          <button className="pixel-btn secondary" onClick={doLookupBarcode} disabled={loading}>
            {loading ? "..." : "Buscar"}
          </button>
        </div>
      </div>

      <div className="pixel-border bg-card p-5 space-y-3">
        <label className="font-display text-xs">Pesquisar por nome (tempo real)</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: nutella, biscoito, maçã..."
          className="w-full px-3 py-2 bg-input border-2 border-border font-body text-lg"
        />
        <div className="flex items-center justify-between text-xs opacity-70 font-display">
          <span>{loading ? "🔎 Buscando na API..." : `${results.length} resultado(s)`}</span>
          {error && <span className="text-destructive">{error}</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {results.map((f) => (
            <button
              key={`${f.barcode}-${f.name}`}
              onClick={async () => {
                setLoading(true);
                try {
                  const full = await enrichFood(f);
                  onPick(full);
                } finally {
                  setLoading(false);
                }
              }}
              className="pixel-border bg-background/60 p-3 hover:bg-primary/30 transition-colors text-left"
            >
              <div className="text-3xl">{f.emoji}</div>
              <div className="font-display text-xs mt-1 line-clamp-2 break-words">{f.name}</div>
              <div className="text-xs opacity-60">Nutri: <span className="text-accent font-display">{f.score}</span> · Eco: <span className="text-neon-green font-display">{f.ecoScore ?? "?"}</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
