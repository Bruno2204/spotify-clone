import type { APIRoute } from 'astro';
import { getAlbum } from '@/lib/deezer';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    if (!id || !/^[1-9]\d*$/.test(id)) {
      return jsonResponse({ error: 'Invalid id' }, 400);
    }
    const album = await getAlbum(id);
    return jsonResponse({ album }, 200, { maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 600 });
  } catch (error) {
    logger.error('album detail failed', { id: params.id, url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
