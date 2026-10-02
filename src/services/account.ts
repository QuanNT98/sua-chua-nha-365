/**
 * Per-user data on inka.vn: the customer's profile and the feedback they send.
 *
 * Profiles are append-only: saving adds a new row and the newest row per user
 * wins. Editing in place is avoided because the server relists an edited record
 * under a new id that later edits silently ignore.
 */
import type { RecordItem } from '@/types';
import { createRecord } from './api';
import { INKA } from './config';
import { num, str, tableRows } from './records';

export type Profile = {
  name: string;
  phone: string;
  address: string;
  points: number;
};

const fromRecord = (r: RecordItem): Profile => ({
  name: str(r.content.name),
  phone: str(r.content.phone),
  address: str(r.content.address),
  points: num(r.content.points),
});

/** The user's latest saved profile, or null when they have not saved one yet. */
export async function loadProfile(userId: string): Promise<Profile | null> {
  const mine = (await tableRows('profiles')).filter((r) => r.content.user_id === userId);
  if (mine.length === 0) return null;
  return fromRecord(mine.reduce((a, b) => (num(b.content.updated_at) >= num(a.content.updated_at) ? b : a)));
}

export const saveProfile = (userId: string, p: Profile) =>
  createRecord(INKA.tables.profiles, { user_id: userId, ...p, updated_at: Date.now() });

export const sendFeedback = (userId: string, f: { stars: number; topic: string; content: string; phone: string }) =>
  createRecord(INKA.tables.feedback, { user_id: userId, ...f, created_at: Date.now() });
