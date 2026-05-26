import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Character, Food, PlayerStats } from "@/lib/game-data";
import { SearchScreen } from "@/components/screens/SearchScreen";
import { CharacterScreen } from "@/components/screens/CharacterScreen";
import { StatusScreen } from "@/components/screens/StatusScreen";
import { BattleScreen } from "@/components/screens/BattleScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decodificador de Rótulo para Crianças — RPG da Nutrição" },
      { name: "description", content: "Transforme a ida ao mercado em uma aventura RPG. Escaneie rótulos, ganhe poderes e derrote vilões da má alimentação." },
      { property: "og:title", content: "Decodificador de Rótulo — RPG da Nutrição" },
      { property: "og:description", content: "Vire herói da alimentação saudável. Escaneie, evolua e batalhe!" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" },
    ],
  }),
  component: App,
});

type Step = "intro" | "character" | "search" | "status" | "battle";

function App() {
  const [step, setStep] = useState<Step>("intro");
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [food, setFood] = useState<Food | null>(null);

  function pickCharacter(c: Character) {
    setCharacter(c);
    setStats({ hp: c.baseHP, maxHP: c.baseHP, atk: c.baseATK, def: c.baseDEF, xp: 0 });
    setStep("search");
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <header className="max-w-5xl mx-auto mb-8 text-center space-y-2">
        <div className="font-display text-xs text-neon-cyan opacity-80">★ INSIRA UMA MOEDA ★</div>
        <h1 className="font-display text-2xl md:text-4xl text-neon-pink neon-glow leading-tight">
          DECODIFICADOR<br />DE RÓTULO
        </h1>
        <p className="font-body text-lg md:text-xl text-accent">— O RPG da Nutrição Infantil —</p>
      </header>

      <main className="max-w-5xl mx-auto">
        {step === "intro" && <Intro onStart={() => setStep("character")} />}
        {step === "character" && <CharacterScreen onPick={pickCharacter} />}
        {step === "search" && character && stats && (
          <div className="space-y-5">
            <PlayerStrip character={character} stats={stats} />
            <SearchScreen onPick={(f) => { setFood(f); setStep("status"); }} />
            <button className="pixel-btn secondary" onClick={() => setStep("character")}>← Trocar herói</button>
          </div>
        )}
        {step === "status" && character && stats && food && (
          <StatusScreen
            character={character} stats={stats} food={food}
            onBack={() => setStep("search")}
            onScanMore={(s) => { setStats(s); setFood(null); setStep("search"); }}
            onContinue={(s) => { setStats(s); setStep("battle"); }}
          />
        )}
        {step === "battle" && character && stats && (
          <BattleScreen character={character} stats={stats} onFinish={() => setStep("search")} />
        )}
      </main>

      <footer className="max-w-5xl mx-auto mt-12 text-center font-display text-[10px] opacity-50">
        © GUILDA DA NUTRIÇÃO · PRESS START PARA SE TORNAR HERÓI
      </footer>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-8 pop-in">
      <div className="pixel-border bg-card p-6 md:p-8 space-y-4 text-center">
        <div className="text-6xl">🥦⚔️🍎</div>
        <h2 className="font-display text-lg md:text-xl text-accent">A AVENTURA COMEÇA AGORA</h2>
        <p className="font-body text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          No Reino da Saúde, os vilões ultraprocessados ameaçam as crianças.
          Escolha seu herói, escaneie rótulos no mercado e transforme cada compra
          em uma batalha épica contra <b className="text-destructive">Diabetex</b>,
          <b className="text-destructive"> Cardios</b>, <b className="text-destructive">Mutagor</b>,
          <b className="text-destructive"> Sombria</b> — e o boss final <b className="text-destructive">Obesidus</b>.
        </p>
        <button className="pixel-btn accent text-base" onClick={onStart}>▶ PRESS START</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { i: "📷", t: "Escaneie", d: "Use a câmera ou digite o código de barras de qualquer produto." },
          { i: "⚡", t: "Evolua", d: "Alimentos saudáveis viram buffs. Ultraprocessados tiram HP." },
          { i: "👹", t: "Batalhe", d: "Enfrente vilões inspirados em doenças reais em RPG por turnos." },
        ].map((b) => (
          <div key={b.t} className="pixel-border bg-card p-4 text-center">
            <div className="text-4xl float-y">{b.i}</div>
            <div className="font-display text-sm text-neon-cyan mt-2">{b.t}</div>
            <p className="font-body text-base opacity-80 mt-1">{b.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerStrip({ character, stats }: { character: Character; stats: PlayerStats }) {
  const pct = (stats.hp / stats.maxHP) * 100;
  return (
    <div className="pixel-border bg-card p-3 flex items-center gap-4">
      <div className="text-3xl">{character.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-xs truncate" style={{ color: `var(--color-${character.color})` }}>{character.name}</div>
        <div className="h-3 border-2 border-foreground/60 bg-background mt-1 overflow-hidden">
          <div className="h-full bg-neon-green transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="font-display text-xs hidden sm:flex gap-3">
        <span>HP {stats.hp}/{stats.maxHP}</span>
        <span className="text-neon-pink">ATK {stats.atk}</span>
        <span className="text-neon-cyan">DEF {stats.def}</span>
        <span className="text-accent">XP {stats.xp}</span>
      </div>
    </div>
  );
}
