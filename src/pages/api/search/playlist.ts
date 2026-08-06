import type { APIRoute } from 'astro';
import { searchPlaylists } from '@/lib/deezer';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const q = url.searchParams.get('q')?.trim();
    if (!q) return jsonResponse({ error: 'Missing q' }, 400);
    const limit = Number(url.searchParams.get('limit')) || 20;
    const playlists = await searchPlaylists(q, limit);
    return jsonResponse(playlists, 200, { maxAge: 30, sMaxAge: 120, staleWhileRevalidate: 300 });
  } catch (error) {
    logger.error('search/playlists failed', { url: request.url, error: String(error) });
    return errorResponse(error);
  }
};
