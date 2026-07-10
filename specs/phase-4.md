# Phase 4 — Playlists & Likes CRUD

**Goal**: El usuario autenticado puede crear playlists, agregar/quitar canciones (desde Deezer), y dar like/unlike a tracks.

**Effort**: 2-3h
**Dependencies**: Phase 3 (auth) + Phase 2 (Deezer) + schema de Prisma (ya en su lugar)

## Out of scope
- Playlists publicas/compartidas — v2
- Playlists colaborativas — v2
- Drag-to-reorder en playlist — v2
- Upload de imagen de portada — v2

## Files

### Create
- `src/pages/api/playlists/index.ts` — `GET` (lista playlists del user), `POST` (crea)
- `src/pages/api/playlists/[id].ts` — `GET` (detalle), `PUT` (update), `DELETE`
- `src/pages/api/playlists/[id]/songs.ts` — `POST` (add), `DELETE` (remove por deezerTrackId)
- `src/pages/api/songs/[deezerId]/like.ts` — `POST` toggle like
- `src/pages/api/me/liked-songs.ts` — `GET` liked songs del user
- `src/pages/api/me.ts` — `GET` current user
- `src/components/playlist/CreatePlaylistDialog.jsx` — Modal con form
- `src/components/playlist/AddToPlaylistMenu.jsx` — Menu dropdown
- `src/pages/liked-songs.astro` — Playlist virtual de liked songs

### Modify
- `src/components/side-menu/SideMenuLibrary.astro` — Fetch de playlists del user desde DB
- `src/components/main/CardPlayButton.jsx` — Agregar opcion "Add to playlist"
- `src/components/playlist/PlaylistSongs.jsx` — Boton de like por fila
- `src/components/side-menu/SideMenu.astro` — Mostrar entrada "Liked Songs"

## Acceptance criteria
- [ ] `POST /api/playlists` crea una playlist del usuario actual
- [ ] `POST /api/playlists/:id/songs` con `{ deezerTrackId, ...metadata }` crea una fila en `PlaylistSong` con metadata cacheada
- [ ] `DELETE /api/playlists/:id/songs/:deezerId` remueve la cancion
- [ ] `POST /api/songs/:deezerId/like` toggle (primer call crea, segundo borra)
- [ ] `GET /api/me/liked-songs` devuelve solo las liked songs del usuario actual
- [ ] Todos los endpoints de escritura devuelven 401 cuando no hay auth
- [ ] Validacion de input con Zod (o similar) — rechazar bodies malformados
- [ ] El boton de like muestra estado optimista (filled cuando esta liked)

## Tests
- `playlists/index.ts`: POST sin auth → 401; POST con auth → 201
- `playlists/[id]/songs.ts`: POST con `deezerTrackId` valido → 201 con metadata cacheada
- `songs/[deezerId]/like.ts`: POST dos veces → 201 despues 200 (toggle, despues no-op)
- `me/liked-songs.ts`: GET con auth → devuelve solo los likes del user
- `CreatePlaylistDialog.jsx`: submit del form → POST → cierra modal, refresca lista

## Notes
- Usar Zod para validacion de input — chico, type-safe, anda bien con TypeScript
- `PlaylistSong` ya cachea metadata (title, artist, cover, previewUrl) — no hace falta llamar a Deezer en lectura
- Si `previewUrl` devuelve 404 al reproducir, refetchear de Deezer y actualizar la fila cacheada (mejora futura)
- "Liked Songs" es una playlist virtual — no existe en la tabla `Playlist`, consulta `LikedSong` directamente
- El campo `position` en `PlaylistSong` permite reordering mas adelante (solo ordenar por `position ASC`)
- Las queries de DB en serverless (Vercel) usan el connection pooler de Neon (no la directa) para evitar agotar conexiones
