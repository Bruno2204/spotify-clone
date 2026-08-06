import type { APIRoute } from 'astro';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { parseJsonBody } from '@/lib/validate';

const createSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const GET: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  try {
    const playlists = await prisma.playlist.findMany({
      where: { ownerId: auth.user.id },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { songs: true } } },
    });
    return jsonResponse({ playlists });
  } catch (error) {
    logger.error('playlists index GET failed', { userId: auth.user.id, error: String(error) });
    return errorResponse(error);
  }
};

export const POST: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const parsed = await parseJsonBody(context.request, createSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const playlist = await prisma.playlist.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        ownerId: auth.user.id,
      },
    });
    return jsonResponse({ playlist }, 201);
  } catch (error) {
    logger.error('playlists index POST failed', { userId: auth.user.id, error: String(error) });
    return errorResponse(error);
  }
};
