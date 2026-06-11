import { prisma } from '../lib/prisma';

const CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_CODE_LENGTH = 6;
const MAX_RETRIES = 10;

/**
 * Generate a random short code
 */
export const generateRandomCode = (
  length: number = DEFAULT_CODE_LENGTH,
): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
};

/**
 * Check if a short code exists in the database
 */
export const isCodeAvailable = async (shortCode: string): Promise<boolean> => {
  const existingUrl = await prisma.url.findUnique({
    where: { shortCode },
  });
  return !existingUrl;
};

/**
 * Modify a short code if it's taken by adding a number suffix
 */
export const modifyCodeIfTaken = async (shortCode: string): Promise<string> => {
  let modifiedCode = shortCode;
  let suffix = 1;

  while (suffix <= MAX_RETRIES) {
    const available = await isCodeAvailable(modifiedCode);
    if (available) {
      return modifiedCode;
    }
    modifiedCode = `${shortCode}${suffix}`;
    suffix++;
  }

  // If all retries failed, generate a random code
  return generateUniqueCode();
};

/**
 * Generate a unique short code (with collision detection)
 */
export const generateUniqueCode = async (
  length: number = DEFAULT_CODE_LENGTH,
): Promise<string> => {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    const code = generateRandomCode(length);
    const available = await isCodeAvailable(code);

    if (available) {
      return code;
    }

    attempts++;
  }

  // If all retries failed with the same length, try with longer code
  if (length < 10) {
    return generateUniqueCode(length + 1);
  }

  throw new Error(
    'Failed to generate unique short code after multiple attempts',
  );
};

/**
 * Get or generate a short code
 * - If user provides a code, check if available, modify if taken
 * - If no code provided, generate a unique one
 */
export const getShortCode = async (
  userProvidedCode?: string,
): Promise<string> => {
  if (userProvidedCode) {
    return await modifyCodeIfTaken(userProvidedCode);
  }

  return await generateUniqueCode();
};
