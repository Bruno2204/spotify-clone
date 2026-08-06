import type { APIRoute } from 'astro';
import { getCharts } from '@/lib/deezer';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ request }) => {
  try {
    const tracks = await getCharts();
    return jsonResponse(tracks, 200, { maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 600 });
  } catch (error) {
    logger.error('charts failed', { url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
