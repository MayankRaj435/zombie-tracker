/**
 * Centralized environment variable access.
 *
 * In production we prefer failing fast (crash on boot) if required
 * variables are missing rather than silently falling back to insecure defaults.
 */
export type NodeEnv = 'development' | 'test' | 'production';

function readEnv(name: string): string | undefined {
  const v = process.env[name];
  if (v === undefined) return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireEnv(name: string): string {
  const v = readEnv(name);
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  NODE_ENV: (readEnv('NODE_ENV') as NodeEnv | undefined) ?? 'development',

  // Server
  PORT: Number(readEnv('PORT') ?? '3001'),

  // Core secrets (required for any environment where you run the backend)
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  ENCRYPTION_KEY: requireEnv('ENCRYPTION_KEY'),

  // Frontend origin (required in production to lock down CORS)
  FRONTEND_URL: readEnv('FRONTEND_URL'),

  // JWT configuration (optional)
  JWT_EXPIRES_IN: readEnv('JWT_EXPIRES_IN') ?? '24h',
};

export function assertProductionEnv() {
  if (env.NODE_ENV === 'production' && !env.FRONTEND_URL) {
    throw new Error('Missing required environment variable in production: FRONTEND_URL');
  }
}

