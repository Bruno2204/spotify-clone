import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('astro:middleware', () => ({
  defineMiddleware: <T>(fn: T): T => fn,
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { middlewareLogic } from '@/middleware';
import { auth } from '@/lib/auth';

function makeContext(pathname: string, headers: Headers = new Headers()) {
  const url = new URL(pathname, 'http://localhost');
  return {
    request: { headers },
    url,
    locals: { user: undefined, session: undefined },
    redirect: vi.fn(
      (to: string) =>
        new Response(null, { status: 302, headers: { Location: to } }),
    ),
  } as any;
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockSession(value: unknown) {
    (auth.api.getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(value);
  }

  it('pobla locals.user cuando hay sesión', async () => {
    const user = { id: 'u1', email: 'a@b.com' };
    const session = { id: 's1', userId: 'u1' };
    mockSession({ user, session });

    const ctx = makeContext('/');
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    await middlewareLogic(ctx, next);

    expect(ctx.locals.user).toEqual(user);
    expect(ctx.locals.session).toEqual(session);
    expect(next).toHaveBeenCalled();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('deja locals.user en null cuando no hay sesión', async () => {
    mockSession(null);

    const ctx = makeContext('/');
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    await middlewareLogic(ctx, next);

    expect(ctx.locals.user).toBeNull();
    expect(ctx.locals.session).toBeNull();
    expect(next).toHaveBeenCalled();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('redirige a /login en rutas protegidas sin sesión', async () => {
    mockSession(null);

    const ctx = makeContext('/liked-songs');
    const next = vi.fn();

    await middlewareLogic(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledTimes(1);
    const calledWith = ctx.redirect.mock.calls[0][0];
    expect(calledWith).toMatch(/^\/login\?next=/);
    expect(next).not.toHaveBeenCalled();
  });

  it('redirige también a /playlist/create/* sin sesión', async () => {
    mockSession(null);

    const ctx = makeContext('/playlist/create/123');
    const next = vi.fn();

    await middlewareLogic(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it('permite rutas protegidas cuando hay sesión', async () => {
    mockSession({
      user: { id: 'u1' },
      session: { id: 's1' },
    });

    const ctx = makeContext('/liked-songs');
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    await middlewareLogic(ctx, next);

    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('no protege rutas públicas como /search', async () => {
    mockSession(null);

    const ctx = makeContext('/search');
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    await middlewareLogic(ctx, next);

    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
