import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { getGenres } from '@/lib/deezer';
import { logger } from '@/lib/logger';

type CheckResult =
  | { ok: true; latencyMs: number }
  | { ok: false; latencyMs: number; error: string };

async function check(fn: () => Promise<unknown>): Promise<CheckResult> {
  const start = performance.now();
  try {
    await fn();
    return { ok: true, latencyMs: Math.round(performance.now() - start) };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export const GET: APIRoute = async () => {
  const [deezer, db] = await Promise.all([
    check(() => getGenres()),
    check(() => prisma.$queryRaw`SELECT 1`),
  ]);

  const ok = deezer.ok && db.ok;

  if (!ok) {
    logger.warn('health check degraded', { deezer, db });
  }

  return new Response(
    JSON.stringify({
      status: ok ? 'ok' : 'degraded',
      deezer,
      db,
      timestamp: new Date().toISOString(),
    }),
    {
      status: ok ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
