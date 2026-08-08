import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const trustedOrigins = [
  'http://localhost:4321',
  ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ...(isProd && process.env.VERCEL_URL
    ? [`https://${process.env.VERCEL_URL}`]
    : []),
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET ?? import.meta.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? import.meta.env.BETTER_AUTH_URL,
  trustedOrigins,
  user: {
    modelName: 'user',
    fields: {
      image: 'avatarUrl',
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
});

export type Auth = typeof auth;
