import { ApiError } from './api-error';

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const errObj = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    const status = errObj.response?.status || 500;
    const message = errObj.response?.data?.message || errObj.message || 'An unexpected API error occurred.';
    return new ApiError(message, status);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError('An unknown error occurred.', 500);
}
