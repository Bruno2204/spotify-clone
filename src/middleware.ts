import { defineMiddleware } from 'astro:middleware';
import type { APIContext } from 'astro';
import { auth } from '@/lib/auth';

const PROTECTED_PREFIXES = ['/playlist/create', '/me', '/liked-songs'];

export async function middlewareLogic(
  context: APIContext,
  next: () => Promise<Response>,
) {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;

  const pathname = context.url.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !session) {
    return context.redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return next();
}

export const onRequest = defineMiddleware(middlewareLogic);
