# Phase 1 — Independent Bug Fixes

**Goal**: Arreglar los 4 bugs que no dependen de la migracion a Deezer (B1, B2, B5, B7), con tests de regresion para cada uno.

**Effort**: 1h
**Dependencies**: Phase 0 (test setup)

## Out of scope
- Migracion a Deezer (Phase 2) — B3, B4, B6 quedan pendientes
- Refactor de `data.ts` — se elimina en Phase 2
- Features nuevas

## Bugs cubiertos

| ID | Archivo | Sintoma |
|----|---------|---------|
| B1 | `Player.jsx` | `audioRef.current.X` crashea si el ref es null en el primer render |
| B2 | `SongSlider.jsx` | Stale closure en cleanup de `timeupdate` → listener leak |
| B5 | `CardPlayButton.jsx` | `<div onClick>` es inaccesible por teclado y screen reader |
| B7 | `SideMenuNav.astro` | El link de Search es `href: '#'` — link muerto |

## Files

### Modify
- `src/components/footer/Player.jsx` — Agregar optional chaining en accesos a `audioRef.current` (lineas 12, 17, 18, 24, 26); guardar el bloque `if (song)` con `&& audioRef.current`
- `src/components/footer/SongSlider.jsx` — Capturar `audio.current` en un const local dentro del effect para evitar ref stale en cleanup
- `src/components/main/CardPlayButton.jsx` — Reemplazar `<div onClick>` exterior por `<button type="button" aria-label="Play playlist">`
- `src/components/side-menu/SideMenuNav.astro` — Cambiar el `href` de Search de `'#'` a `'/search'`

## Acceptance criteria
- [ ] B1: el Player renderiza sin throw, incluso si `audioRef.current` es null
- [ ] B2: SongSlider unmount durante reproduccion → no hay console warning sobre listener leak
- [ ] B5: `CardPlayButton` es un `<button>` con `aria-label`
- [ ] B7: el link de Search en SideMenuNav apunta a `/search`
- [ ] Los 4 bugs tienen al menos un test de regresion

## Tests
- B1: renderizar `<Player />` sin un elemento `<audio>` real → no throw
- B2: renderizar `<SongSlider audio={...} />`, unmount mid-update → no warning de listener leak
- B5: renderizar `<CardPlayButton />` → el elemento es `<button>`, tiene `aria-label`
- B7: renderizar `<SideMenuNav />` → el anchor de Search tiene `href="/search"`

## Notes
- El fix de B1 usa optional chaining (`?.`) en assignments — valido en JS moderno, solo asigna si no es null
- Patron de fix de B2: dentro del effect, snapshot `const audioEl = audio.current` y usar eso tanto en setup como en cleanup
- Nota sobre B5: la clase `cursor-pointer` ya no es necesaria porque el button nativo provee cursor
- B7: la pagina `/search` todavia no existe (se crea en Phase 2) — el link es no-op hasta entonces
- Despues del fix, el `Player.jsx` sigue apuntando a `/music/...` local — eso se resuelve en Phase 2. Por ahora el fix de B1 es solo estabilizar el crash
