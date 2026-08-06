import type { APIRoute } from 'astro';
import { searchTracks } from '@/lib/deezer';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim() ?? '';
    const limit = Number(url.searchParams.get('limit') ?? '25');
    const index = Number(url.searchParams.get('index') ?? '0');

    if (!q) {
      return jsonResponse({ error: 'q is required' }, 400);
    }
    if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
      return jsonResponse({ error: 'limit must be 1-100' }, 400);
    }
    if (!Number.isFinite(index) || index < 0) {
      return jsonResponse({ error: 'index must be >= 0' }, 400);
    }

    const tracks = await searchTracks(q, limit, index);
    return jsonResponse(tracks, 200, { maxAge: 30, sMaxAge: 120, staleWhileRevalidate: 300 });
  } catch (error) {
    logger.error('search failed', { url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
