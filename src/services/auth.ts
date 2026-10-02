import type { AuthFlagsApi, AuthKey, RoleFlagKey } from '../types';
type Tone = 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'violet' | 'dark';

/** Same bit layout as the web app. */
export const AUTH: Record<AuthKey | 'NOFWD', number> = {
  READ: 1 << 0,
  WRITE: 1 << 1,
  EDIT: 1 << 2,
  DELETE: 1 << 3,
  OWNER: 1 << 4,
  NOFWD: 1 << 15,
};

export const DEFAULT_AUTH = AUTH.READ | AUTH.WRITE | AUTH.EDIT | AUTH.DELETE;

export interface AuthDef {
  key: AuthKey;
  bit: number;
  label: string;
  tone: Tone;
  descDb: string;
  desc: string;
}

export const AUTH_DEFS: AuthDef[] = [
  { key: 'READ', bit: AUTH.READ, label: 'Read', tone: 'primary', descDb: 'Chỉ members được Read', desc: 'Cần kiểm tra role read' },
  { key: 'WRITE', bit: AUTH.WRITE, label: 'Write', tone: 'success', descDb: 'Chỉ members được Write', desc: 'Cần kiểm tra role write' },
  { key: 'EDIT', bit: AUTH.EDIT, label: 'Edit', tone: 'warning', descDb: 'Chỉ members được Edit', desc: 'Cần kiểm tra role edit' },
  { key: 'DELETE', bit: AUTH.DELETE, label: 'Delete', tone: 'danger', descDb: 'Chỉ members được Delete', desc: 'Cần kiểm tra role delete' },
  { key: 'OWNER', bit: AUTH.OWNER, label: 'Owner', tone: 'dark', descDb: 'Cần kiểm tra owner', desc: 'Cần kiểm tra owner' },
];

export const TBL_ROLE_FLAGS: { key: AuthKey; flagKey: RoleFlagKey }[] = [
  { key: 'READ', flagKey: 'read' },
  { key: 'WRITE', flagKey: 'write' },
  { key: 'EDIT', flagKey: 'edit' },
  { key: 'DELETE', flagKey: 'delete' },
];

/** auth_* booleans from the API → bitmask. */
export function parseAuthFromApi(item: AuthFlagsApi): number {
  let flags = 0;
  if (item.auth_read) flags |= AUTH.READ;
  if (item.auth_write) flags |= AUTH.WRITE;
  if (item.auth_edit) flags |= AUTH.EDIT;
  if (item.auth_delete) flags |= AUTH.DELETE;
  if (item.auth_owner) flags |= AUTH.OWNER;
  return flags;
}

/** Bitmask → auth_* booleans for PUT. */
export function bitmaskToAuthBody(flags: number): Required<AuthFlagsApi> {
  return {
    auth_read: (flags & AUTH.READ) !== 0,
    auth_write: (flags & AUTH.WRITE) !== 0,
    auth_edit: (flags & AUTH.EDIT) !== 0,
    auth_delete: (flags & AUTH.DELETE) !== 0,
    auth_owner: (flags & AUTH.OWNER) !== 0,
  };
}

export const hasFlag = (flags: number, bit: number) => (flags & bit) !== 0;
