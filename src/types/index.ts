/* ── API envelope ── */
export interface ApiEnvelope<T = unknown> {
  status: string;
  data?: T;
  error?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Controller segment of the URL: /api/{ctrl}/{root}{k1}{k2}{k3}{query} */
export type Ctrl = 'database' | 'table' | 'record' | 'metadata' | 'member' | 'admin' | 'role' | 'feed';

export interface RequestOptions {
  method: HttpMethod;
  ctrl: Ctrl;
  root: string;
  /** Appended directly after root, no separator (k1, k2, k3 in the web app). */
  keys?: string[];
  query?: string;
  body?: unknown;
}

/** Where the last response came from. */
export type DataSource = 'server' | 'cache' | 'mock';

/* ── Auth flags as the API returns them ── */
export interface AuthFlagsApi {
  auth_read?: boolean;
  auth_write?: boolean;
  auth_edit?: boolean;
  auth_delete?: boolean;
  auth_owner?: boolean;
}

export type AuthKey = 'READ' | 'WRITE' | 'EDIT' | 'DELETE' | 'OWNER';
export type RoleFlagKey = 'read' | 'write' | 'edit' | 'delete';

/* ── Entities ── */
export interface Database extends AuthFlagsApi {
  db_id: string;
  db_name: string;
  owner_id?: string;
  status?: string;
}

export interface Table extends AuthFlagsApi {
  tbl_id: string;
  tbl_name: string;
  row_count?: number;
  role_read?: string | null;
  role_write?: string | null;
  role_edit?: string | null;
  role_delete?: string | null;
}

export type TableRoles = Partial<Record<RoleFlagKey, string | null>>;

export interface Member {
  user_id: string;
  user_name: string;
  joined?: string;
}

/** Someone waiting for an admin to let them into a private database. */
export interface JoinRequest {
  user_id: string;
  user_name: string;
  /** ISO date-time the request was sent, when the server provides it. */
  requested_at?: string;
}

export interface Role {
  role_id: string;
  role_name: string;
  /** The server sent a non-text name; role_name holds a placeholder. */
  invalid_name?: boolean;
}

/* ── Records & schema ── */
export const COLUMN_TYPES = [
  'string', 'number', 'boolean', 'date', 'datetime', 'time', 'timestamp',
  'email', 'phone', 'url', 'id', 'json', 'array', 'enum', 'formula',
  'foreign key', 'file', 'image', 'color', 'currency', 'percent',
  'rating', 'status', 'tags', 'richtext',
] as const;

export type ColumnType = (typeof COLUMN_TYPES)[number];

export interface ColumnConfig {
  type: ColumnType;
  /** type === 'formula', e.g. "qty * price" */
  formula?: string;
  /** type === 'foreign key': target table id */
  table?: string;
  /** type === 'foreign key': column of the target table shown instead of rc_id */
  display?: string;
  /** type === 'enum' | 'status' */
  values?: string[];
}

/** Content of the first record of every table (json.data[0]). */
export type TableMeta = Record<string, ColumnConfig>;

export type RecordContent = Record<string, unknown>;

export interface RecordItem {
  rc_id: string;
  content: RecordContent;
}

export interface TableData {
  metaId: string | null;
  meta: TableMeta;
  /** Data records, without the metadata record. */
  rows: RecordItem[];
}

export interface LogEntry {
  id: number;
  ok: boolean;
  message: string;
  at: number;
}
