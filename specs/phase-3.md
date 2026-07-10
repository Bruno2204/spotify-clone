# Phase 3 — Authentication

**Goal**: Agregar Better Auth con email/password, exponiendo el usuario actual via `Astro.locals.user`.

**Effort**: 2h
**Dependencies**: Phase 2 (Deezer — necesario para normalizacion de data del user)

## Out of scope
- Social login (Google, GitHub) — v2
- 2FA — v2
- Flujo de password reset — v2
- Verificacion de email — v2

## Files

### Create
- `src/lib/auth.ts` — Config de Better Auth, usa Prisma adapter
- `src/pages/api/auth/[...all].ts` — Catch-all para los handlers de Better Auth
- `src/middleware.ts` — Lee la cookie de sesion, inyecta `user` en `Astro.locals`
- `src/pages/login.astro` — Form de login
- `src/pages/register.astro` — Form de register
- `src/components/auth/LoginForm.jsx` — React island
- `src/components/auth/RegisterForm.jsx` — React island
- `src/types/auth.d.ts` — Declara `App.Locals.user`

### Modify
- `src/layouts/Layout.astro` — Mostrar avatar + nombre del user en el header del sidebar, o link a login
- `src/env.d.ts` — `namespace App { interface Locals { user: ... } }`

## Acceptance criteria
- [ ] `POST /api/auth/register` crea User en DB (Prisma) con password hasheado
- [ ] `POST /api/auth/login` valida credenciales y setea cookie de sesion
- [ ] `Astro.locals.user` esta poblado para requests autenticados
- [ ] El middleware redirige requests no autenticadas de rutas protegidas a `/login`
- [ ] Logout limpia la cookie de sesion
- [ ] Better Auth usa el modelo `User` de Prisma existente (no crea una tabla aparte)

## Tests
- `auth.ts`: register con email nuevo → 200; register con email duplicado → 409
- `middleware.ts`: request sin cookie a una ruta protegida → 302 a `/login`
- `login.astro`: submit del form → setea cookie de sesion
- `register.astro`: submit del form → crea user

## Notes
- Better Auth tiene un Prisma adapter — apuntarlo al schema existente
- Almacenamiento de sesion: cookie-based (default), no hace falta tabla de sesiones server-side
- Hashing de password: Better Auth usa scrypt por default — sin setup extra
- Para rutas SSR, el `Astro.locals.user` se setea por el middleware antes que corra el route handler
- Los social providers se agregan mas tarde con solo cambios de config en `auth.ts` (sin cambio de schema)
- `User.passwordHash` ya existe en el schema — Better Auth lo usa directo
