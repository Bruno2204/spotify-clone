import { z } from 'zod';
import { errorResponse, jsonResponse } from '@/lib/apiResponse';

export async function parseJsonBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { response: Response }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { response: errorResponse(new Error('Invalid JSON body'), 400) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      response: jsonResponse(
        { error: 'Validation failed', issues: result.error.issues },
        400,
      ),
    };
  }
  return { data: result.data };
}
