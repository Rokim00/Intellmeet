import { ApiError } from './apiError.js';

export interface FieldValidationError {
  field: string;
  message: string;
}

export const validateRequired = <T extends object>(
  data: T,
  fields: (keyof T & string)[]
): void => {
  const missingFields: FieldValidationError[] = [];

  for (const field of fields) {
    const value = data ? data[field] : undefined;
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      const fieldName = String(field);
      const formattedName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      missingFields.push({
        field: fieldName,
        message: `${formattedName} is required`
      });
    }
  }

  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      'Validation failed: Please check the missing or invalid fields',
      missingFields
    );
  }
};
