import type { APIRoute } from 'astro';
import { getArtist, getArtistTop } from '@/lib/deezer';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    if (!id || !/^[1-9]\d*$/.test(id)) {
      return jsonResponse({ error: 'Invalid id' }, 400);
    }
    const [artist, top] = await Promise.all([getArtist(id), getArtistTop(id)]);
    return jsonResponse({ artist, top }, 200, { maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 600 });
  } catch (error) {
    logger.error('artist detail failed', { id: params.id, url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
