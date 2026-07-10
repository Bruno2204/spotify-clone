# Phase 5 — Polish & Differentiators

**Goal**: Agregar las features que elevan esto de un "tutorial clone" a un portfolio piece: mediaSession, error boundaries, loading states, a11y, motion preferences.

**Effort**: 1-2h
**Dependencies**: Phase 4 (app completa funcionando)

## Out of scope
- PWA install / offline mode — v2
- Wrapper mobile nativo — v2
- Analytics — v2
- Internationalization (i18n) — v2

## Files

### Create
- `src/components/ErrorBoundary.jsx` — React error boundary, fallback UI con retry
- `src/components/ui/Skeleton.jsx` — Placeholder pulsante para loading states
- `src/components/ui/Toaster.jsx` — Wrapper de Sonner
- `e2e/` (Playwright) — Al menos un test de happy-path: login → play → add to playlist

### Modify
- `src/components/footer/Player.jsx` — Setear `navigator.mediaSession.metadata` al cambiar de cancion; bindear acciones `play`/`pause`/`previoustrack`/`nexttrack`
- `src/layouts/Layout.astro` — Envolver children en `<ErrorBoundary>`, montar `<Toaster>`, agregar fallback `<noscript>`
- `src/styles/global.css` — `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; } }`
- `src/pages/playlist/[id].astro` — `<title>` dinamico, OG image, OG description
- `src/pages/index.astro` — Mismo tratamiento de meta
- `src/components/playlist/PlaylistSongs.jsx` — `aria-current="true"` en la fila que esta sonando
- `src/components/side-menu/SideMenuNav.astro` — `aria-current="page"` en Home cuando estas en `/`

## Acceptance criteria
- [ ] Play/pause del Player se refleja en los media controls del SO (lock screen, media keys del teclado)
- [ ] Si el Player tira error, el resto de la app sigue funcionando (el error boundary muestra fallback)
- [ ] Loading skeletons aparecen en el fetch inicial de charts, search, playlist detail
- [ ] Toaster confirma: song agregada, song liked, error
- [ ] `prefers-reduced-motion: reduce` deshabilita todas las view transitions
- [ ] Cada pagina tiene `<title>` dinamico y OG tags
- [ ] Todos los icon buttons tienen `aria-label`
- [ ] Todos los `<button>` usan explicitamente `type="button"`
- [ ] Al menos un test E2E de Playwright para el critical path

## Tests
- `Player.jsx`: cuando `currentMusic.song` cambia, `navigator.mediaSession.metadata` se setea
- `ErrorBoundary.jsx`: renderizar con un child que tira error → fallback UI mostrado
- `Skeleton.jsx`: renderiza con clase de animacion pulse
- E2E (Playwright): visitar `/`, login, click en el primer chart card, click en play, assert que `<audio>` tiene `src` seteado

## Notes
- `mediaSession` requiere user gesture antes que `audio.play()` se permita — ya manejado en el Player
- Sonner es un componente unico, montar una vez en el Layout
- El fallback del error boundary deberia tener un boton "Reload" para recuperar
- Para `prefers-reduced-motion`, tambien deshabilitar las view transitions de Astro (`transition:animate="none"`)
- Playwright corre contra `pnpm preview` (build de produccion) para E2E estable — no contra dev server
- Skipear Playwright si es overkill — smoke test manual en cada fase alcanza para portfolio
- `mediaSession` solo funciona en HTTPS o localhost — en dev anda, en prod Vercel ya esta en HTTPS
