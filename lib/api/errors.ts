/**
 * Every error response from /api has the same body: { error: { code, message, details? } }.
 * `code` is the stable, machine-readable part; `message` is Indonesian text safe to show users.
 */

export const ERROR_STATUS = {
  INVALID_JSON: 400,
  IDEMPOTENCY_KEY_REQUIRED: 400,
  UNAUTHENTICATED: 401,
  INVALID_SIGNATURE: 401,
  QUOTA_EXCEEDED: 402,
  FORBIDDEN: 403,
  PLAN_REQUIRED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  VALIDATION_ERROR: 422,
  IDEMPOTENCY_KEY_REUSED: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

export type ErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }

  get status() {
    return ERROR_STATUS[this.code];
  }

  toResponse() {
    const body: ErrorBody = {
      error: { code: this.code, message: this.message, ...(this.details !== undefined ? { details: this.details } : {}) },
    };
    return Response.json(body, { status: this.status });
  }
}
