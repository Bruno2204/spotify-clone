import 'dotenv/config';
import { describe, it, expect, afterAll } from 'vitest';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TEST_EMAIL = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
const TEST_PASSWORD = 'testpassword123';
const TEST_NAME = 'Test User';

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('Better Auth — email/password signup', () => {
  it('register con email nuevo crea user en DB', async () => {
    const result = await auth.api.signUpEmail({
      body: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME,
      },
    });

    expect(result.user).toBeTruthy();
    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.user.emailVerified).toBe(false);

    const inDb = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    expect(inDb).toBeTruthy();
    if (!inDb) return;
    expect(inDb.emailVerified).toBe(false);
    expect(inDb.name).toBe(TEST_NAME);

    const account = await prisma.account.findFirst({ where: { userId: inDb.id } });
    expect(account).toBeTruthy();
    if (!account) return;
    expect(account.password).toBeTruthy();
    expect(account.password).not.toBe(TEST_PASSWORD);
  });

  it('register con email duplicado tira error', async () => {
    await expect(
      auth.api.signUpEmail({
        body: {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          name: TEST_NAME,
        },
      }),
    ).rejects.toThrow();
  });

  it('login con credenciales válidas devuelve sesión', async () => {
    const result = await auth.api.signInEmail({
      body: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    });

    expect(result.user).toBeTruthy();
    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.token).toBeTruthy();
  });

  it('login con password incorrecta tira error', async () => {
    await expect(
      auth.api.signInEmail({
        body: {
          email: TEST_EMAIL,
          password: 'wrongpassword',
        },
      }),
    ).rejects.toThrow();
  });
});
