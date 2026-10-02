/** Helpers for turning inka records (untyped content) into app data. */
import type { RecordItem } from '@/types';
import { ApiError, apiFetch } from './api';
import { INKA, type InkaTable } from './config';

export const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
export const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
export const strList = (v: unknown): string[] => (Array.isArray(v) ? v.map(str) : typeof v === 'string' && v ? v.split('\n') : []);

/** The column-schema record: every value is a column config like { type: 'string' }. */
const isSchema = (content: Record<string, unknown>) => {
  const values = Object.values(content);
  return values.length > 0 && values.every((v) => v !== null && typeof v === 'object' && typeof (v as { type?: unknown }).type === 'string');
};

const EMPTY = ['not_record', 'null_handle'];

/**
 * Data rows of a table, ordered by their `sort` column.
 *
 * The schema record is recognised by its shape, not by being first: after some
 * deletes the server puts a data row in that slot. An edited row can also be
 * listed twice under one rc_id, so duplicates are dropped.
 */
export async function tableRows(table: InkaTable): Promise<RecordItem[]> {
  const res = await apiFetch<unknown>({ method: 'GET', ctrl: 'record', root: INKA.tables[table], query: '?limit=255' });
  if (!res.ok) {
    if (res.error && EMPTY.includes(res.error)) return [];
    throw new ApiError(res.error || 'API lỗi');
  }
  const rows = new Map<string, RecordItem>();
  for (const item of Array.isArray(res.data) ? res.data : []) {
    const r = item as { rc_id?: unknown; content?: unknown } | null;
    if (!r?.rc_id || !r.content || typeof r.content !== 'object') continue;
    const content = r.content as Record<string, unknown>;
    if (!isSchema(content)) rows.set(String(r.rc_id), { rc_id: String(r.rc_id), content });
  }
  return [...rows.values()].sort((a, b) => num(a.content.sort) - num(b.content.sort));
}
