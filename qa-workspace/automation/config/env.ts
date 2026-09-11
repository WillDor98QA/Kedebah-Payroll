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

  /**
   * BETA environment (2026-09 onward). Separate enterprise-portal target used by
   * tests/browser/beta/*.browser.spec.ts. Specs guard on `isBetaConfigured`.
   *   BETA_BASE_URL      client sign-in, e.g. https://v2.kedebahlite.com/clients/sign-in
   *   BETA_PAYROLL_URL   payroll app root,  e.g. https://v2payroll.kedebahlite.com  (default derived)
   *   BETA_ADMIN / BETA_ADMIN_PASSWORD   admin creds
   *   BETA_BUSINESS      business to select at the module launcher (default 'Glenn and Co')
   */
  beta: {
    baseURL: noTrailingSlash(required('BETA_BASE_URL')),
    payrollURL: noTrailingSlash(required('BETA_PAYROLL_URL') || 'https://v2payroll.kedebahlite.com'),
    admin: { identifier: required('BETA_ADMIN'), password: required('BETA_ADMIN_PASSWORD') },
    // Non-admin QA personas (invitation passwords completed by the account holder). Optional —
    // beta-rbac-personas.browser.spec.ts skips per-persona when its pair is absent.
    manager: { identifier: required('BETA_MANAGER'), password: required('BETA_MANAGER_PASSWORD') },
    employee: { identifier: required('BETA_EMPLOYEE'), password: required('BETA_EMPLOYEE_PASSWORD') },
    report: { identifier: required('BETA_REPORT'), password: required('BETA_REPORT_PASSWORD') },
    adminNew: { identifier: required('BETA_ADMINNEW'), password: required('BETA_ADMINNEW_PASSWORD') },
    business: required('BETA_BUSINESS', 'Glenn and Co'),
    apiBaseURL: noTrailingSlash(required('BETA_API_BASE_URL') || 'https://v2payroll.kedebahlite.com/api/v1/payrollApi'),
  },
} as const;

export type RoleName = keyof typeof env.roles;

/** Which roles actually have credentials configured (admin-only is fine — others mark Blocked). */
export function hasRole(role: RoleName): boolean {
  return !!env.roles[role].identifier && !!env.roles[role].password;
}

/** True once a real target + admin credentials are supplied. Specs guard on this. */
export const isAppConfigured =
  !!env.baseURL && !env.baseURL.includes('example.invalid') && hasRole('admin');

/** True once the BETA enterprise target + admin creds are supplied. tests/browser/beta/* guard on this. */
export const isBetaConfigured =
  !!env.beta.baseURL && !!env.beta.admin.identifier && !!env.beta.admin.password;
