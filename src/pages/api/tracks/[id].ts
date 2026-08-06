import type { APIRoute } from 'astro';
import { getTrack } from '@/lib/deezer';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    if (!id || !/^[1-9]\d*$/.test(id)) {
      return jsonResponse({ error: 'id must be a positive integer' }, 400);
    }
    const track = await getTrack(id);
    return jsonResponse({ track }, 200, { maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 600 });
  } catch (error) {
    logger.error('track failed', { url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
