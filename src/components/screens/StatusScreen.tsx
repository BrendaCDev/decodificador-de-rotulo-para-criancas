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
          <div className="flex items-center gap-3">
            <div className="font-display text-xs">NUTRI-SCORE:</div>
            <div className="font-display text-3xl px-4 py-2 border-4 border-foreground" style={{ background: `var(--color-${scoreColors[food.score]})`, color: "oklch(0.15 0.05 290)" }}>
              {food.score}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 font-body text-base">
            <div>🍬 Açúcar: <b>{food.sugar}g</b></div>
            <div>🧂 Sódio: <b>{food.sodium}mg</b></div>
            <div>🧈 Gordura: <b>{food.fat}g</b></div>
            <div>🌾 Fibra: <b>{food.fiber}g</b></div>
            <div>💪 Proteína: <b>{food.protein}g</b></div>
          </div>
          <div className="pixel-border bg-background/70 p-3 text-center font-display text-xs pop-in">
            {result.message}
          </div>
        </div>

        <div className="space-y-4">
          <CharacterCard char={character} stats={result.stats} />
          <div className="pixel-border bg-card p-4 space-y-2">
            <div className="font-display text-xs text-accent">EFEITOS</div>
            <ul className="font-body text-base space-y-1">
              <li>❤️ HP: <span className={result.delta.hp >= 0 ? "text-neon-green" : "text-destructive"}>{result.delta.hp >= 0 ? "+" : ""}{result.delta.hp}</span></li>
              <li>⚔️ ATK: <span className={result.delta.atk >= 0 ? "text-neon-green" : "text-destructive"}>{result.delta.atk >= 0 ? "+" : ""}{result.delta.atk}</span></li>
              <li>🛡️ DEF: <span className={result.delta.def >= 0 ? "text-neon-green" : "text-destructive"}>{result.delta.def >= 0 ? "+" : ""}{result.delta.def}</span></li>
              <li>⭐ XP: <span className="text-accent">+{result.delta.xp}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className="pixel-btn secondary" onClick={onBack}>← Outro alimento</button>
        <button className="pixel-btn accent" onClick={() => onContinue(result.stats)}>⚔️ Ir para batalha!</button>
      </div>
    </div>
  );
}
