/**
 * Frontend runtime/build configuration.
 *
 * Vite exposes env vars at build time via `import.meta.env.*`.
 * We intentionally fail fast if required config is missing to avoid
 * silently pointing production builds at localhost.
 */
function requireViteEnv(name: string): string {
  const v = (import.meta as any).env?.[name] as string | undefined;
  if (!v || typeof v !== 'string' || v.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const API_URL = requireViteEnv('VITE_API_URL').replace(/\/+$/, '');

