import { useState } from "react";
import { FOODS, type Food } from "@/lib/game-data";

export function SearchScreen({ onPick }: { onPick: (food: Food) => void }) {
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);

  const results = query
    ? FOODS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : FOODS.slice(0, 6);

  function simulateScan() {
    setScanning(true);
    setTimeout(() => {
      const random = FOODS[Math.floor(Math.random() * FOODS.length)];
      setScanning(false);
      onPick(random);
    }, 1600);
  }

  function lookupBarcode() {
    const f = FOODS.find((x) => x.barcode === barcode.trim());
    if (f) onPick(f);
    else alert("Código não encontrado no banco da Guilda!");
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
        <label className="font-display text-xs">Digitar código de barras</label>
        <div className="flex gap-2">
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="7891000100103"
            className="flex-1 px-3 py-2 bg-input border-2 border-border font-body text-lg"
          />
          <button className="pixel-btn secondary" onClick={lookupBarcode}>Buscar</button>
        </div>
      </div>

      <div className="pixel-border bg-card p-5 space-y-3">
        <label className="font-display text-xs">Pesquisar por nome</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: maçã, biscoito..."
          className="w-full px-3 py-2 bg-input border-2 border-border font-body text-lg"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {results.map((f) => (
            <button
              key={f.barcode}
              onClick={() => onPick(f)}
              className="pixel-border bg-background/60 p-3 hover:bg-primary/30 transition-colors text-left"
            >
              <div className="text-3xl">{f.emoji}</div>
              <div className="font-display text-xs mt-1">{f.name}</div>
              <div className="text-xs opacity-60">Nutri-Score: <span className="text-accent font-display">{f.score}</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
