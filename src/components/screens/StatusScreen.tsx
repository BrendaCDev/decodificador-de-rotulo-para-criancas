import { useMemo } from "react";
import { applyFoodToStats, type Character, type Food, type PlayerStats } from "@/lib/game-data";
import { CharacterCard } from "@/components/HUD";

export function StatusScreen({
  character, stats, food, onContinue, onBack, onScanMore,
}: {
  character: Character;
  stats: PlayerStats;
  food: Food;
  onContinue: (next: PlayerStats) => void;
  onBack: () => void;
  onScanMore: (next: PlayerStats) => void;
}) {
  const result = useMemo(() => applyFoodToStats(stats, food), [stats, food]);
  const scoreColors: Record<string, string> = { A: "neon-green", B: "neon-cyan", C: "neon-yellow", D: "accent", E: "destructive" };
  const ecoColors: Record<string, string> = { A: "neon-green", B: "neon-cyan", C: "neon-yellow", D: "accent", E: "destructive", "?": "muted-foreground" };
  const ecoLabels: Record<string, string> = { A: "Impacto muito baixo", B: "Impacto baixo", C: "Impacto moderado", D: "Impacto alto", E: "Impacto muito alto", "?": "Sem dados ambientais" };
  const eco = food.ecoScore ?? "?";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-xl text-neon-cyan neon-glow">📜 Análise do Rótulo 📜</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="pixel-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-6xl float-y">{food.emoji}</div>
            <div>
              <div className="font-display text-sm">{food.name}</div>
              <div className="text-xs opacity-60">Código: {food.barcode}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="font-display text-xs">NUTRI-SCORE:</div>
              <div className="font-display text-3xl px-4 py-2 border-4 border-foreground" style={{ background: `var(--color-${scoreColors[food.score]})`, color: "oklch(0.15 0.05 290)" }}>
                {food.score}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-display text-xs">🌱 ECO-SCORE:</div>
              <div className="font-display text-3xl px-4 py-2 border-4 border-foreground" style={{ background: `var(--color-${ecoColors[eco]})`, color: "oklch(0.15 0.05 290)" }}>
                {eco}
              </div>
            </div>
          </div>
          <div className="text-[10px] opacity-70 font-display">🌍 {ecoLabels[eco]}</div>
          <div className="text-xs opacity-60 font-display">VALORES POR 100g</div>
          <div className="grid grid-cols-2 gap-2 font-body text-base">
            <div>🍬 Açúcar: <b>{food.sugar > 0 ? `${food.sugar}g` : "n/d"}</b></div>
            <div>🧂 Sódio: <b>{food.sodium > 0 ? `${food.sodium}mg` : "n/d"}</b></div>
            <div>🧈 Gordura: <b>{food.fat > 0 ? `${food.fat}g` : "n/d"}</b></div>
            <div>🌾 Fibra: <b>{food.fiber > 0 ? `${food.fiber}g` : "n/d"}</b></div>
            <div>💪 Proteína: <b>{food.protein > 0 ? `${food.protein}g` : "n/d"}</b></div>
          </div>
          <div className="pixel-border bg-background/70 p-3 text-center font-display text-xs pop-in space-y-1">
            <div>{result.message}</div>
            <div style={{ color: `var(--color-${ecoColors[eco]})` }}>{result.ecoMessage}</div>
          </div>
          <div className="text-[10px] opacity-50 text-center">Fonte: Open Food Facts</div>
        </div>

        <div className="space-y-4">
          <CharacterCard char={character} stats={result.stats} />
          <div className="pixel-border bg-card p-4 space-y-2">
            <div className="font-display text-xs text-accent">EFEITOS TOTAIS</div>
            <ul className="font-body text-base space-y-1">
              <li>❤️ HP: <span className={result.delta.hp >= 0 ? "text-neon-green" : "text-destructive"}>{result.delta.hp >= 0 ? "+" : ""}{result.delta.hp}</span></li>
              <li>⚔️ ATK: <span className={result.delta.atk >= 0 ? "text-neon-green" : "text-destructive"}>{result.delta.atk >= 0 ? "+" : ""}{result.delta.atk}</span></li>
              <li>🛡️ DEF: <span className={result.delta.def >= 0 ? "text-neon-green" : "text-destructive"}>{result.delta.def >= 0 ? "+" : ""}{result.delta.def}</span></li>
              <li>⭐ XP: <span className={result.delta.xp >= 0 ? "text-accent" : "text-destructive"}>{result.delta.xp >= 0 ? "+" : ""}{result.delta.xp}</span></li>
            </ul>
            <div className="pt-2 border-t-2 border-border/60 space-y-1 text-xs font-body opacity-90">
              <div className="font-display text-[10px] text-neon-green">🌱 BÔNUS ECO ({eco})</div>
              <div>❤️ HP: <span className={result.ecoDelta.hp >= 0 ? "text-neon-green" : "text-destructive"}>{result.ecoDelta.hp >= 0 ? "+" : ""}{result.ecoDelta.hp}</span> · ⭐ XP: <span className={result.ecoDelta.xp >= 0 ? "text-accent" : "text-destructive"}>{result.ecoDelta.xp >= 0 ? "+" : ""}{result.ecoDelta.xp}</span></div>
              <div className="text-[10px] opacity-70">Impacto ambiental também afeta seu personagem.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
        <button className="pixel-btn secondary" onClick={onBack}>← Voltar</button>
        <button className="pixel-btn" onClick={() => onScanMore(result.stats)}>📷 Escanear outro alimento</button>
        <button className="pixel-btn accent" onClick={() => onContinue(result.stats)}>⚔️ Ir para batalha!</button>
      </div>
    </div>
  );
}
