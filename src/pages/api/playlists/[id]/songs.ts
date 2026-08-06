import type { APIRoute } from 'astro';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { parseJsonBody } from '@/lib/validate';

const addSongSchema = z.object({
  deezerTrackId: z.string().regex(/^[1-9]\d*$/),
  title: z.string().min(1),
  artistName: z.string().min(1),
  albumTitle: z.string().min(1),
  coverUrl: z.url(),
  previewUrl: z.url(),
  durationSec: z.number().int().positive(),
});

async function assertOwnsPlaylist(id: string, userId: string) {
  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist) return { ok: false as const, status: 404, message: 'Playlist not found' };
  if (playlist.ownerId !== userId) return { ok: false as const, status: 403, message: 'Forbidden' };
  return { ok: true as const, playlist };
}

export const POST: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const id = context.params.id;
  if (!id) return jsonResponse({ error: 'Missing playlist id' }, 400);

  const parsed = await parseJsonBody(context.request, addSongSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const owned = await assertOwnsPlaylist(id, auth.user.id);
    if (!owned.ok) {
      return jsonResponse({ error: owned.message }, owned.status);
    }

    const existing = await prisma.playlistSong.findUnique({
      where: { playlistId_deezerTrackId: { playlistId: id, deezerTrackId: parsed.data.deezerTrackId } },
    });
    if (existing) {
      return jsonResponse({ song: existing }, 200);
    }

    const last = await prisma.playlistSong.findFirst({
      where: { playlistId: id },
      orderBy: { position: 'desc' },
    });
    const position = last ? last.position + 1 : 0;

    const song = await prisma.playlistSong.create({
      data: { ...parsed.data, playlistId: id, position },
    });

    if (position === 0 && !owned.playlist.coverUrl && parsed.data.coverUrl) {
      await prisma.playlist.update({
        where: { id },
        data: { coverUrl: parsed.data.coverUrl },
      });
    }

    return jsonResponse({ song }, 201);
  } catch (error) {
    logger.error('playlists/[id]/songs POST failed', { id, error: String(error) });
    return errorResponse(error);
  }
};
