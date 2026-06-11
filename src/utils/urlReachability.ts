const REACHABILITY_TIMEOUT = 10000; // 10 seconds
const ALLOWED_STATUS_CODES = [
  200, 201, 202, 203, 204, 205, 206, 301, 302, 303, 307, 308,
];

/**
 * Check if a URL is reachable and returns a valid response
 */
export const isUrlReachable = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      REACHABILITY_TIMEOUT,
    );

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'URL-Shortener-Service/1.0',
      },
    });

    clearTimeout(timeoutId);

    // Consider redirect status codes as reachable
    return ALLOWED_STATUS_CODES.includes(response.status);
  } catch {
    // If HEAD fails, try GET as some servers don't support HEAD
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        REACHABILITY_TIMEOUT,
      );

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'URL-Shortener-Service/1.0',
        },
      });

      clearTimeout(timeoutId);

      return ALLOWED_STATUS_CODES.includes(response.status);
    } catch {
      return false;
    }
  }
};
