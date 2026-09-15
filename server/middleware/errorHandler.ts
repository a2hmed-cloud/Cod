import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function apiErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  // Log full error on server
  console.error('[API Error]:', err?.message || err);
  if (err?.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Known custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Prisma Known Request Errors
  if (err?.code === 'P2002') {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A resource with this unique identifier already exists.',
        target: err.meta?.target,
      },
    });
    return;
  }

  if (err?.code === 'P2025') {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested record was not found.',
      },
    });
    return;
  }

  const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
    ? err.statusCode
    : 500;

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 ? 'An internal server error occurred' : err.message || 'Error processing request',
    },
  });
}
