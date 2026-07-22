/**
 * api-client.ts — authenticated API access for the Kedebah Payroll API.
 *
 * Auth model (confirmed by recon): the API is token-protected, NOT pure cookie session:
 *   - Authorization: Bearer <token>   (the token is stored in the `accessToken` cookie)
 *   - X-Tenant-Id: <tenant>           (the per-business tenant; = last `|`-segment of the token)
 *   - Accept: application/json
 * The raw cookie session alone yields HTTP 500 — these headers are required.
 *
 * Build one from a saved storage state (fixtures/.auth/<role>.json), which contains the cookies.
 */

import { APIRequestContext, request as pwRequest, expect } from '@playwright/test';
import { env } from '../config/env.js';
import { readFile } from 'node:fs/promises';

interface StorageState {
  cookies: { name: string; value: string }[];
}

/** Extract the Bearer token, tenant id, and CSRF token from a saved storage state's cookies. */
export async function authFromState(statePath: string): Promise<{ token: string; tenantId: string; xsrf: string }> {
  const state = JSON.parse(await readFile(statePath, 'utf8')) as StorageState;
  const raw = state.cookies.find((c) => c.name === 'accessToken')?.value ?? '';
  const token = decodeURIComponent(raw);
  const tenantId = token.split('|').pop() ?? '';
  const xsrf = decodeURIComponent(state.cookies.find((c) => c.name === 'XSRF-TOKEN')?.value ?? '');
  if (!token) throw new Error(`No accessToken cookie in ${statePath} — run the auth setup first.`);
  return { token, tenantId, xsrf };
}

export class ApiClient {
  private constructor(
    private readonly ctx: APIRequestContext,
    readonly tenantId: string,
  ) {}

  /** Create an authenticated client from a role's saved storage state. */
  static async fromState(statePath = 'fixtures/.auth/admin.json'): Promise<ApiClient> {
    const { token, tenantId, xsrf } = await authFromState(statePath);
    const ctx = await pwRequest.newContext({
      // No baseURL: a leading-slash path resolves against the ORIGIN and would drop /api/v1/payrollApi.
      // We build absolute URLs in url() instead.
      storageState: statePath, // include session cookies alongside the Bearer/tenant headers
      // Writes (employee/run create) trigger server-side side-effects and can exceed the default
      // action timeout; give API calls a generous ceiling so slow-but-valid writes don't false-fail.
      timeout: 60_000,
      extraHTTPHeaders: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
        'X-Requested-With': 'XMLHttpRequest',
        // POST/PUT/DELETE writes are CSRF-guarded; the header must echo the XSRF-TOKEN cookie.
        ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
      },
    });
    return new ApiClient(ctx, tenantId);
  }

  /** Build an absolute API URL (path may start with `/`). */
  private url(path: string): string {
    return `${env.apiBaseURL}${path.startsWith('/') ? path : `/${path}`}`;
  }

  get = (path: string) => this.ctx.get(this.url(path));
  post = (path: string, data?: unknown) => this.ctx.post(this.url(path), { data });
  put = (path: string, data?: unknown) => this.ctx.put(this.url(path), { data });
  delete = (path: string) => this.ctx.delete(this.url(path));

  /** GET and parse JSON, unwrapping the common `{ data: ... }` envelope. */
  async json<T = unknown>(path: string): Promise<T> {
    const res = await this.get(path);
    expect(res.ok(), `GET ${path} → ${res.status()}`).toBeTruthy();
    const body = await res.json();
    return (body?.data ?? body) as T;
  }

  /** Call any method WITHOUT asserting; returns status + parsed body + unwrapped data.
   *  Use for writes and for probing endpoints where non-2xx is an expected outcome. */
  async call(method: 'get' | 'post' | 'put' | 'delete', path: string, data?: unknown):
    Promise<{ status: number; ok: boolean; body: any; data: any }> {
    const res = await (method === 'get' || method === 'delete' ? this[method](path) : this[method](path, data));
    let body: any = null;
    try { body = await res.json(); } catch { /* non-JSON (HTML fallback) */ }
    return { status: res.status(), ok: res.ok(), body, data: body?.data ?? body };
  }

  /** Assert a route is forbidden for the current token — the security boundary (SEC-001). */
  async expectForbidden(method: 'get' | 'post' | 'put' | 'delete', path: string, data?: unknown) {
    const res = await (method === 'get' || method === 'delete' ? this[method](path) : this[method](path, data));
    expect([401, 403], `expected auth failure on ${method.toUpperCase()} ${path}`).toContain(res.status());
  }

  async dispose() {
    await this.ctx.dispose();
  }
}
