/**
 * Utility to wrapper Gemini API calls with robust exponential-backoff retry logic.
 * This is designed to gracefully handle Google GenAI 503 (temporary high demand)
 * and 429 (rate limiting/quota reached) transient errors.
 */
export async function withGeminiRetry<T>(
  apiCallFn: () => Promise<T>,
  retries = 3,
  delayMs = 2000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await apiCallFn();
    } catch (error: any) {
      attempt++;
      console.error(`[Gemini Retry] Call failed on attempt ${attempt} of ${retries}:`, error?.message || error);
      
      const errorStr = (error?.message || "").toLowerCase() + " " + JSON.stringify(error).toLowerCase();
      
      // Determine if the error is a transient failure (503 / 429 / resource exhausted / temporary)
      const isTransient = 
        error?.status === 503 || 
        error?.status === 429 ||
        error?.code === 503 ||
        error?.code === 429 ||
        errorStr.includes("503") ||
        errorStr.includes("429") ||
        errorStr.includes("unavailable") ||
        errorStr.includes("high demand") ||
        errorStr.includes("temporary") ||
        errorStr.includes("spikes in demand") ||
        errorStr.includes("exhausted");

      if (isTransient && attempt < retries) {
        const nextDelay = delayMs * Math.pow(2, attempt - 1);
        console.log(`[Gemini Retry] Retrying in ${nextDelay}ms due to transient server overload...`);
        await new Promise((resolve) => setTimeout(resolve, nextDelay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Gemini execution failed after retries");
}
