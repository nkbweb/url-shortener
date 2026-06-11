import { z } from 'zod';

// List of blocked domains and patterns
const BLOCKED_DOMAINS = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

const BLOCKED_PATTERNS = [
  /^192\.168\./, // Private IP range
  /^10\./, // Private IP range
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private IP range
  /^169\.254\./, // Link-local
];

// Reserved short codes that should not be used
const RESERVED_SHORT_CODES = [
  'admin',
  'login',
  'logout',
  'register',
  'api',
  'pricing',
  'about',
  'contact',
  'help',
  'support',
  'dashboard',
  'settings',
  'profile',
  'auth',
  'health',
  'status',
  'metrics',
];

const isBlockedDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check exact blocked domains
    if (BLOCKED_DOMAINS.includes(hostname)) {
      return true;
    }

    // Check blocked IP patterns
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(hostname)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
};

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'URL is required')
    .max(2048, 'URL must be less than 2048 characters')
    .url('Invalid URL format')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must use http or https protocol',
    )
    .refine(
      (url) => !isBlockedDomain(url),
      'URL contains blocked domain or internal IP address',
    ),
  shortCode: z
    .string()
    .min(3, 'Short code must be at least 3 characters')
    .max(20, 'Short code must be less than 20 characters')
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Short code can only contain letters, numbers, hyphens, and underscores',
    )
    .refine(
      (code) => !RESERVED_SHORT_CODES.includes(code.toLowerCase()),
      'This short code is reserved and cannot be used',
    )
    .refine((code) => !code.includes(' '), 'Short code cannot contain spaces')
    .optional(),
});

export const redirectSchema = z.object({
  shortCode: z.string().min(1, 'Short code is required'),
});
