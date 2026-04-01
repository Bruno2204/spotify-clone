import { allPlaylists, songs as allSongs } from '@/lib/data.js';

export async function GET({ params, request }) {
  // const { id } = params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const playlist = allPlaylists.find((playlist) => playlist.id === id);
  const songs = allSongs.filter((song) => song.albumId === playlist?.albumId);

  return new Response(JSON.stringify({ playlist, songs }), {
    headers: { 'Content-Type': 'application/json' },
  });
}