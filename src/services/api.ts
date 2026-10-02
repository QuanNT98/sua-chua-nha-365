/**
 * API layer — port of getPort / buildUrl / apiFetch and every CRUD call in
 * docs/index.html.
 *
 * URL: http://inka.vn:{8000 + (hex(root) & 0x3F)}/api/{ctrl}/{root}{k1}{k2}{k3}{query}
 * Response: { status: 'ok' | ..., data, error }
 *
 * Unlike the web app, each call receives its own request options instead of
 * mutating a shared global (S.ctrl / S.root / S.k1 ...). That removes the bug
 * where a leftover k1 or query leaked into later requests.
 *
 * Offline behaviour: GET falls back to the last cached response. Anything else
 * fails, so the app never reports a write that did not reach the server.
 * (The in-memory mock is only used when setMockMode(true) is on.)
 */
import { clearCookies, httpRequest } from './http';
import { mockListJoinRequests, mockRequest, mockResolveJoinRequest, setMockUser } from './mock';
import { cacheGet, cacheSet } from './storage';
import type {
  ApiEnvelope, ColumnConfig, ColumnType, DataSource, Database, JoinRequest, Member, RecordContent, RecordItem,
  RequestOptions, Role, Table, TableData, TableMeta,
} from '../types';
import { COLUMN_TYPES } from '../types';

const HOST = 'http://inka.vn';
const BASE_PORT = 8000;
const TIMEOUT_MS = 8000;
const LIST_QUERY = '?limit=255';

/* ── Connection state (observed by AppContext) ── */
export interface ConnectionInfo {
  source: DataSource;
  lastError?: string;
  at: number;
}

let connection: ConnectionInfo = { source: 'server', at: Date.now() };
let mockMode = false;
const listeners = new Set<(c: ConnectionInfo) => void>();
let logger: (msg: string, ok: boolean) => void = () => {};

function setConnection(source: DataSource, lastError?: string) {
  connection = { source, lastError, at: Date.now() };
  listeners.forEach((l) => l(connection));
}

