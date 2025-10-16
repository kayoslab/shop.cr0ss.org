/**
 * Returns an absolute base URL (no trailing slash).
 * Safe for ISR/background revalidation (doesn't use headers()).
 *
 * Priority:
 * 1) NEXT_PUBLIC_BASE_PATH  (set this to your canonical https://host in prod)
 * 2) VERCEL_BRANCH_URL / VERCEL_URL (provided by Vercel)
 * 3) http://127.0.0.1:<PORT> (local dev)
 */
export function absoluteBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const vercel =
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL; // e.g. my-app.vercel.app
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '');
    return `https://${host}`;
  }

  const port = process.env.PORT || '3000';
  return `http://127.0.0.1:${port}`;
}
