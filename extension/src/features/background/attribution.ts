/**
 * Single source of truth for Unsplash attribution (brand + referral URLs).
 * Keeps author-credit components free of inline hardcoded URLs / strings.
 */

const UNSPLASH_BASE_URL = 'https://unsplash.com',
  UNSPLASH_REFERRAL_MEDIUM = 'referral',
  UNSPLASH_REFERRAL_SOURCE = 'TabDash';

/**
 * Appends Unsplash referral params to any Unsplash URL.
 * Falls back to the Unsplash homepage when the given URL is empty.
 */
function withUnsplashAttribution(url?: string | null): string {
  const base = url?.trim() ? url.trim() : UNSPLASH_BASE_URL,
    separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}utm_source=${UNSPLASH_REFERRAL_SOURCE}&utm_medium=${UNSPLASH_REFERRAL_MEDIUM}`;
}

/** Direct link to the Unsplash homepage with referral params. */
function unsplashHomepageUrl(): string {
  return withUnsplashAttribution(UNSPLASH_BASE_URL);
}

/**
 * Readable text shadow so the credit stays legible over bright/busy photos,
 * independent of the user-configured widget shadow (which may be transparent).
 */
const AUTHOR_CREDIT_TEXT_SHADOW = '0 1px 3px var(--author-credit-shadow)';

export {
  AUTHOR_CREDIT_TEXT_SHADOW,
  UNSPLASH_BASE_URL,
  UNSPLASH_REFERRAL_MEDIUM,
  UNSPLASH_REFERRAL_SOURCE,
  unsplashHomepageUrl,
  withUnsplashAttribution,
};
