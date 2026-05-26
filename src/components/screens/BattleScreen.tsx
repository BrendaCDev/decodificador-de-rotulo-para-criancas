import { useEffect, useRef, useState } from "react";
import { VILLAINS, type Character, type PlayerStats, type Villain } from "@/lib/game-data";
import { StatBar } from "@/components/HUD";
import { HERO_SPRITES, VILLAIN_SPRITES } from "@/lib/sprites";

type Phase = "idle" | "player" | "enemy" | "won" | "lost";
type FloatNum = { id: number; value: number; kind: "dmg" | "heal" | "xp"; side: "player" | "enemy" };

export function BattleScreen({
  character, stats, onFinish,
}: {
  character: Character;
  stats: PlayerStats;
  onFinish: (won: boolean) => void;
}) {
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [enemyHP, setEnemyHP] = useState(VILLAINS[0].hp);
  const [enemyPrevHP, setEnemyPrevHP] = useState(VILLAINS[0].hp);
  const [pHP, setPHP] = useState(stats.hp);
  const [pPrevHP, setPPrevHP] = useState(stats.hp);
  const [xp, setXp] = useState(stats.xp);
  const [log, setLog] = useState<string[]>([`Um ${VILLAINS[0].name} selvagem apareceu! "${VILLAINS[0].taunt}"`]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [playerAnim, setPlayerAnim] = useState<string>("");
  const [enemyAnim, setEnemyAnim] = useState<string>("");
  const [slashOn, setSlashOn] = useState<"player" | "enemy" | null>(null);
  const [floats, setFloats] = useState<FloatNum[]>([]);
  const floatId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);

  const enemy: Villain = VILLAINS[enemyIdx];
  const heroSprite = HERO_SPRITES[character.id];
  const enemySprite = VILLAIN_SPRITES[enemy.id];

  useEffect(() => {
    logRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [log]);

  function push(msg: string) { setLog((l) => [...l.slice(-30), msg]); }

  function spawnFloat(value: number, kind: FloatNum["kind"], side: FloatNum["side"]) {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, value, kind, side }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1200);
  }

  function playerAction(kind: "attack" | "defend" | "special") {
    if (phase !== "idle") return;
    setPhase("player");

    if (kind === "defend") {
      setPlayerAnim("heal-glow");
      setTimeout(() => setPlayerAnim(""), 700);
      push(`🛡️ ${character.name} se defende, reduzindo o próximo dano.`);
      setTimeout(() => enemyTurn(true), 700);
      return;
    }

    setPlayerAnim("lunge-right");
    setTimeout(() => setPlayerAnim(""), 500);

    setTimeout(() => {
      let dmg = 0; let msg = "";
      if (kind === "attack") {
        dmg = Math.max(1, stats.atk - Math.floor(enemy.def / 2) + Math.floor(Math.random() * 5));
        msg = `${character.name} ataca causando ${dmg} de dano!`;
      } else {
        dmg = Math.max(2, Math.floor(stats.atk * 1.6) - enemy.def + Math.floor(Math.random() * 8));
        msg = `💥 ${character.name} usa GOLPE NUTRITIVO! ${dmg} crítico!`;
      }
      setSlashOn("enemy");
      setEnemyAnim("hit-flash");
      spawnFloat(dmg, "dmg", "enemy");
      setTimeout(() => { setSlashOn(null); setEnemyAnim(""); }, 450);
      push(msg);
      setEnemyPrevHP(enemyHP);
      const newE = Math.max(0, enemyHP - dmg);
      setEnemyHP(newE);

      setTimeout(() => {
        if (newE <= 0) {
          setEnemyAnim("defeated");
          const xpGain = 25 + (enemy.isBoss ? 100 : 0);
          spawnFloat(xpGain, "xp", "enemy");
          setXp((x) => x + xpGain);
          push(`✨ ${enemy.name} foi derrotado! +${xpGain} XP`);
          if (enemyIdx === VILLAINS.length - 1) {
            setTimeout(() => setPhase("won"), 900);
            return;
          }
          const next = enemyIdx + 1;
          setTimeout(() => {
            setEnemyIdx(next);
            setEnemyHP(VILLAINS[next].hp);
            setEnemyPrevHP(VILLAINS[next].hp);
            setEnemyAnim("");
            push(`⚠️ ${VILLAINS[next].name} entra na arena! "${VILLAINS[next].taunt}"`);
            setPhase("idle");
          }, 1100);
          return;
        }
        enemyTurn(false);
      }, 650);
    }, 250);
  }

  function enemyTurn(defended: boolean) {
    setPhase("enemy");
    setTimeout(() => {
      setEnemyAnim("lunge-left");
      setTimeout(() => setEnemyAnim(""), 500);

      setTimeout(() => {
        const defReduce = defended ? stats.def : Math.floor(stats.def / 2);
        const incoming = Math.max(1, enemy.atk - defReduce + Math.floor(Math.random() * 4));
        setSlashOn("player");
        setPlayerAnim("hit-flash");
        spawnFloat(incoming, "dmg", "player");
        setTimeout(() => { setSlashOn(null); setPlayerAnim(""); }, 450);
        push(`${enemy.name} contra-ataca causando ${incoming} de dano!`);
        setPPrevHP(pHP);
        const np = Math.max(0, pHP - incoming);
        setPHP(np);
        if (np <= 0) {
          setTimeout(() => {
            setPlayerAnim("defeated");
            push(`💀 ${character.name} foi derrotado...`);
            setTimeout(() => setPhase("lost"), 900);
          }, 500);
          return;
        }
        setPhase("idle");
      }, 250);
    }, 400);
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

  const floatColor = (k: FloatNum["kind"]) =>
    k === "dmg" ? "text-destructive" : k === "heal" ? "text-neon-green" : "text-accent";

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="font-display text-lg text-neon-pink neon-glow">⚔️ ARENA DA SAÚDE ⚔️</h2>
        {enemy.isBoss && <div className="font-display text-xs text-destructive neon-glow mt-1">👑 BOSS FINAL 👑</div>}
      </div>

      <div className="pixel-border arena-bg p-5 relative overflow-hidden min-h-[280px]">
        <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />

        <div className="grid grid-cols-2 gap-4 items-end relative h-[240px]">
          <div className="relative h-full flex flex-col items-center justify-end">
            <div className="relative w-40 h-40 flex items-end justify-center">
              {floats.filter((f) => f.side === "player").map((f) => (
                <div key={f.id} className={`damage-float ${floatColor(f.kind)}`}>
                  {f.kind === "dmg" ? `-${f.value}` : f.kind === "xp" ? `+${f.value} XP` : `+${f.value}`}
                </div>
              ))}
              {slashOn === "player" && <div className="slash-fx" />}
              <img
                src={heroSprite}
                alt={character.name}
                width={160}
                height={160}
                loading="lazy"
                className={`sprite w-40 h-40 object-contain ${playerAnim} ${!playerAnim ? "float-y" : ""}`}
              />
            </div>
            <div className="font-display text-xs mt-1" style={{ color: `var(--color-${character.color})` }}>{character.name}</div>
          </div>

          <div className="relative h-full flex flex-col items-center justify-end">
            <div className="relative w-44 h-44 flex items-end justify-center">
              {floats.filter((f) => f.side === "enemy").map((f) => (
                <div key={f.id} className={`damage-float ${floatColor(f.kind)}`}>
                  {f.kind === "dmg" ? `-${f.value}` : f.kind === "xp" ? `+${f.value} XP` : `+${f.value}`}
                </div>
              ))}
              {slashOn === "enemy" && <div className="slash-fx" />}
              <img
                src={enemySprite}
                alt={enemy.name}
                width={enemy.isBoss ? 176 : 160}
                height={enemy.isBoss ? 176 : 160}
                loading="lazy"
                className={`sprite object-contain ${enemy.isBoss ? "w-44 h-44" : "w-40 h-40"} ${enemyAnim} ${!enemyAnim ? "float-y" : ""} ${enemy.isBoss ? "drop-shadow-[0_0_20px_var(--color-destructive)]" : ""}`}
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
            <div className={`font-display text-xs mt-1 ${enemy.isBoss ? "text-destructive neon-glow" : ""}`}>
              {enemy.isBoss ? "👑 " : ""}{enemy.name}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="pixel-border bg-card p-4 space-y-2">
          <div className="font-display text-xs">{character.name}</div>
          <StatBar label="HP" value={pHP} max={stats.maxHP} color="neon-green" prevValue={pPrevHP} />
          <StatBar label="XP" value={xp} max={Math.max(100, stats.maxHP * 2)} color="neon-yellow" />
          <div className="flex gap-3 text-xs font-display opacity-80">
            <span>ATK {stats.atk}</span><span>DEF {stats.def}</span>
          </div>
        </div>
        <div className="pixel-border bg-card p-4 space-y-2">
          <div className="font-display text-xs text-destructive">{enemy.name}</div>
          <StatBar label="HP" value={enemyHP} max={enemy.hp} color="neon-pink" prevValue={enemyPrevHP} />
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
