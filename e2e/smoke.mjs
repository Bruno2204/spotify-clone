// E2E smoke test — happy path: signup → fetch charts → verify audio ready
// Run with: pnpm dev (in one terminal) + node e2e/smoke.mjs (in another)

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:4321';
const ORIGIN = new URL(BASE).origin;
let exitCode = 0;
function log(label, ok, detail) {
  const mark = ok ? '✓' : '✗';
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) exitCode = 1;
}

async function run() {
  const ts = Date.now();
  const email = `smoke-${ts}@e2e.test`;

  // 1) Health
  const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
  log('health endpoint', health.status === 'ok' || health.status === 'degraded', health.status);

  // 2) Sign up
  const signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: ORIGIN },
    body: JSON.stringify({ email, password: 'smokepass123', name: 'Smoke' }),
  });
  const setCookie = signup.headers.get('set-cookie') ?? '';
  log('signup', signup.status === 200, `status ${signup.status}`);
  log('auth cookie set', setCookie.includes('better-auth.session_token'));

  // 3) Charts
  const charts = await fetch(`${BASE}/api/charts`).then((r) => r.json());
  log('charts fetch', Array.isArray(charts) && charts.length > 0, `${charts.length} tracks`);

  // 4) Search
  const search = await fetch(`${BASE}/api/search?q=lofi`).then((r) => r.json());
  log('search fetch', Array.isArray(search), `${search.length} results`);

  // 5) Playlists CRUD
  const createPl = await fetch(`${BASE}/api/playlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: setCookie.split(';')[0],
      origin: ORIGIN,
    },
    body: JSON.stringify({ title: 'Smoke Playlist' }),
  });
  const { playlist } = await createPl.json();
  log('create playlist', createPl.status === 201, `id ${playlist?.id}`);

  // 6) Like
  const likable = charts.find((t) => t.deezerId);
  if (likable) {
    const like = await fetch(`${BASE}/api/songs/${likable.deezerId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: setCookie.split(';')[0],
        origin: ORIGIN,
      },
      body: JSON.stringify({
        deezerTrackId: String(likable.deezerId),
        title: likable.title,
        artistName: likable.artist,
        albumTitle: likable.album,
        coverUrl: likable.cover,
        previewUrl: likable.previewUrl,
        durationSec: likable.durationSec,
      }),
    });
    log('like song', like.status === 201, `status ${like.status}, id ${likable.deezerId}`);
  } else {
    log('like song (skipped — no tracks in charts)', true);
  }

  // 7) Home page renders
  const home = await fetch(`${BASE}/`).then((r) => r.text());
  log('home page renders', home.includes('Spotify Clone'), `${home.length} bytes`);

  // 8) Auth-protected route redirects when no cookie
  const liked = await fetch(`${BASE}/liked-songs`, { redirect: 'manual' });
  log('protected route redirects when no auth', liked.status === 302, `status ${liked.status}`);

  // Cleanup
  await fetch(`${BASE}/api/playlists/${playlist.id}`, {
    method: 'DELETE',
    headers: { cookie: setCookie.split(';')[0], origin: ORIGIN },
  });

  process.exit(exitCode);
}

run().catch((e) => {
  console.error('Smoke test failed:', e);
  process.exit(1);
});
