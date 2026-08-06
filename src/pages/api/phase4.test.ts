import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { APIContext } from 'astro';

const TEST_EMAIL = `phase4-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
const TEST_PASSWORD = 'phase4pass123';
const TEST_NAME = 'Phase 4 Test';
const SONG = {
  deezerTrackId: '3135556',
  title: 'Test Song',
  artistName: 'Test Artist',
  albumTitle: 'Test Album',
  coverUrl: 'https://example.com/cover.jpg',
  previewUrl: 'https://example.com/preview.mp3',
  durationSec: 180,
};

let userId: string;
let authCookie: string;

function makeContext(opts: {
  method?: string;
  url?: string;
  body?: unknown;
  user?: { id: string } | null;
  params?: Record<string, string>;
} = {}): APIContext {
  const url = opts.url ?? 'http://localhost/api/test';
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (authCookie) headers.set('cookie', authCookie);
  const request = new Request(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return {
    request,
    url: new URL(url),
    params: opts.params ?? {},
    locals: {
      user: opts.user === undefined ? { id: userId, email: TEST_EMAIL } as any : opts.user as any,
      session: null,
    },
    redirect: (() => {
      throw new Error('redirect not stubbed');
    }) as any,
    rewrite: (() => {
      throw new Error('rewrite not stubbed');
    }) as any,
    cookies: {} as any,
    site: undefined,
    generator: '',
    props: {},
    preferredLocale: undefined,
    preferredLocaleList: undefined,
    currentLocale: undefined,
    routePattern: '',
    clientAddress: '127.0.0.1',
  } as unknown as APIContext;
}

beforeAll(async () => {
  const result = await auth.api.signUpEmail({
    body: { email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME },
    asResponse: true,
  });
  const setCookie = result.headers.get('set-cookie') ?? '';
  authCookie = setCookie.split(';')[0];

  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) throw new Error('Test user not created');
  userId = user.id;
});

afterAll(async () => {
  await prisma.playlist.deleteMany({ where: { ownerId: userId } });
  await prisma.likedSong.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('playlists API', () => {
  it('POST /api/playlists sin auth devuelve 401', async () => {
    const { POST } = await import('@/pages/api/playlists/index');
    const ctx = makeContext({ method: 'POST', user: null, body: { title: 'X' } });
    const res = await POST(ctx);
    expect(res.status).toBe(401);
  });

  it('POST /api/playlists con auth crea playlist y devuelve 201', async () => {
    const { POST } = await import('@/pages/api/playlists/index');
    const ctx = makeContext({ method: 'POST', body: { title: 'My new playlist' } });
    const res = await POST(ctx);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.playlist.title).toBe('My new playlist');
    expect(data.playlist.ownerId).toBe(userId);
  });

  it('POST /api/playlists con body inválido devuelve 400', async () => {
    const { POST } = await import('@/pages/api/playlists/index');
    const ctx = makeContext({ method: 'POST', body: {} });
    const res = await POST(ctx);
    expect(res.status).toBe(400);
  });

  it('GET /api/playlists devuelve solo las del user', async () => {
    const { GET } = await import('@/pages/api/playlists/index');
    const ctx = makeContext({ method: 'GET' });
    const res = await GET(ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.playlists)).toBe(true);
    for (const p of data.playlists) {
      expect(p.ownerId).toBe(userId);
    }
  });
});

describe('playlists/[id]/songs API', () => {
  let playlistId: string;

  beforeAll(async () => {
    const playlist = await prisma.playlist.create({
      data: { title: 'Songs Test', ownerId: userId },
    });
    playlistId = playlist.id;
  });

  afterAll(async () => {
    await prisma.playlistSong.deleteMany({ where: { playlistId } });
  });

  it('POST sin auth devuelve 401', async () => {
    const { POST } = await import('@/pages/api/playlists/[id]/songs');
    const ctx = makeContext({
      method: 'POST',
      user: null,
      params: { id: playlistId },
      body: SONG,
    });
    const res = await POST(ctx);
    expect(res.status).toBe(401);
  });

  it('POST con auth y deezerTrackId válido devuelve 201 con metadata', async () => {
    const { POST } = await import('@/pages/api/playlists/[id]/songs');
    const ctx = makeContext({
      method: 'POST',
      params: { id: playlistId },
      body: SONG,
    });
    const res = await POST(ctx);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.song.deezerTrackId).toBe(SONG.deezerTrackId);
    expect(data.song.title).toBe(SONG.title);
    expect(data.song.previewUrl).toBe(SONG.previewUrl);
  });

  it('POST de canción duplicada devuelve 200 (idempotente)', async () => {
    const { POST } = await import('@/pages/api/playlists/[id]/songs');
    const ctx = makeContext({
      method: 'POST',
      params: { id: playlistId },
      body: SONG,
    });
    const res = await POST(ctx);
    expect(res.status).toBe(200);
  });

  it('DELETE remueve la canción y devuelve 204', async () => {
    const { DELETE } = await import(
      '@/pages/api/playlists/[id]/songs/[deezerId]'
    );
    const ctx = makeContext({
      method: 'DELETE',
      params: { id: playlistId, deezerId: String(SONG.deezerTrackId) },
    });
    const res = await DELETE(ctx);
    expect(res.status).toBe(204);
  });

  it('DELETE de canción no presente devuelve 404', async () => {
    const { DELETE } = await import(
      '@/pages/api/playlists/[id]/songs/[deezerId]'
    );
    const ctx = makeContext({
      method: 'DELETE',
      params: { id: playlistId, deezerId: '99999999' },
    });
    const res = await DELETE(ctx);
    expect(res.status).toBe(404);
  });
});

describe('songs/[deezerId]/like API', () => {
  it('POST sin auth devuelve 401', async () => {
    const { POST } = await import('@/pages/api/songs/[deezerId]/like');
    const ctx = makeContext({
      method: 'POST',
      user: null,
      params: { deezerId: String(SONG.deezerTrackId) },
      body: SONG,
    });
    const res = await POST(ctx);
    expect(res.status).toBe(401);
  });

  it('primer POST like devuelve 201 con liked=true', async () => {
    const { POST } = await import('@/pages/api/songs/[deezerId]/like');
    const ctx = makeContext({
      method: 'POST',
      params: { deezerId: String(SONG.deezerTrackId) },
      body: SONG,
    });
    const res = await POST(ctx);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.liked).toBe(true);
  });

  it('segundo POST like devuelve 200 con liked=false (toggle)', async () => {
    const { POST } = await import('@/pages/api/songs/[deezerId]/like');
    const ctx = makeContext({
      method: 'POST',
      params: { deezerId: String(SONG.deezerTrackId) },
      body: SONG,
    });
    const res = await POST(ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.liked).toBe(false);
  });

  it('tercer POST like devuelve 201 con liked=true (re-like)', async () => {
    const { POST } = await import('@/pages/api/songs/[deezerId]/like');
    const ctx = makeContext({
      method: 'POST',
      params: { deezerId: String(SONG.deezerTrackId) },
      body: SONG,
    });
    const res = await POST(ctx);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.liked).toBe(true);
  });
});

describe('me/liked-songs API', () => {
  it('GET sin auth devuelve 401', async () => {
    const { GET } = await import('@/pages/api/me/liked-songs');
    const ctx = makeContext({ method: 'GET', user: null });
    const res = await GET(ctx);
    expect(res.status).toBe(401);
  });

  it('GET con auth devuelve solo liked songs del user', async () => {
    const { GET } = await import('@/pages/api/me/liked-songs');
    const ctx = makeContext({ method: 'GET' });
    const res = await GET(ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.songs)).toBe(true);
    for (const s of data.songs) {
      expect(s.userId).toBe(userId);
    }
    expect(data.songs.length).toBeGreaterThan(0);
  });
});
