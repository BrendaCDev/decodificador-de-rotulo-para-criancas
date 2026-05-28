## Objetivo
Fazer o Eco-Score (impacto ambiental) também modificar HP e XP do personagem, somando-se ao efeito do Nutri-Score quando um alimento é consumido.

## Mudanças

### 1. `src/lib/game-data.ts`
- Adicionar mapa `ecoScoreMap` com bônus/penalidades por grau:
  - A: +10 HP, +20 XP (eco-herói)
  - B: +5 HP, +10 XP
  - C: 0/0 (neutro)
  - D: -5 HP, -5 XP
  - E: -10 HP, -10 XP
  - "?": 0/0 (desconhecido)
- Atualizar `applyFoodToStats()` para somar o delta do Eco-Score ao delta do Nutri-Score (HP, maxHP, XP). ATK/DEF continuam só pelo Nutri-Score.
- Estender a mensagem retornada com uma segunda linha indicando o efeito ambiental (ex.: "🌱 Eco A: +10 HP bônus verde!" / "🌍 Eco E: -10 HP impacto ambiental severo!").
- Expor `delta` já incluindo a contribuição do eco para uso visual.

### 2. `src/components/screens/StatusScreen.tsx`
- Mostrar uma linha extra abaixo do efeito do Nutri-Score com o efeito do Eco-Score (HP/XP aplicados), com cor correspondente ao grau eco.
- Texto curto explicando: "Impacto ambiental também afeta seu personagem".

### 3. `src/components/screens/BattleScreen.tsx`
- Sem mudanças de lógica de combate (os stats já entram aplicados via `applyFoodToStats`), mas:
  - No início da batalha, se `food.ecoScore` foi A/B, mostrar no log: "🌱 Bônus ecológico ativo!". Se D/E: "🌍 Penalidade ambiental aplicada."
  - Isso requer passar o último `food` ou seu ecoScore para o BattleScreen como prop opcional.

### 4. `src/routes/index.tsx`
- Passar `lastFood` (ou só `ecoScore`) para o BattleScreen para a mensagem inicial.

## Observações
- Eco-Score "?" não altera nada (evita punir alimentos sem dados).
- Mudanças isoladas em frontend/dados; sem backend.
