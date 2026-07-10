# Phase 0 — Testing Setup

**Goal**: Tener Vitest + React Testing Library corriendo con un test smoke del Player que falle si no monta.

**Effort**: 30min
**Dependencies**: ninguna

## Out of scope
- Coverage gates (se agrega en fase de CI, v2)
- Tests E2E con Playwright (se agrega en Phase 5)
- Tests de los bugs específicos (se agregan en Phase 1)

## Files

### Create
- `vitest.config.ts` — Config compatible con Vite, entorno jsdom
- `src/test/setup.ts` — Registra matchers de `@testing-library/jest-dom` y `afterEach(cleanup)`
- `src/test/mocks/audioMock.ts` — Stub de métodos de `HTMLAudioElement`
- `src/components/footer/Player.test.jsx` — Smoke test

### Modify
- `package.json` — Agregar `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitest/ui` a devDependencies; agregar scripts `test`, `test:run`, `test:ui`

## Acceptance criteria
- [ ] `pnpm test` abre Vitest en modo watch
- [ ] `pnpm test:run` sale con exit code 0 y al menos 1 test pasando
- [ ] Entorno jsdom configurado (verificado por un test que toca `document`)
- [ ] Matchers de `@testing-library/jest-dom` disponibles (`expect(...).toBeInTheDocument()` funciona)
- [ ] El smoke test del Player renderiza sin throw

## Tests
- Player smoke: envolver `<Player />` en el estado inicial de Zustand, renderizar, assert que el footer está presente

## Notes
- Astro usa Vite, así que Vitest reusa la misma config — no hace falta un bundler separado
- jsdom es necesario porque el Player usa `HTMLAudioElement` via ref
- El ref de audio va a ser `null` en el primer render, así que este test es esencialmente el test de regresión del bug B1
- El path alias `@/` ya esta configurado en `tsconfig.json`, Vitest lo respeta automaticamente con Vite resolve
