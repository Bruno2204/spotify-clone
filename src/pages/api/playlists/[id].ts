import type { APIRoute } from 'astro';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { parseJsonBody } from '@/lib/validate';

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

async function loadOwnedPlaylist(id: string, userId: string) {
  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist) return { ok: false as const, status: 404, message: 'Playlist not found' };
  if (playlist.ownerId !== userId) return { ok: false as const, status: 403, message: 'Forbidden' };
  return { ok: true as const, playlist };
}

export const GET: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const id = context.params.id;
  if (!id) return jsonResponse({ error: 'Missing id' }, 400);

  try {
    const owned = await loadOwnedPlaylist(id, auth.user.id);
    if (!owned.ok) {
      return jsonResponse({ error: owned.message }, owned.status);
    }
    const songs = await prisma.playlistSong.findMany({
      where: { playlistId: id },
      orderBy: { position: 'asc' },
    });
    return jsonResponse({ playlist: owned.playlist, songs });
  } catch (error) {
    logger.error('playlists/[id] GET failed', { id, error: String(error) });
    return errorResponse(error);
  }
};

export const PUT: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const id = context.params.id;
  if (!id) return jsonResponse({ error: 'Missing id' }, 400);

  const parsed = await parseJsonBody(context.request, updateSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const owned = await loadOwnedPlaylist(id, auth.user.id);
    if (!owned.ok) {
      return jsonResponse({ error: owned.message }, owned.status);
    }
    const playlist = await prisma.playlist.update({
      where: { id },
      data: parsed.data,
    });
    return jsonResponse({ playlist });
  } catch (error) {
    logger.error('playlists/[id] PUT failed', { id, error: String(error) });
    return errorResponse(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const id = context.params.id;
  if (!id) return jsonResponse({ error: 'Missing id' }, 400);

  try {
    const owned = await loadOwnedPlaylist(id, auth.user.id);
    if (!owned.ok) {
      return jsonResponse({ error: owned.message }, owned.status);
    }
    await prisma.playlist.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error('playlists/[id] DELETE failed', { id, error: String(error) });
    return errorResponse(error);
  }
};
