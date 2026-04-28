# Implementación de sistema de scoring para predicciones (reglas + ruleset + breakdown + tests)

## Contexto / Problema
Se necesitaba implementar un sistema de puntuación para predicciones de partidos basado en reglas de negocio, con una arquitectura limpia (DDD), fácil de extender y testeable. Además, se requirió mejorar la salida para no solo tener un puntaje total sino también un **desglose por regla** (qué reglas aplicaron y cuántos puntos aportó cada una).

---

## Enfoque de arquitectura

### 1) Reglas stateless y desacopladas
- Se definió un contrato de regla `PredictionRule`.
- Cada regla implementa `calculateScore(context)` sin depender de estado interno ni de entidades.

**Beneficios**
- Las reglas son fáciles de testear por separado.
- Agregar nuevas reglas es simple y no obliga a modificar lógica central.

### 2) Contexto único de evaluación
Se usa `PredictionRuleContext` con:
- `prediction`: marcador pronosticado (away/local)
- `match`: marcador real (away/local)

Esto estandariza cómo se evalúan todas las reglas.

### 3) Ruleset como orquestador central
Se implementó `PredictionScoreRuleset` como agregador de reglas:
- `PredictionScoreRuleset.default()` arma el conjunto de reglas “oficial”.
- `calculateWithBreakdown(context)` retorna el resultado detallado.
- Se mantiene compatibilidad con `calculate(context)` retornando solo el total.

---

## Breakdown del scoring (nuevo requerimiento)
Ahora el motor puede retornar un resultado detallado:

```ts
type PredictionScoreResult = {
  total: number;
  breakdown: Array<{ rule: string; points: number }>;
};
```

- `breakdown` incluye **solo** reglas que aportaron puntos (`points > 0`).
- El nombre de la regla viene de `rule.constructor.name`.

---

## Integración con la entidad
`PredictionEntity.calculateScore(matchAway, matchLocal)`:
- Ejecuta el ruleset con `calculateWithBreakdown(...)`
- Setea `this.score = result.total` (para no romper comportamiento anterior)
- Retorna `PredictionScoreResult` para poder consumir el breakdown.

---

## Reglas de negocio implementadas
Reglas incluidas actualmente en `PredictionScoreRuleset.default()`:

- **WinnerDrawRule (+2)**  
  +2 si el outcome (ganador/empate) coincide.

- **TeamGoalsRule (+1)**  
  +1 si coincide **al menos uno** de los goles (local o visitante).  
  *(No suma 1 por cada equipo, es solo +1 si coincide alguno).* 

- **ExactScoreRule (+1)**  
  +1 si el marcador es exacto.

- **HighScoringMatchRule (+1)** *(regla “abultado”)*  
  +1 solo si:
  - el partido tiene **4+ goles**, y
  - el marcador es **exacto**

- **InverseResultRule (+1)**  
  +1 de consolación si el outcome es el inverso (no aplica en empates).

---

## Utils compartidos (evitar duplicación)
Se centralizó lógica repetida en `score-rule.utils.ts`, incluyendo:
- `goalDiff`, `outcome`
- `isSameOutcome`
- `isInverseOutcome`
- `totalGoals`
- `isExactScore` (util para comparar marcador exacto)

---

## Testing (Jest + ts-jest)
Se agregó infraestructura de pruebas y cobertura en 3 niveles:

### 1) Tests unitarios por regla
Cada regla tiene su `.spec.ts` independiente en:
- `domain/test/prediction/scoreRules/*.spec.ts`

### 2) Tests unitarios de utils
Tests para `score-rule.utils.ts` (incluyendo `isExactScore`).

### 3) Tests de integración del scoring total
Suite data-driven para `PredictionEntity.calculateScore`:
- Casos como arreglo con `description`, `appliedRules`, entradas y esperados.
- Valida:
  - `result.total`
  - `result.breakdown`
  - `prediction.score`

---

## Ajustes en server
Se ajustó el usecase del server para manejar que `prediction.calculateScore(...)` ahora retorna `{ total, breakdown }` y poder loggear el breakdown.

> Nota: si el server consume el domain desde `server/libs/domain`, recuerda reconstruir/copiar el domain para sincronizar tipos.

---

## Archivos principales tocados (resumen)

### Domain
- `domain/src/features/prediction/prediction.rule.ts`
- `domain/src/features/prediction/scoreRules/*.rule.ts`
- `domain/src/features/prediction/scoreRules/prediction-score.ruleset.ts`
- `domain/src/features/prediction/scoreRules/score-rule.utils.ts`
- `domain/src/features/prediction/prediction.entity.ts`
- `domain/src/features/prediction/index.ts`

### Tests
- `domain/test/prediction/scoreRules/*.spec.ts`
- `domain/test/prediction/prediction.entity.calculateScore.spec.ts`

### Server
- `server/src/features/match/usecases/calculate-match-score.usecase-impl.ts`

---

## Cómo probar
En `domain/`:
- `pnpm test`

Para sincronizar el domain compilado con server:
- `pnpm run build` (en `domain/`)
