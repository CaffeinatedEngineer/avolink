/**
 * Error handling utilities for smart contract and Supabase integration
 */

export interface ErrorInfo {
  title: string;
  message: string;
  type: 'contract' | 'supabase' | 'network' | 'validation' | 'unknown';
  retryable: boolean;
  userAction?: string;
}

export function parseError(error: any): ErrorInfo {
  // Handle contract errors
  if (error.code) {
    switch (error.code) {
      case 'CALL_EXCEPTION':
        return {
          title: 'Contract Call Failed',
          message: 'The smart contract function call failed. Please check your input and try again.',
          type: 'contract',
          retryable: true,
          userAction: 'Verify your input values and wallet connection'
        };
      
      case 'UNPREDICTABLE_GAS_LIMIT':
        return {
          title: 'Gas Estimation Failed',
          message: 'Cannot estimate gas for this transaction. It may fail.',
          type: 'contract',
          retryable: true,
          userAction: 'Check your wallet balance and contract parameters'
        };
      
      case 'INSUFFICIENT_FUNDS':
        return {
          title: 'Insufficient Funds',
          message: 'You don\'t have enough AVAX to complete this transaction.',
          type: 'contract',
          retryable: false,
          userAction: 'Add more AVAX to your wallet'
        };
      
      case 'USER_REJECTED':
        return {
          title: 'Transaction Rejected',
          message: 'You rejected the transaction in your wallet.',
          type: 'contract',
          retryable: true,
          userAction: 'Try again and approve the transaction'
        };
        
      case 'NETWORK_ERROR':
        return {
          title: 'Network Error',
          message: 'Connection to the blockchain network failed.',
          type: 'network',
          retryable: true,
          userAction: 'Check your internet connection and try again'
        };
    }
  }

  // Handle Supabase errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('supabase')) {
    return {
      title: 'Database Error',
      message: 'Failed to connect to the database. Event caching may not work.',
      type: 'supabase',
      retryable: true,
      userAction: 'The blockchain transaction may still succeed. Check your events later.'
    };
  }

  // Handle validation errors
  if (error.message?.includes('required') || error.message?.includes('invalid')) {
    return {
      title: 'Validation Error',
      message: error.message || 'Please check your input values.',
      type: 'validation',
      retryable: false,
      userAction: 'Correct the highlighted fields and try again'
    };
  }

  // Handle network switching errors
  if (error.message?.includes('chain') || error.message?.includes('network')) {
    return {
      title: 'Wrong Network',
      message: 'Please switch to the Avalanche Fuji Testnet.',
      type: 'network',
      retryable: true,
      userAction: 'Switch networks in your wallet'
    };
  }

  // Default error
  return {
    title: 'Unknown Error',
    message: error.message || 'An unexpected error occurred.',
    type: 'unknown',
    retryable: true,
    userAction: 'Please try again or contact support if the issue persists'
  };
}

export function getErrorMessage(error: any): string {
  const errorInfo = parseError(error);
  return errorInfo.message;
}

export function getErrorTitle(error: any): string {
  const errorInfo = parseError(error);
  return errorInfo.title;
}

export function isRetryableError(error: any): boolean {
  const errorInfo = parseError(error);
  return errorInfo.retryable;
}

export function getUserAction(error: any): string | undefined {
  const errorInfo = parseError(error);
  return errorInfo.userAction;
}

// Helper to safely execute async operations with error handling
export async function safeExecute<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ success: boolean; data?: T; error?: ErrorInfo }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorInfo = parseError(error);
    console.error('Operation failed:', errorInfo);
    
    return { 
      success: false, 
      error: errorInfo, 
      data: fallback 
    };
  }
}
