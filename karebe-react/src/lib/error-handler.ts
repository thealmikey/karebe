/**
 * Global Error Handler for Karebe React Application
 * Provides error categorization, retry logic, and user-friendly error messages
 */

export interface ErrorConfig {
  code: string;
  retryable: boolean;
  userMessage: string;
  statusCode?: number;
}

export interface ErrorDisplay {
  title: string;
  message: string;
  retryable: boolean;
  supportLink?: string;
  code?: string;
}

// Predefined error configurations
const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  // Network errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    retryable: true,
    userMessage: 'Unable to connect to the server. Please check your internet connection.',
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    retryable: true,
    userMessage: 'The request took too long. Please try again.',
  },
  
  // API errors
  API_ERROR: {
    code: 'API_ERROR',
    retryable: true,
    userMessage: 'Something went wrong with our server. Please try again.',
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    retryable: true,
    userMessage: 'Server is experiencing issues. Please try again later.',
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    retryable: false,
    userMessage: 'Invalid request. Please refresh and try again.',
    statusCode: 400,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    retryable: false,
    userMessage: 'Please log in to continue.',
    statusCode: 401,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    retryable: false,
    userMessage: "You don't have permission to access this resource.",
    statusCode: 403,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    retryable: false,
    userMessage: 'The requested resource was not found.',
    statusCode: 404,
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    retryable: true,
    userMessage: 'Too many requests. Please wait a moment and try again.',
    statusCode: 429,
  },
  
  // Supabase errors
  SUPABASE_ERROR: {
    code: 'SUPABASE_ERROR',
    retryable: true,
    userMessage: 'Database connection issue. Please try again.',
  },
  AUTH_ERROR: {
    code: 'AUTH_ERROR',
    retryable: false,
    userMessage: 'Authentication failed. Please log in again.',
  },
  
  // Generic
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    retryable: true,
    userMessage: 'An unexpected error occurred. Please try again.',
  },
};

/**
 * Determine if an error is retryable based on type and status
 */
export function isErrorRetryable(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true; // Network error
  }
  
  if (error instanceof Response) {
    const status = error.status;
    // Retry on 5xx errors, 429, or network failures
    return status >= 500 || status === 429 || status === 0;
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    if (err['retryable'] === true) return true;
    if (typeof err['status'] === 'number') {
      const status = err['status'] as number;
      return status >= 500 || status === 429;
    }
  }
  
  return false;
}

/**
 * Get error configuration by code
 */
export function getErrorConfig(code: string): ErrorConfig {
  return ERROR_CONFIGS[code] || ERROR_CONFIGS.UNKNOWN_ERROR;
}

/**
 * Convert error to user-friendly display
 */
export function getErrorDisplay(error: unknown): ErrorDisplay {
  // Handle Response errors
  if (error instanceof Response) {
    const status = error.status;
    
    if (status === 401) return {
      title: 'Session Expired',
      message: ERROR_CONFIGS.UNAUTHORIZED.userMessage,
      retryable: false,
      supportLink: '/admin/login',
      code: 'UNAUTHORIZED',
    };
    
    if (status === 403) return {
      title: 'Access Denied',
      message: ERROR_CONFIGS.FORBIDDEN.userMessage,
      retryable: false,
      code: 'FORBIDDEN',
    };
    
    if (status === 404) return {
      title: 'Not Found',
      message: ERROR_CONFIGS.NOT_FOUND.userMessage,
      retryable: false,
      code: 'NOT_FOUND',
    };
    
    if (status === 429) return {
      title: 'Too Many Requests',
      message: ERROR_CONFIGS.RATE_LIMITED.userMessage,
      retryable: true,
      code: 'RATE_LIMITED',
    };
    
    if (status >= 500) return {
      title: 'Server Error',
      message: ERROR_CONFIGS.SERVER_ERROR.userMessage,
      retryable: true,
      code: 'SERVER_ERROR',
    };
    
    if (status >= 400) return {
      title: 'Request Failed',
      message: ERROR_CONFIGS.BAD_REQUEST.userMessage,
      retryable: false,
      code: 'BAD_REQUEST',
    };
  }
  
  // Handle TypeError (network errors)
  if (error instanceof TypeError) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        title: 'Connection Failed',
        message: ERROR_CONFIGS.NETWORK_ERROR.userMessage,
        retryable: true,
        code: 'NETWORK_ERROR',
      };
    }
    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: ERROR_CONFIGS.TIMEOUT.userMessage,
        retryable: true,
        code: 'TIMEOUT',
      };
    }
  }
  
  // Handle custom error objects
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    if (err['code']) {
      const config = getErrorConfig(err['code'] as string);
      return {
        title: formatErrorTitle(err['code'] as string),
        message: err['message'] as string || config.userMessage,
        retryable: config.retryable,
        code: config.code,
      };
    }
    
    if (err['message']) {
      return {
        title: 'Error',
        message: err['message'] as string,
        retryable: isErrorRetryable(error),
        code: 'UNKNOWN_ERROR',
      };
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      retryable: false,
      code: 'UNKNOWN_ERROR',
    };
  }
  
  // Default fallback
  return {
    title: 'Something Went Wrong',
    message: ERROR_CONFIGS.UNKNOWN_ERROR.userMessage,
    retryable: true,
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Format error code to title
 */
function formatErrorTitle(code: string): string {
  return code
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());
}

/**
 * Calculate exponential backoff delay
 */
export function getBackoffDelay(attempt: number, baseDelay: number = 1000, maxDelay: number = 10000): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add random jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!isErrorRetryable(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      
      const delay = getBackoffDelay(attempt, baseDelay);
      console.log(`[ErrorHandler] Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandler(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[GlobalErrorHandler] Unhandled promise rejection:', event.reason);
    // Don't prevent default - let the ErrorBoundary handle it
  });
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('[GlobalErrorHandler] Uncaught error:', event.error);
  });
  
  console.log('[GlobalErrorHandler] Error handlers initialized');
}