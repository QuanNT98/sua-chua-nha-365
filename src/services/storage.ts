import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'thoviet:';
const CACHE_PREFIX = `${PREFIX}cache:`;

export const STORAGE_KEYS = {
  userId: `${PREFIX}userId`,
  username: `${PREFIX}username`,
  roleMembers: `${PREFIX}roleMembers`,
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the cache is best-effort.
  }
}

/* ── Session ── */
export async function getStoredUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.userId);
  } catch {
    return null;
  }
}

export async function getStoredUsername(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.username);
  } catch {
    return null;
  }
}

export async function setStoredSession(session: { userId: string; username: string } | null): Promise<void> {
  try {
    if (session) {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.userId, session.userId],
        [STORAGE_KEYS.username, session.username],
      ]);
    } else {
      await AsyncStorage.multiRemove([STORAGE_KEYS.userId, STORAGE_KEYS.username]);
    }
  } catch {
    // ignore
  }
}

/* ── Role members (no API for this in the web app; kept on device) ── */
export type RoleMembersMap = Record<string, string[]>;

export const getRoleMembers = async () => (await readJson<RoleMembersMap>(STORAGE_KEYS.roleMembers)) ?? {};
export const saveRoleMembers = (map: RoleMembersMap) => writeJson(STORAGE_KEYS.roleMembers, map);

/* ── Response cache for offline reads (replaces the web app's IndexedDB) ── */
export const cacheGet = <T>(path: string) => readJson<T>(CACHE_PREFIX + path);
export const cacheSet = (path: string, value: unknown) => writeJson(CACHE_PREFIX + path, value);

export async function cacheStats(): Promise<{ keys: number }> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return { keys: keys.filter((k) => k.startsWith(CACHE_PREFIX)).length };
  } catch {
    return { keys: 0 };
  }
}

export async function cacheClear(): Promise<number> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(CACHE_PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
    return keys.length;
  } catch {
    return 0;
  }
}