export const getConnection = () => connection;
export function onConnectionChange(fn: (c: ConnectionInfo) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export const setApiLogger = (fn: (msg: string, ok: boolean) => void) => {
  logger = fn;
};
export const setApiUser = (userId: string) => setMockUser(userId);

/** Force every request through the mock (demo mode). */
export function setMockMode(on: boolean) {
  mockMode = on;
  setConnection(on ? 'mock' : 'server');
}
export const isMockMode = () => mockMode;

/* ── URL ── */
export function getPort(root = ''): string {
  try {
    const c = Number(BigInt('0x' + (root || '0')) & BigInt(0x3f));
    return `${HOST}:${BASE_PORT + c}/api`;
  } catch {
    return `${HOST}:${BASE_PORT}/api`;
  }
}

export const buildPath = (o: RequestOptions) =>
  `/${o.ctrl}/${o.root}${(o.keys ?? []).join('')}${o.query ?? ''}`;

export const buildUrl = (o: RequestOptions) => `${getPort(o.root)}${buildPath(o)}`;

/* ── Transport ── */
export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  source: DataSource;
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function toResult<T>(json: ApiEnvelope | null, source: DataSource): ApiResult<T> {
  if (!json) return { ok: false, error: 'Phản hồi không hợp lệ từ server', source };
  return json.status === 'ok'
    ? { ok: true, data: json.data as T, source }
    : { ok: false, error: json.error || 'API lỗi', source };
}

async function viaMock<T>(o: RequestOptions, reason?: string): Promise<ApiResult<T>> {
  setConnection('mock', reason);
  return toResult<T>(await mockRequest(o), 'mock');
}

export async function apiFetch<T>(o: RequestOptions): Promise<ApiResult<T>> {
  const path = buildPath(o);
  if (mockMode) return viaMock<T>(o);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const body = o.body !== undefined && o.method !== 'GET' ? JSON.stringify(o.body) : undefined;

  try {
    const res = await httpRequest(buildUrl(o), {
      method: o.method,
      headers: { 'Content-Type': 'application/json' },
      body,
      timeoutMs: TIMEOUT_MS,
      signal: controller.signal,
    });
    const json = parseJson<ApiEnvelope>(res.text);
    setConnection('server');
    logger(`${o.method} ${res.status} → /api${path}`, res.status < 400);
    if (o.method === 'GET' && json?.status === 'ok') void cacheSet(path, json);
    return toResult<T>(json, 'server');
  } catch (e) {
    const reason = controller.signal.aborted ? 'Hết thời gian chờ server' : e instanceof Error ? e.message : String(e);
    logger(`${o.method} /api${path} — ${reason}`, false);

    if (o.method === 'GET') {
      const cached = await cacheGet<ApiEnvelope>(path);
      if (cached) {
        setConnection('cache', reason);
        return toResult<T>(cached, 'cache');
      }
    }
    setConnection('server', reason);
    return { ok: false, error: reason, source: 'server' };
  } finally {
    clearTimeout(timer);
  }
}

/* ── Helpers ── */
export class ApiError extends Error {
  constructor(public readonly code: string) {
    super(ERROR_MESSAGES[code] ?? code);
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  null_handle: 'Không có dữ liệu',
  not_record: 'Table chưa có bản ghi',
  not_found: 'Không tìm thấy (nếu đang offline, dữ liệu cache không thể sửa)',
  api_pending: 'Server chưa hỗ trợ tính năng này',
};

/** Call and unwrap. Error codes listed in `emptyOn` mean "no data" and return null. */
async function call<T>(o: RequestOptions, emptyOn: string[] = []): Promise<T | null> {
  const r = await apiFetch<T>(o);
  if (r.ok) return (r.data ?? null) as T | null;
  if (r.error && emptyOn.includes(r.error)) return null;
  throw new ApiError(r.error || 'API lỗi');
}

async function mustCall<T>(o: RequestOptions): Promise<T> {
  return (await call<T>(o)) ?? ({} as T);
}

const asArray = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/**
 * Names are rendered as text, but the server stores whatever it was sent: a role in
 * production has an object as role_name, which crashed the release build to a black
 * screen. Anything that is not a string (or number) gets a readable fallback.
 */
const nameOr = (v: unknown, fallback: string): string =>
  typeof v === 'string' && v.trim() ? v : typeof v === 'number' ? String(v) : fallback;
const shortId = (id: unknown) => (typeof id === 'string' ? id.replace(/^0+/, '').slice(-6) || '0' : '?');

/** Metadata values that are not objects become { type: 'string' }, like the web app. */
export function normalizeMeta(content: unknown): TableMeta {
  const meta: TableMeta = {};
  if (!content || typeof content !== 'object') return meta;
  for (const [k, v] of Object.entries(content as Record<string, unknown>)) {
    const cfg = v && typeof v === 'object' ? (v as Partial<ColumnConfig>) : {};
    const type = (COLUMN_TYPES as readonly string[]).includes(String(cfg.type)) ? (cfg.type as ColumnType) : 'string';
    meta[k] = {
      type,
      ...(cfg.formula !== undefined && { formula: String(cfg.formula) }),
      ...(cfg.table !== undefined && { table: String(cfg.table) }),
      ...(cfg.display !== undefined && { display: String(cfg.display) }),
      ...(Array.isArray(cfg.values) && { values: cfg.values.map(String) }),
    };
  }
  return meta;
}

function toRecord(item: unknown): RecordItem | null {
  if (!item || typeof item !== 'object') return null;
  const r = item as { rc_id?: unknown; content?: unknown };
  if (!r.rc_id) return null;
  const content = r.content && typeof r.content === 'object' ? (r.content as RecordContent) : {};
  return { rc_id: String(r.rc_id), content };
}

/* ═════════════ Databases (/api/database) ═════════════ */
export const listDatabases = async (userId: string) =>
  asArray<Database>(await call({ method: 'GET', ctrl: 'database', root: userId, query: LIST_QUERY }, ['null_handle'])).map(
    (d) => ({ ...d, db_name: nameOr(d.db_name, `Database ${shortId(d.db_id)}`) }),
  );

export const createDatabase = (userId: string, name: string) =>
  mustCall<{ db_id: string }>({ method: 'POST', ctrl: 'database', root: userId, body: name });

export const renameDatabase = (dbId: string, name: string) =>
  mustCall<Database>({ method: 'PUT', ctrl: 'database', root: dbId, body: name });

export const saveDatabaseAuth = (dbId: string, authBody: object) =>
  mustCall<Database>({ method: 'PUT', ctrl: 'database', root: dbId, body: authBody });

/** Leave a database (the web app's "Rời DB"). */
export const leaveDatabase = (dbId: string) => mustCall({ method: 'DELETE', ctrl: 'database', root: dbId });

/** Owner/admin adds a user to the database by id. */
export const addDatabaseMember = (dbId: string, userId: string) =>
  mustCall<Member>({ method: 'PUT', ctrl: 'database', root: dbId, keys: [userId], body: 'admin' });

/** Request to join. Returns the database when accepted immediately, null when pending approval. */
export async function joinDatabase(dbId: string): Promise<Database | null> {
  const data = await mustCall<{ action?: string; db_name?: string } & Partial<Database>>({
    method: 'PUT', ctrl: 'member', root: dbId, body: 'user',
  });
  if (data.action !== 'member') return null;
  return { ...data, db_id: dbId, db_name: data.db_name ?? dbId, status: data.status ?? 'active' };
}

/* ═════════════ Join requests (private databases) ═════════════
 * Joining a public DB lets the user in at once (action "member"); a private DB
 * puts them on a waiting list for an admin to approve. The server has no
 * endpoints for that list yet: until it does, these work in Demo mode only.
 */
/** Flip to true and fill in the three calls below once the server exposes them. */
export const JOIN_REQUESTS_API_READY = false;

export const joinRequestsAvailable = () => mockMode || JOIN_REQUESTS_API_READY;

export async function listJoinRequests(dbId: string): Promise<JoinRequest[]> {
  if (mockMode) return mockListJoinRequests(dbId);
  throw new ApiError('api_pending');
}

export async function approveJoinRequest(dbId: string, userId: string): Promise<void> {
  if (mockMode) return mockResolveJoinRequest(dbId, userId, true);
  throw new ApiError('api_pending');
}

export async function rejectJoinRequest(dbId: string, userId: string): Promise<void> {
  if (mockMode) return mockResolveJoinRequest(dbId, userId, false);
  throw new ApiError('api_pending');
}

/* ═════════════ Tables (/api/table) ═════════════ */
/** The server stores "no role" as an all-zero id ("0000000000000000"); the app uses null. */
const roleOrNull = (id: string | null | undefined) => (id && !/^0+$/.test(id) ? id : null);

export const listTables = async (dbId: string) =>
  asArray<Table>(await call({ method: 'GET', ctrl: 'table', root: dbId, query: LIST_QUERY }, ['null_handle'])).map((t) => ({
    ...t,
    tbl_name: nameOr(t.tbl_name, `Table ${shortId(t.tbl_id)}`),
    role_read: roleOrNull(t.role_read),
    role_write: roleOrNull(t.role_write),
    role_edit: roleOrNull(t.role_edit),
    role_delete: roleOrNull(t.role_delete),
  }));

export const createTable = (dbId: string, name: string) =>
  mustCall<{ tbl_id: string }>({ method: 'POST', ctrl: 'table', root: dbId, body: name });

export const renameTable = (tblId: string, name: string) =>
  mustCall<Table>({ method: 'PUT', ctrl: 'table', root: tblId, body: name });

export const saveTableAuth = (tblId: string, payload: object) =>
  mustCall<Table>({ method: 'PUT', ctrl: 'table', root: tblId, body: payload });

export const deleteTable = (tblId: string) => mustCall({ method: 'DELETE', ctrl: 'table', root: tblId });

/* ═════════════ Records (/api/record, /api/metadata) ═════════════ */
/** data[0] is the metadata (column schema) record; the rest are data rows. */
export async function listRecords(tblId: string, limit = 255): Promise<TableData> {
  const data = asArray<unknown>(
    await call({ method: 'GET', ctrl: 'record', root: tblId, query: `?limit=${limit}` }, ['not_record', 'null_handle']),
  );
  const [first, ...rest] = data.map(toRecord).filter((r): r is RecordItem => r !== null);
  return {
    metaId: first?.rc_id ?? null,
    meta: normalizeMeta(first?.content),
    rows: rest,
  };
}

export const createRecord = (tblId: string, content: RecordContent) =>
  mustCall<{ rc_id: string }>({ method: 'POST', ctrl: 'record', root: tblId, body: content });

export const updateRecord = (rcId: string, content: RecordContent) =>
  mustCall({ method: 'PUT', ctrl: 'record', root: rcId, body: content });

export const deleteRecord = (rcId: string) => mustCall({ method: 'DELETE', ctrl: 'record', root: rcId });

export const updateMetadata = (tblId: string, meta: TableMeta) =>
  mustCall<{ rc_id: string }>({ method: 'PUT', ctrl: 'metadata', root: tblId, body: meta });

/* ═════════════ Members / Admins / Roles ═════════════ */
const cleanMembers = (list: Member[]) =>
  list.map((m) => ({ ...m, user_name: nameOr(m.user_name, `User ${shortId(m.user_id)}`) }));

export const listMembers = async (dbId: string) =>
  cleanMembers(asArray<Member>(await call({ method: 'GET', ctrl: 'member', root: dbId, query: LIST_QUERY }, ['null_handle'])));

export const removeMember = (dbId: string, userId: string) =>
  mustCall({ method: 'DELETE', ctrl: 'member', root: dbId, keys: [userId] });

export const listAdmins = async (dbId: string) =>
  cleanMembers(asArray<Member>(await call({ method: 'GET', ctrl: 'admin', root: dbId, query: LIST_QUERY }, ['null_handle'])));

export const addAdmin = (dbId: string, userId: string) =>
  mustCall<Member>({ method: 'POST', ctrl: 'admin', root: dbId, keys: [userId] });

export const removeAdmin = (dbId: string, userId: string) =>
  mustCall({ method: 'DELETE', ctrl: 'admin', root: dbId, keys: [userId] });

export const listRoles = async (dbId: string) =>
  asArray<Role>(await call({ method: 'GET', ctrl: 'role', root: dbId, query: LIST_QUERY }, ['null_handle'])).map((r) => ({
    ...r,
    role_name: nameOr(r.role_name, `Role #${shortId(r.role_id)}`),
    ...(!nameOr(r.role_name, '') && { invalid_name: true }),
  }));

export const createRole = (dbId: string, name: string) =>
  mustCall<{ role_id: string }>({ method: 'POST', ctrl: 'role', root: dbId, body: name });

/** Lightweight reachability check used by Settings. */
export async function ping(userId: string): Promise<{ reachable: boolean; ms: number; error?: string }> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await httpRequest(buildUrl({ method: 'GET', ctrl: 'database', root: userId }), {
      method: 'GET',
      timeoutMs: TIMEOUT_MS,
      signal: controller.signal,
    });
    return { reachable: true, ms: Date.now() - started };
  } catch (e) {
    return { reachable: false, ms: Date.now() - started, error: controller.signal.aborted ? 'Timeout' : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

/* ═════════════ Auth (/api/sign-in/, /api/sign-up/, /api/try-now/, /api/logout/) ═════════════
 * Same calls as db.inka.vn/login. The server answers with a HttpOnly `auth_token`
 * cookie that every later request must carry (see http.ts for how it is kept).
 */
export type AuthKind = 'sign-in' | 'sign-up' | 'try-now';

export interface AuthSession {
  userId: string;
  username: string;
}

export async function authenticate(kind: AuthKind, creds?: { username: string; password: string }): Promise<AuthSession> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const isGuest = kind === 'try-now';
  // Start from a clean session: a leftover auth_token makes the server treat
  // sign-up/sign-in as an action on the old (possibly expired) session.
  await clearCookies();
  try {
    const res = await httpRequest(`${getPort()}/${kind}/`, {
      method: 'POST',
      timeoutMs: TIMEOUT_MS,
      signal: controller.signal,
      ...(!isGuest && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) }),
    });
    const d = parseJson<{ success?: boolean; error?: string } & Partial<AuthSession>>(res.text);
    logger(`POST ${res.status} → /api/${kind}/`, !!d?.success);
    if (res.status >= 400 || !d?.success || !d.userId) throw new Error(d?.error || `HTTP ${res.status}`);
    setConnection('server');
    return { userId: d.userId, username: d.username || d.userId };
  } catch (e) {
    if (controller.signal.aborted) throw new Error('Hết thời gian chờ server');
    throw e instanceof Error ? e : new Error(String(e));
  } finally {
    clearTimeout(timer);
  }
}

export async function logoutServer(): Promise<void> {
  try {
    await httpRequest(`${getPort()}/logout/`, { method: 'POST', timeoutMs: TIMEOUT_MS });
  } catch {
    // Offline: the local session is cleared anyway.
  }
  // The server clears auth_token with a `Secure` cookie over plain http, which
  // clients ignore, so drop the cookies ourselves.
  await clearCookies();
}
