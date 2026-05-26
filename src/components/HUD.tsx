import type { Character, PlayerStats } from "@/lib/game-data";
import { HERO_SPRITES } from "@/lib/sprites";

export function StatBar({ label, value, max, color, prevValue }: { label: string; value: number; max: number; color: string; prevValue?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const prevPct = prevValue !== undefined ? Math.max(0, Math.min(100, (prevValue / max) * 100)) : pct;
  const showDamageGhost = prevValue !== undefined && prevValue > value;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-display">
        <span>{label}</span>
        <span>{Math.max(0, Math.round(value))}/{max}</span>
      </div>
      <div className="h-4 border-2 border-foreground/60 bg-background overflow-hidden relative">
        {showDamageGhost && (
          <div
            key={`ghost-${prevValue}`}
            className="absolute top-0 left-0 h-full bar-damage"
            style={{ width: `${prevPct}%` }}
          />
        )}
        <div
          className="h-full bar-fill relative"
          style={{ width: `${pct}%`, background: `var(--color-${color})` }}
        />
      </div>
    </div>
  );
}

export function CharacterCard({ char, stats, compact = false }: { char: Character; stats: PlayerStats; compact?: boolean }) {
  const sprite = HERO_SPRITES[char.id];
  return (
    <div className="pixel-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        {sprite ? (
          <img
            src={sprite}
            alt={char.name}
            width={64}
            height={64}
            loading="lazy"
            className={`sprite w-16 h-16 object-contain ${compact ? "" : "float-y"}`}
          />
        ) : (
          <div className={`text-5xl ${compact ? "" : "float-y"}`}>{char.emoji}</div>
        )}
        <div className="flex-1">
          <div className="font-display text-sm" style={{ color: `var(--color-${char.color})` }}>{char.name}</div>
          <div className="text-sm opacity-70">{char.group}</div>
        </div>
        <div className="font-display text-xs text-accent">XP {stats.xp}</div>
      </div>
      <StatBar label="HP" value={stats.hp} max={stats.maxHP} color="neon-green" />
      <div className="grid grid-cols-2 gap-2 font-display text-xs">
        <div className="border-2 border-border bg-background/50 p-2 text-center">
          <div className="opacity-60">ATK</div>
          <div className="text-neon-pink text-lg">{stats.atk}</div>
        </div>
        <div className="border-2 border-border bg-background/50 p-2 text-center">
          <div className="opacity-60">DEF</div>
          <div className="text-neon-cyan text-lg">{stats.def}</div>
        </div>
      </div>
    </div>
  );
}
