export type NutriScore = "A" | "B" | "C" | "D" | "E";

export interface Food {
  barcode: string;
  name: string;
  emoji: string;
  score: NutriScore;
  sugar: number; // g/100g
  sodium: number; // mg/100g
  fat: number; // g/100g
  fiber: number;
  protein: number;
}

export const FOODS: Food[] = [
  { barcode: "7891000100103", name: "Maçã Fresca", emoji: "🍎", score: "A", sugar: 10, sodium: 1, fat: 0.2, fiber: 2.4, protein: 0.3 },
  { barcode: "7891000100110", name: "Brócolis", emoji: "🥦", score: "A", sugar: 1.7, sodium: 33, fat: 0.4, fiber: 2.6, protein: 2.8 },
  { barcode: "7891000100127", name: "Aveia Integral", emoji: "🌾", score: "A", sugar: 1, sodium: 2, fat: 7, fiber: 10, protein: 13 },
  { barcode: "7891000100134", name: "Iogurte Natural", emoji: "🥛", score: "B", sugar: 4.7, sodium: 50, fat: 3.3, fiber: 0, protein: 3.5 },
  { barcode: "7891000100141", name: "Pão Integral", emoji: "🍞", score: "B", sugar: 4, sodium: 380, fat: 3, fiber: 6, protein: 9 },
  { barcode: "7891000100158", name: "Queijo Amarelo", emoji: "🧀", score: "C", sugar: 1, sodium: 600, fat: 27, fiber: 0, protein: 25 },
  { barcode: "7891000100165", name: "Suco de Caixinha", emoji: "🧃", score: "D", sugar: 22, sodium: 15, fat: 0, fiber: 0.2, protein: 0.5 },
  { barcode: "7891000100172", name: "Biscoito Recheado", emoji: "🍪", score: "E", sugar: 38, sodium: 320, fat: 20, fiber: 1.5, protein: 5 },
  { barcode: "7891000100189", name: "Refrigerante Cola", emoji: "🥤", score: "E", sugar: 40, sodium: 12, fat: 0, fiber: 0, protein: 0 },
  { barcode: "7891000100196", name: "Salgadinho de Milho", emoji: "🌽", score: "E", sugar: 3, sodium: 980, fat: 32, fiber: 2, protein: 6 },
  { barcode: "7891000100202", name: "Chocolate ao Leite", emoji: "🍫", score: "E", sugar: 52, sodium: 80, fat: 30, fiber: 2, protein: 7 },
  { barcode: "7891000100219", name: "Banana", emoji: "🍌", score: "A", sugar: 12, sodium: 1, fat: 0.3, fiber: 2.6, protein: 1.1 },
  { barcode: "7891000100226", name: "Ovo Caipira", emoji: "🥚", score: "A", sugar: 0, sodium: 142, fat: 11, fiber: 0, protein: 13 },
  { barcode: "7891000100233", name: "Cereal Açucarado", emoji: "🥣", score: "D", sugar: 30, sodium: 450, fat: 4, fiber: 3, protein: 6 },
];

export interface Character {
  id: string;
  name: string;
  group: string;
  emoji: string;
  color: string;
  baseHP: number;
  baseATK: number;
  baseDEF: number;
  description: string;
}

export const CHARACTERS: Character[] = [
  { id: "carbo", name: "Karbo, o Veloz", group: "Carboidratos", emoji: "🏃", color: "neon-yellow", baseHP: 100, baseATK: 14, baseDEF: 8, description: "Energia rápida! Ataca primeiro e corre como um raio." },
  { id: "prot", name: "Protea, a Forte", group: "Proteínas", emoji: "💪", color: "neon-pink", baseHP: 120, baseATK: 18, baseDEF: 10, description: "Músculos de aço! Constrói defesa e ataque pesado." },
  { id: "lipid", name: "Lipídio, o Bravo", group: "Gorduras", emoji: "🛡️", color: "neon-purple", baseHP: 140, baseATK: 12, baseDEF: 14, description: "Reservas de energia. Tanque resistente." },
  { id: "vit", name: "Vitara, a Sábia", group: "Vitaminas", emoji: "✨", color: "neon-cyan", baseHP: 95, baseATK: 16, baseDEF: 9, description: "Magia pura! Cura aliados e amplifica buffs." },
  { id: "min", name: "Mineral, o Sólido", group: "Minerais", emoji: "⛰️", color: "neon-green", baseHP: 130, baseATK: 13, baseDEF: 13, description: "Ossos de granito. Equilíbrio perfeito." },
];

export interface Villain {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  atk: number;
  def: number;
  isBoss?: boolean;
  taunt: string;
}

export const VILLAINS: Villain[] = [
  { id: "diab", name: "Diabetex", emoji: "🍬", hp: 60, atk: 12, def: 5, taunt: "Açúcar nas veias!" },
  { id: "cardio", name: "Cardios", emoji: "💔", hp: 80, atk: 14, def: 7, taunt: "Seu coração é meu!" },
  { id: "cancer", name: "Mutagor", emoji: "☢️", hp: 90, atk: 16, def: 8, taunt: "Células corrompidas..." },
  { id: "mental", name: "Sombria", emoji: "🌑", hp: 75, atk: 18, def: 6, taunt: "Sem energia, sem alegria." },
  { id: "obes", name: "Obesidus, o Devorador", emoji: "👹", hp: 180, atk: 22, def: 14, isBoss: true, taunt: "EU SOU O CHEFÃO FINAL!" },
];

export interface PlayerStats {
  hp: number;
  maxHP: number;
  atk: number;
  def: number;
  xp: number;
}

export function applyFoodToStats(stats: PlayerStats, food: Food): { stats: PlayerStats; delta: { hp: number; atk: number; def: number; xp: number }; message: string } {
  const scoreMap: Record<NutriScore, { hp: number; atk: number; def: number; xp: number }> = {
    A: { hp: 15, atk: 3, def: 3, xp: 50 },
    B: { hp: 8, atk: 2, def: 2, xp: 30 },
    C: { hp: 0, atk: 0, def: 0, xp: 10 },
    D: { hp: -10, atk: -1, def: -1, xp: 5 },
    E: { hp: -20, atk: -2, def: -2, xp: 0 },
  };
  const d = scoreMap[food.score];
  const newStats: PlayerStats = {
    maxHP: stats.maxHP + Math.max(0, d.hp),
    hp: Math.max(1, Math.min(stats.maxHP + Math.max(0, d.hp), stats.hp + d.hp)),
    atk: Math.max(5, stats.atk + d.atk),
    def: Math.max(2, stats.def + d.def),
    xp: stats.xp + d.xp,
  };
  const messages: Record<NutriScore, string> = {
    A: "⚡ BUFF MÁXIMO! Poder lendário ativado!",
    B: "✨ Buff aplicado! Você ficou mais forte.",
    C: "😐 Neutro. Sem grandes efeitos.",
    D: "⚠️ Debuff! Cuidado com o excesso.",
    E: "💀 DEBUFF CRÍTICO! Veneno ultraprocessado!",
  };
  return { stats: newStats, delta: d, message: messages[food.score] };
}
