/**
 * Single source of truth for Unsplash attribution (brand + referral URLs).
 * Keeps author-credit components free of inline hardcoded URLs / strings.
 */

export const UNSPLASH_BASE_URL = 'https://unsplash.com';

export const UNSPLASH_REFERRAL_SOURCE = 'TabDash';
export const UNSPLASH_REFERRAL_MEDIUM = 'referral';

/**
 * Appends Unsplash referral params to any Unsplash URL.
 * Falls back to the Unsplash homepage when the given URL is empty.
 */
export function withUnsplashAttribution(url?: string | null): string {
  const base = url?.trim() ? url.trim() : UNSPLASH_BASE_URL;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}utm_source=${UNSPLASH_REFERRAL_SOURCE}&utm_medium=${UNSPLASH_REFERRAL_MEDIUM}`;
}

/** Direct link to the Unsplash homepage with referral params. */
export function unsplashHomepageUrl(): string {
  return withUnsplashAttribution(UNSPLASH_BASE_URL);
}

/**
 * Readable text shadow so the credit stays legible over bright/busy photos,
 * independent of the user-configured widget shadow (which may be transparent).
 */
export const AUTHOR_CREDIT_TEXT_SHADOW = '0 1px 3px var(--author-credit-shadow)';
