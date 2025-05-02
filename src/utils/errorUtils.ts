
/**
 * Safely formats an error for display in the UI
 * @param error Any type of error that needs to be displayed
 * @returns A string representing the error message
 */
export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message || 'An unknown error occurred';
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Determines if a value is an Error object
 * @param error The value to check
 * @returns True if the value is an Error object
 */
export function isErrorObject(error: unknown): error is Error {
  return error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error);
}

/**
 * Converts any error type to a proper Error object
 * @param error The error to convert
 * @returns An Error object
 */
export function toErrorObject(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  const message = typeof error === 'string' 
    ? error 
    : error && typeof error === 'object' && 'message' in error 
      ? String(error.message) 
      : 'Unknown error';
      
  return new Error(message);
}
