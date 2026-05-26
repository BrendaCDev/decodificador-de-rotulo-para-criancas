import { useEffect, useRef, useState } from "react";
import { VILLAINS, type Character, type PlayerStats, type Villain } from "@/lib/game-data";
import { StatBar } from "@/components/HUD";

type Phase = "idle" | "player" | "enemy" | "won" | "lost";

export function BattleScreen({
  character, stats, onFinish,
}: {
  character: Character;
  stats: PlayerStats;
  onFinish: (won: boolean) => void;
}) {
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [enemyHP, setEnemyHP] = useState(VILLAINS[0].hp);
  const [pHP, setPHP] = useState(stats.hp);
  const [log, setLog] = useState<string[]>([`Um ${VILLAINS[0].name} selvagem apareceu! "${VILLAINS[0].taunt}"`]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const enemy: Villain = VILLAINS[enemyIdx];

  useEffect(() => {
    logRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [log]);

  function push(msg: string) { setLog((l) => [...l, msg]); }

  function playerAction(kind: "attack" | "defend" | "special") {
    if (phase !== "idle") return;
    setPhase("player");
    let dmg = 0; let msg = "";
    if (kind === "attack") {
      dmg = Math.max(1, stats.atk - Math.floor(enemy.def / 2) + Math.floor(Math.random() * 5));
      msg = `${character.name} ataca causando ${dmg} de dano!`;
    } else if (kind === "special") {
      dmg = Math.max(2, Math.floor(stats.atk * 1.6) - enemy.def + Math.floor(Math.random() * 8));
      msg = `💥 ${character.name} usa GOLPE NUTRITIVO! ${dmg} de dano crítico!`;
    } else {
      msg = `🛡️ ${character.name} se defende, reduzindo o próximo dano.`;
    }
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 400);
    push(msg);
    const newE = Math.max(0, enemyHP - dmg);
    setEnemyHP(newE);

    setTimeout(() => {
      if (newE <= 0) {
        push(`✨ ${enemy.name} foi derrotado!`);
        if (enemyIdx === VILLAINS.length - 1) { setPhase("won"); return; }
        const next = enemyIdx + 1;
        setTimeout(() => {
          setEnemyIdx(next);
          setEnemyHP(VILLAINS[next].hp);
          push(`⚠️ ${VILLAINS[next].name} entra na arena! "${VILLAINS[next].taunt}"`);
          setPhase("idle");
        }, 900);
        return;
      }
      // enemy turn
      setPhase("enemy");
      const defReduce = kind === "defend" ? stats.def : Math.floor(stats.def / 2);
      const incoming = Math.max(1, enemy.atk - defReduce + Math.floor(Math.random() * 4));
      setTimeout(() => {
        setShakePlayer(true);
        setTimeout(() => setShakePlayer(false), 400);
        push(`${enemy.name} contra-ataca causando ${incoming} de dano!`);
        const np = Math.max(0, pHP - incoming);
        setPHP(np);
        if (np <= 0) { setPhase("lost"); push(`💀 ${character.name} foi derrotado...`); return; }
        setPhase("idle");
      }, 700);
    }, 600);
  }

  if (phase === "won") {
    return (
      <div className="text-center space-y-6 pop-in">
        <div className="text-7xl">🏆</div>
        <h2 className="font-display text-2xl text-accent neon-glow">VITÓRIA LENDÁRIA!</h2>
        <p className="opacity-80 font-body text-xl">Você derrotou Obesidus e protegeu o Reino da Saúde!</p>
        <button className="pixel-btn accent" onClick={() => onFinish(true)}>Jogar novamente</button>
      </div>
    );
  }
  if (phase === "lost") {
    return (
      <div className="text-center space-y-6 pop-in">
        <div className="text-7xl">💀</div>
        <h2 className="font-display text-2xl text-destructive neon-glow">GAME OVER</h2>
        <p className="opacity-80 font-body text-xl">Coma alimentos melhores e tente de novo!</p>
        <button className="pixel-btn" onClick={() => onFinish(false)}>Tentar outro item</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="font-display text-lg text-neon-pink neon-glow">⚔️ ARENA DA SAÚDE ⚔️</h2>
      </div>

      <div className="pixel-border bg-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
        <div className="grid grid-cols-2 gap-4 items-end min-h-[180px] relative">
          <div className={`text-center space-y-2 ${shakePlayer ? "shake" : ""}`}>
            <div className="text-7xl float-y">{character.emoji}</div>
            <div className="font-display text-xs">{character.name}</div>
          </div>
          <div className={`text-center space-y-2 ${shakeEnemy ? "shake" : ""}`}>
            <div className={`text-7xl ${enemy.isBoss ? "drop-shadow-[0_0_20px_var(--color-destructive)]" : ""}`}>{enemy.emoji}</div>
            <div className={`font-display text-xs ${enemy.isBoss ? "text-destructive neon-glow" : ""}`}>
              {enemy.isBoss ? "👑 " : ""}{enemy.name}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="pixel-border bg-card p-4 space-y-2">
          <div className="font-display text-xs">{character.name}</div>
          <StatBar label="HP" value={pHP} max={stats.maxHP} color="neon-green" />
          <div className="flex gap-3 text-xs font-display opacity-80">
            <span>ATK {stats.atk}</span><span>DEF {stats.def}</span>
          </div>
        </div>
        <div className="pixel-border bg-card p-4 space-y-2">
          <div className="font-display text-xs text-destructive">{enemy.name}</div>
          <StatBar label="HP" value={enemyHP} max={enemy.hp} color="neon-pink" />
          <div className="flex gap-3 text-xs font-display opacity-80">
            <span>ATK {enemy.atk}</span><span>DEF {enemy.def}</span>
          </div>
        </div>
      </div>

      <div ref={logRef} className="pixel-border bg-background/80 p-3 h-32 overflow-y-auto font-body text-base space-y-1">
        {log.map((l, i) => <div key={i}>▶ {l}</div>)}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button className="pixel-btn" disabled={phase !== "idle"} onClick={() => playerAction("attack")}>⚔️ Atacar</button>
        <button className="pixel-btn accent" disabled={phase !== "idle"} onClick={() => playerAction("special")}>💥 Especial</button>
        <button className="pixel-btn secondary" disabled={phase !== "idle"} onClick={() => playerAction("defend")}>🛡️ Defender</button>
      </div>
    </div>
  );
}
