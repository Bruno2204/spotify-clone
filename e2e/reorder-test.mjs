// E2E test for the recent features
const BASE = 'http://localhost:4321';

async function run() {
  const ts = Date.now();
  const email = `e2e-reorder-${ts}@test.com`;
  const password = 'e2etestpass123';

  const authHeaders = { 'Content-Type': 'application/json', Origin: BASE };

  // 1. Signup
  const signupRes = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ email, password, name: 'E2E Reorder' }),
  });
  console.log('1) Signup:', signupRes.status);
  const setCookie = signupRes.headers.get('set-cookie');
  const cookie = setCookie?.split(';')[0];
  if (!cookie) {
    console.error('No cookie'); return;
  }

  const allHeaders = { ...authHeaders, cookie };

  // 2. Create playlist
  const plRes = await fetch(`${BASE}/api/playlists`, {
    method: 'POST',
    headers: allHeaders,
    body: JSON.stringify({ title: 'Reorder Test' }),
  });
  const pl = await plRes.json();
  console.log('2) Create playlist:', plRes.status, pl.playlist.id);

  // 3. Add 2 songs
  for (const id of ['3135556', '9999999']) {
    const res = await fetch(`${BASE}/api/playlists/${pl.playlist.id}/songs`, {
      method: 'POST',
      headers: allHeaders,
      body: JSON.stringify({
        deezerTrackId: id,
        title: `Track ${id}`,
        artistName: 'Test',
        albumTitle: 'Album',
        coverUrl: `https://example.com/c-${id}.jpg`,
        previewUrl: 'https://example.com/p.mp3',
        durationSec: 180,
      }),
    });
    console.log(`3) Add ${id}:`, res.status);
  }

  // 4. Reorder
  const reorderRes = await fetch(`${BASE}/api/playlists/${pl.playlist.id}/songs/order`, {
    method: 'PUT',
    headers: allHeaders,
    body: JSON.stringify({
      order: [
        { deezerTrackId: '9999999', position: 0 },
        { deezerTrackId: '3135556', position: 1 },
      ],
    }),
  });
  console.log('4) Reorder:', reorderRes.status);

  // 5. Delete one song
  const delRes = await fetch(`${BASE}/api/playlists/${pl.playlist.id}/songs/9999999`, {
    method: 'DELETE',
    headers: allHeaders,
  });
  console.log('5) Delete:', delRes.status);

  // 6. Delete again (should be 404)
  const del2Res = await fetch(`${BASE}/api/playlists/${pl.playlist.id}/songs/9999999`, {
    method: 'DELETE',
    headers: allHeaders,
  });
  console.log('6) Delete again (expect 404):', del2Res.status);

  // 7. Verify cover was set from first song
  const checkRes = await fetch(`${BASE}/api/playlists/${pl.playlist.id}`, {
    headers: allHeaders,
  });
  const check = await checkRes.json();
  console.log('7) Playlist cover (should be c-3135556):', check.playlist.coverUrl);

  // 8. Update name
  const pwdRes = await fetch(`${BASE}/api/me`, {
    method: 'PATCH',
    headers: allHeaders,
    body: JSON.stringify({ name: 'E2E Updated' }),
  });
  console.log('8) Update name:', pwdRes.status);
}

run().catch(console.error);
