// Prisma client singleton.
// In dev, Vite/Astro HMR re-imports modules, which would create a new PrismaClient
// on every reload and exhaust the SQLite connection pool. Stash it on globalThis
// during dev to reuse the same instance.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: import.meta.env.DEV ? ['query', 'error', 'warn'] : ['error'],
});

if (import.meta.env.DEV) {
  globalForPrisma.prisma = prisma;
}
