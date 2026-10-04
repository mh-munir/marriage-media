import Ajv from "ajv";
import { NextRequest } from "next/server";

const ajv = new Ajv();

interface ValidationResult<T> {
  isValid: boolean;
  body: T | null;
  error: string | null;
}

export function parsePaginationParams(searchParams: URLSearchParams, options?: {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
  maxPage?: number;
}) {
  const defaultPage = options?.defaultPage ?? 1;
  const defaultLimit = options?.defaultLimit ?? 20;
  const maxLimit = options?.maxLimit ?? 100;
  const maxPage = options?.maxPage ?? 10000;

  const page = Number.parseInt(searchParams.get("page") ?? String(defaultPage), 10);
  const limit = Number.parseInt(searchParams.get("limit") ?? String(defaultLimit), 10);

  const safePage = Number.isInteger(page) && page > 0 ? Math.min(page, maxPage) : defaultPage;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, maxLimit) : defaultLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export async function validateBody<T>(
  req: NextRequest,
  schema: object
): Promise<ValidationResult<T>> {
  const body = await req.json().catch(() => null);
  if (body === null) {
    return { isValid: false, body: null, error: "Invalid JSON body." };
  }

  const validate = ajv.compile(schema);
  if (validate(body)) return { isValid: true, body, error: null };

  return { isValid: false, body: null, error: ajv.errorsText(validate.errors) };
}