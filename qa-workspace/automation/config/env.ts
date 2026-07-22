/**
 * Centralised environment configuration.
 * Loads .env (first side effect) then reads process.env. The suite refuses to run real tests
 * against a placeholder URL so we never produce fake results (engagement principle:
 * never fabricate execution evidence).
 */
import 'dotenv/config';

/** Read an env var, trimming whitespace and stripping accidental surrounding quotes. */
function required(name: string, fallback = ''): string {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return raw.trim().replace(/^["']|["']$/g, '');
}

/** Strip a single trailing slash so URL joins don't produce `//`. */
function noTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

const baseURL = noTrailingSlash(required('BASE_URL'));
const apiBaseURL = noTrailingSlash(required('API_BASE_URL') || baseURL);

export const env = {
  baseURL,
  apiBaseURL,
  pimBaseURL: noTrailingSlash(required('PIM_BASE_URL')),

  // Multi-tenant: the business to select after login + the country scope for statutory queries.
  businessName: required('BUSINESS_NAME'),
  countryId: required('COUNTRY_ID', '84'),

  roles: {
    admin: {
      identifier: required('ADMIN_IDENTIFIER'),
      password: required('ADMIN_PASSWORD'),
    },
    manager: {
      identifier: required('MANAGER_IDENTIFIER'),
      password: required('MANAGER_PASSWORD'),
    },
    staff: {
      identifier: required('STAFF_IDENTIFIER'),
      password: required('STAFF_PASSWORD'),
    },
  },

  headless: required('HEADLESS', 'true') !== 'false',
  workers: Number(required('WORKERS', '4')),
} as const;

export type RoleName = keyof typeof env.roles;

/** Which roles actually have credentials configured (admin-only is fine — others mark Blocked). */
export function hasRole(role: RoleName): boolean {
  return !!env.roles[role].identifier && !!env.roles[role].password;
}

/** True once a real target + admin credentials are supplied. Specs guard on this. */
export const isAppConfigured =
  !!env.baseURL && !env.baseURL.includes('example.invalid') && hasRole('admin');
