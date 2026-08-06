import type { APIRoute } from 'astro';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { parseJsonBody } from '@/lib/validate';

const likeSchema = z.object({
  deezerTrackId: z.string().regex(/^[1-9]\d*$/),
  title: z.string().min(1),
  artistName: z.string().min(1),
  albumTitle: z.string().min(1),
  coverUrl: z.url(),
  previewUrl: z.url(),
  durationSec: z.number().int().positive(),
});

export const POST: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const deezerTrackId = context.params.deezerId;
  if (!deezerTrackId || !/^[1-9]\d*$/.test(deezerTrackId)) {
    return jsonResponse({ error: 'Invalid deezerId' }, 400);
  }

  const existing = await prisma.likedSong.findUnique({
    where: { userId_deezerTrackId: { userId: auth.user.id, deezerTrackId } },
  });

  if (existing) {
    await prisma.likedSong.delete({
      where: { userId_deezerTrackId: { userId: auth.user.id, deezerTrackId } },
    });
    return jsonResponse({ liked: false, deezerTrackId });
  }

  const parsed = await parseJsonBody(context.request, likeSchema);
  if ('response' in parsed) return parsed.response;
  if (parsed.data.deezerTrackId !== deezerTrackId) {
    return jsonResponse({ error: 'deezerTrackId mismatch' }, 400);
  }

  try {
    const song = await prisma.likedSong.create({
      data: { ...parsed.data, userId: auth.user.id },
    });
    return jsonResponse({ liked: true, song }, 201);
  } catch (error) {
    logger.error('like failed', { userId: auth.user.id, deezerTrackId, error: String(error) });
    return errorResponse(error);
  }
};
