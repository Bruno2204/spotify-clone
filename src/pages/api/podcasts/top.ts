import type { APIRoute } from 'astro';
import { getTopPodcasts } from '@/lib/deezer';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ request }) => {
  try {
    const podcasts = await getTopPodcasts();
    return jsonResponse(podcasts, 200, { maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 600 });
  } catch (error) {
    logger.error('podcasts/top failed', { url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
