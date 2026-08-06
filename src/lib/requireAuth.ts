import type { APIContext } from 'astro';
import type { User } from 'better-auth';

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; response: Response };

export function requireUser(context: APIContext): AuthResult {
  const user = context.locals.user;
  if (!user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { ok: true, user: user as User };
}
