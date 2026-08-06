import type { APIRoute } from 'astro';
import { getGenres } from '@/lib/deezer';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ request }) => {
  try {
    const genres = await getGenres();
    return jsonResponse(genres);
  } catch (error) {
    logger.error('genres failed', { url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
