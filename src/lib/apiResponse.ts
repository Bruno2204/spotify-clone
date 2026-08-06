export type CacheConfig = {
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  private?: boolean;
};

export function buildCacheControl(cache: CacheConfig): string {
  const parts = [cache.private ? 'private' : 'public'];
  if (cache.maxAge !== undefined) parts.push(`max-age=${cache.maxAge}`);
  if (cache.sMaxAge !== undefined) parts.push(`s-maxage=${cache.sMaxAge}`);
  if (cache.staleWhileRevalidate !== undefined) parts.push(`stale-while-revalidate=${cache.staleWhileRevalidate}`);
  return parts.join(', ');
}

export function jsonResponse(
  data: unknown,
  status = 200,
  cache?: CacheConfig,
): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cache) headers['Cache-Control'] = buildCacheControl(cache);
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorResponse(error: unknown, status = 500): Response {
  const message = error instanceof Error ? error.message : String(error);
  return jsonResponse({ error: message }, status);
}
