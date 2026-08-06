import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  try {
    const liked = await prisma.likedSong.findMany({
      where: { userId: auth.user.id },
      orderBy: { likedAt: 'desc' },
    });
    return jsonResponse({ songs: liked });
  } catch (error) {
    logger.error('me/liked-songs failed', { userId: auth.user.id, error: String(error) });
    return errorResponse(error);
  }
};
