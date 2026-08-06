import type { APIRoute } from 'astro';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/requireAuth';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { parseJsonBody } from '@/lib/validate';

const updateSchema = z.object({
  name: z.string().min(1).max(50),
});

export const PATCH: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  const parsed = await parseJsonBody(context.request, updateSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true },
    });
    return jsonResponse({ user });
  } catch (error) {
    logger.error('me PATCH failed', { userId: auth.user.id, error: String(error) });
    return errorResponse(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.ok) return auth.response;

  try {
    await prisma.user.delete({ where: { id: auth.user.id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error('me DELETE failed', { userId: auth.user.id, error: String(error) });
    return errorResponse(error);
  }
};
