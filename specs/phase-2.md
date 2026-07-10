# Phase 2 — Deezer Integration

**Goal**: Reemplazar el `data.ts` hardcodeado con un proxy a la API de Deezer en rutas API de Astro, eliminando los bugs B3, B4, B6.

**Effort**: 2-3h
**Dependencies**: Phase 1 (Player estable)

## Out of scope
- Persistencia de playlists en DB (Phase 4)
- Auth (Phase 3)
- UI avanzada de search (filtros, infinite scroll — v2)

## Bugs cubiertos

| ID | Sintoma |
|----|---------|
| B3 | El audio src del Player apunta a archivos locales `/music/...` que no existen |
| B4 | IDs de canciones duplicados entre albums — `findIndex` matchea la cancion equivocada |
| B6 | `get-info-playlist.json.js` sirve data hardcodeada |

## Files

### Create
- `src/lib/deezer.ts` — Wrapper tipado con `searchTracks`, `getTrack`, `getCharts`, `getArtistTop`, `getGenres`, cache en memoria con TTL (5min para charts, 1min para search)
- `src/lib/logger.ts` — Logger con niveles (pretty en dev, `console.error` en prod)
- `src/pages/api/search.ts` — `GET /api/search?q=&limit=25&index=0`
- `src/pages/api/charts.ts` — `GET /api/charts` (con cache)
- `src/pages/api/tracks/[id].ts` — `GET /api/tracks/:deezerId`
- `src/pages/api/genres.ts` — `GET /api/genres`
- `src/pages/api/health.ts` — `GET /api/health` (pingea Deezer + DB si esta disponible)
- `src/pages/search.astro` — Pagina de busqueda
- `src/components/search/SearchInput.jsx` — Input con debounce (300ms)
- `src/components/search/SearchResults.jsx` — Lista con boton de play

### Modify
- `src/store/playerStore.ts` — Cambiar el tipo `Song` para incluir `deezerId: number`, `previewUrl: string`, `durationSec: number`
- `src/components/footer/Player.jsx` — Audio src = `song.previewUrl`
- `src/components/main/MainMenu.astro` — Fetch de `/api/charts` en frontmatter
- `src/pages/playlist/[id].astro` — Fetch de canciones desde Deezer o DB
- `src/components/main/CardPlayButton.jsx` — Usar el nuevo endpoint `/api/playlists/:id` (cuando este disponible) o Deezer para playlists default

### Delete
- `src/lib/data.ts`
- `src/pages/api/get-info-playlist.json.js`
- `public/music/` (si existe)

## Acceptance criteria
- [ ] `/api/search?q=lofi` devuelve tracks con shape normalizado: `{ deezerId, title, artist, album, cover, previewUrl, durationSec }`
- [ ] `/api/search?q=&limit=25&index=0` pagina correctamente
- [ ] `/api/charts` cachea respuestas por 5min en memoria
- [ ] El Player reproduce el `previewUrl` de Deezer
- [ ] Todos los IDs de canciones son unicos globalmente (Deezer ID) → B4 resuelto
- [ ] No hay llamadas a Deezer desde el browser (solo via proxy Astro)
- [ ] Estados de error en UI cuando Deezer devuelve 4xx/5xx
- [ ] Loading skeletons durante fetch

## Tests
- `deezer.ts`: `searchTracks` con fetch mockeado → normaliza respuesta correctamente
- Endpoint `search.ts`: GET con `q` → 200, shape de respuesta coincide
- `Player.jsx`: dado `currentMusic.song.previewUrl`, asigna `audio.src` correctamente (audio mockeado)
- `search.astro`: renderiza sin throw, input de busqueda presente

## Notes
- Deezer es una API publica para search/charts (no requiere key) pero aplica CORS — nunca llamar desde el browser
- Cache key: `deezer:charts` y `deezer:search:{q}:{index}` con timestamp
- `deezerId` es Int32, entra en un number de JS
- 30s preview es una limitacion de Deezer; la UI debe mostrar un indicador "30s preview"
- Rate limit: 50 req/5s — debounce + cache mitiga esto
- En serverless (Vercel), el cache en memoria de la funcion es per-invocation — para cache real usar Upstash Redis o Vercel KV en v2
