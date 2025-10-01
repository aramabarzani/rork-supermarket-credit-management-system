export const trpc = null;
export const trpcClient = null;

export function isTRPCNetworkError(error: unknown): boolean {
  return false;
}

export function getTRPCErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'هەڵەیەکی نەزانراو ڕوویدا';
}
