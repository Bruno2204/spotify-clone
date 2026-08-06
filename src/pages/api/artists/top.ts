import type { APIRoute } from 'astro';
import { getTopArtists } from '@/lib/deezer';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ request }) => {
  try {
    const artists = await getTopArtists();
    return jsonResponse(artists, 200, { maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 600 });
  } catch (error) {
    logger.error('artists/top failed', { url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
