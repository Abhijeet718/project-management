import { ApiError } from "../utils/apiError.js";

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const isApiError = error instanceof ApiError;
  const isMulterError = error?.name === "MulterError";
  const statusCode = isApiError && Number.isInteger(error.statusCode)
    ? Math.min(Math.max(error.statusCode, 400), 599)
    : error?.code === 11000
      ? 409
      : error?.name === "CastError"
        ? 400
        : error?.name === "ValidationError"
          ? 422
          : isMulterError
            ? (error.code === "LIMIT_FILE_SIZE" ? 413 : 400)
            : 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message = statusCode >= 500 && isProduction
    ? "Internal Server Error"
    : isMulterError
      ? error.code === "LIMIT_FILE_SIZE"
        ? "Attachment exceeds the 10 MB size limit"
        : "Invalid file upload"
      : error?.code === 11000
        ? "A resource with this value already exists"
        : error?.name === "CastError"
          ? "Invalid resource identifier"
          : error?.name === "ValidationError"
            ? "Database validation failed"
            : (error.message || "Internal Server Error");
  const errors = isApiError && statusCode < 500 && Array.isArray(error.errors)
    ? error.errors
    : [];

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors,
  });
};
