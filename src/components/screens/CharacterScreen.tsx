import { CHARACTERS, type Character } from "@/lib/game-data";
import { HERO_SPRITES } from "@/lib/sprites";

export function CharacterScreen({ onPick }: { onPick: (c: Character) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-xl text-neon-pink neon-glow">🎮 Escolha seu Herói 🎮</h2>
        <p className="opacity-80">Cada classe representa um grupo nutricional. Escolha com sabedoria!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c)}
            className="pixel-border bg-card p-5 text-left space-y-3 hover:scale-[1.03] transition-transform"
          >
            <div className="flex justify-center h-32 items-center">
              <img
                src={HERO_SPRITES[c.id]}
                alt={c.name}
                width={128}
                height={128}
                loading="lazy"
                className="sprite w-32 h-32 object-contain float-y drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div className="font-display text-sm text-center" style={{ color: `var(--color-${c.color})` }}>
              {c.name}
            </div>
            <div className="text-center font-display text-xs opacity-70">{c.group}</div>
            <p className="text-sm opacity-80 min-h-[3rem]">{c.description}</p>
            <div className="grid grid-cols-3 gap-1 font-display text-xs text-center">
              <div className="border-2 border-border p-1"><div className="opacity-60">HP</div><div className="text-neon-green">{c.baseHP}</div></div>
              <div className="border-2 border-border p-1"><div className="opacity-60">ATK</div><div className="text-neon-pink">{c.baseATK}</div></div>
              <div className="border-2 border-border p-1"><div className="opacity-60">DEF</div><div className="text-neon-cyan">{c.baseDEF}</div></div>
            </div>
            <div className="pixel-btn w-full text-center">Selecionar</div>
          </button>
        ))}
      </div>
    </div>
  );
}
