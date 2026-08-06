import type { APIRoute } from 'astro';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { parseJsonBody } from '@/lib/validate';

const orderSchema = z.object({
  order: z
    .array(
      z.object({
        deezerTrackId: z.string().regex(/^[1-9]\d*$/),
        position: z.number().int().min(0),
      }),
    )
    .min(1),
});

export const PUT: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const id = context.params.id;
  if (!id) return jsonResponse({ error: 'Missing playlist id' }, 400);

  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist) return jsonResponse({ error: 'Playlist not found' }, 404);
  if (playlist.ownerId !== auth.user.id) return jsonResponse({ error: 'Forbidden' }, 403);

  const parsed = await parseJsonBody(context.request, orderSchema);
  if ('response' in parsed) return parsed.response;

  const existing = await prisma.playlistSong.findMany({
    where: { playlistId: id },
    select: { deezerTrackId: true, position: true },
  });
  const existingIds = new Set(existing.map((s) => s.deezerTrackId));
  const providedIds = new Set(parsed.data.order.map((s) => s.deezerTrackId));
  if (
    existing.length !== parsed.data.order.length ||
    ![...existingIds].every((id) => providedIds.has(id))
  ) {
    return jsonResponse({ error: 'Order must include exactly all playlist songs' }, 400);
  }

  try {
    await prisma.$transaction(
      parsed.data.order.map((s) =>
        prisma.playlistSong.update({
          where: { playlistId_deezerTrackId: { playlistId: id, deezerTrackId: s.deezerTrackId } },
          data: { position: s.position },
        }),
      ),
    );
    return jsonResponse({ ok: true });
  } catch (error) {
    logger.error('reorder failed', { id, error: String(error) });
    return errorResponse(error);
  }
};
