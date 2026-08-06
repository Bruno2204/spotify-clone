import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const DELETE: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const id = context.params.id;
  const deezerTrackId = context.params.deezerId;
  if (!id || !deezerTrackId) return jsonResponse({ error: 'Missing params' }, 400);
  if (!/^[1-9]\d*$/.test(deezerTrackId)) {
    return jsonResponse({ error: 'Invalid deezerId' }, 400);
  }

  try {
    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) return jsonResponse({ error: 'Playlist not found' }, 404);
    if (playlist.ownerId !== auth.user.id) return jsonResponse({ error: 'Forbidden' }, 403);

    const deleted = await prisma.playlistSong.deleteMany({
      where: { playlistId: id, deezerTrackId },
    });
    if (deleted.count === 0) {
      return jsonResponse({ error: 'Song not in playlist' }, 404);
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error('playlists/[id]/songs/[deezerId] DELETE failed', { id, deezerTrackId, error: String(error) });
    return errorResponse(error);
  }
};
