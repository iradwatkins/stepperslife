/**
 * Form validation utilities
 * Centralized validation logic for consistent error handling
 */

export type ValidationRule<T = any> = {
  test: (value: T) => boolean;
  message: string;
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Validate a value against a set of rules
 */
export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[]
): string | undefined {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }
  return undefined;
}

/**
 * Validate an entire form object against a schema
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    if (rules && rules.length > 0) {
      const value = data[field as keyof T];
      const error = validateField(value, rules as ValidationRule<any>[]);
      if (error) {
        errors[field as keyof T] = error;
      }
    }
  }
  
  return errors;
}

/**
 * Common validation rules
 */
export const validators = {
  required: (message = "This field is required"): ValidationRule => ({
    test: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    test: (value) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    test: (value) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = "Invalid email address"): ValidationRule<string> => ({
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  url: (message = "Invalid URL"): ValidationRule<string> => ({
    test: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    test: (value) => value === undefined || value === null || value >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    test: (value) => value === undefined || value === null || value <= max,
    message: message || `Must be no more than ${max}`,
  }),

  pattern: (pattern: RegExp, message = "Invalid format"): ValidationRule<string> => ({
    test: (value) => !value || pattern.test(value),
    message,
  }),

  phoneNumber: (message = "Invalid phone number"): ValidationRule<string> => ({
    test: (value) => {
      if (!value) return true;
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, "").length >= 10;
    },
    message,
  }),

  postalCode: (message = "Invalid postal code"): ValidationRule<string> => ({
    test: (value) => {
      if (!value) return true;
      // US ZIP code format
      const zipRegex = /^\d{5}(-\d{4})?$/;
      return zipRegex.test(value);
    },
    message,
  }),

  futureDate: (message = "Date must be in the future"): ValidationRule<string | Date> => ({
    test: (value) => {
      if (!value) return true;
      const date = typeof value === "string" ? new Date(value) : value;
      return date > new Date();
    },
    message,
  }),

  pastDate: (message = "Date must be in the past"): ValidationRule<string | Date> => ({
    test: (value) => {
      if (!value) return true;
      const date = typeof value === "string" ? new Date(value) : value;
      return date < new Date();
    },
    message,
  }),

  dateRange: (
    min: Date,
    max: Date,
    message?: string
  ): ValidationRule<string | Date> => ({
    test: (value) => {
      if (!value) return true;
      const date = typeof value === "string" ? new Date(value) : value;
      return date >= min && date <= max;
    },
    message: message || `Date must be between ${min.toLocaleDateString()} and ${max.toLocaleDateString()}`,
  }),

  custom: <T>(
    test: (value: T) => boolean,
    message: string
  ): ValidationRule<T> => ({
    test,
    message,
  }),
};

/**
 * Event validation schema
 */
export const eventValidationSchema: ValidationSchema<any> = {
  name: [
    validators.required(),
    validators.minLength(3),
    validators.maxLength(100),
  ],
  description: [
    validators.required(),
    validators.minLength(10),
    validators.maxLength(1000),
  ],
  location: [
    validators.required(),
    validators.minLength(2),
  ],
  address: [
    validators.required(),
  ],
  city: [
    validators.required(),
  ],
  state: [
    validators.required(),
    validators.maxLength(2),
  ],
  postalCode: [
    validators.required(),
    validators.postalCode(),
  ],
  eventDate: [
    validators.required(),
    validators.futureDate(),
  ],
  eventTime: [
    validators.required(),
  ],
  price: [
    validators.min(0, "Price cannot be negative"),
  ],
  totalCapacity: [
    validators.min(1, "Capacity must be at least 1"),
    validators.max(100000, "Capacity seems too large"),
  ],
};

/**
 * Ticket validation schema
 */
export const ticketValidationSchema: ValidationSchema<any> = {
  name: [
    validators.required("Ticket name is required"),
    validators.minLength(2),
  ],
  quantity: [
    validators.required(),
    validators.min(0, "Quantity cannot be negative"),
  ],
  price: [
    validators.required(),
    validators.min(0, "Price cannot be negative"),
  ],
  earlyBirdPrice: [
    validators.custom(
      (value, context) => {
        if (!context?.hasEarlyBird) return true;
        return value < context.price;
      },
      "Early bird price must be less than regular price"
    ),
  ],
  earlyBirdEndDate: [
    validators.custom(
      (value, context) => {
        if (!context?.hasEarlyBird) return true;
        return !!value;
      },
      "Early bird end date is required"
    ),
  ],
};