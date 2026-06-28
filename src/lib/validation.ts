import Ajv, { type Schema } from "ajv";
import { NextRequest } from "next/server";

const ajv = new Ajv();

interface ValidationResult<T> {
  isValid: boolean;
  body: T | null;
  error: string | null;
}

export async function validateBody<T>(
  req: NextRequest,
  schema: Schema
): Promise<ValidationResult<T>> {
  const body = await req.json().catch(() => null);
  if (body === null) {
    return { isValid: false, body: null, error: "Invalid JSON body." };
  }

  const validate = ajv.compile<T>(schema);
  if (validate(body)) return { isValid: true, body, error: null };

  return { isValid: false, body: null, error: ajv.errorsText(validate.errors) };
}