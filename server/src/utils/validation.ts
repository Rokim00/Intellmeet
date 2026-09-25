import { ApiError } from './apiError.js';

export interface FieldValidationError {
  field: string;
  message: string;
}

/** A field that must be present. */
export type RequiredField<T> = keyof T & string;

const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const formatLabel = (field: string): string => field.charAt(0).toUpperCase() + field.slice(1);

export const validateRequired = <T extends object>(data: T, fields: RequiredField<T>[]): void => {
  const missingFields: FieldValidationError[] = [];

  for (const field of fields) {
    if (isBlank((data as Record<string, unknown>)[field])) {
      missingFields.push({ field, message: `${formatLabel(field)} is required` });
    }
  }

  if (missingFields.length > 0) {
    throw new ApiError(400, 'Validation failed: Please check the missing or invalid fields', missingFields);
  }
};

/**
 * Strips `//` and block comments from a JSON string while leaving comment-like
 * sequences inside string literals untouched (e.g. "https://example.com").
 * Dev-only convenience for commenting out credentials in API clients.
 */
export const stripJsonComments = (input: string): string => {
  let output = '';
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        output += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      output += char;
      if (char === '\\') {
        output += next ?? '';
        i++;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    output += char;
  }

  return output.replace(/,(\s*[}\]])/g, '$1');
};

