import { create } from 'zustand';
import { authenticate, logoutServer, type AuthSession } from '@/services/api';
import { loadProfile, saveProfile, sendFeedback, type Profile } from '@/services/account';
import { hasTable } from '@/services/config';
import { createOrder, listOrders } from '@/services/orders';
import { getStoredUserId, getStoredUsername, setStoredSession } from '@/services/storage';
import { user } from '@/data';
import { useCatalog } from './catalog';

export type { Profile };

export type OrderStatus = 'booked' | 'confirmed' | 'done';

export type Order = {
  id: string;
  code: string;
  title: string; // "Vệ sinh máy giặt Toshiba 9kg 350k"
  categoryId: string;
  address: string;
  date: string; // dd-mm-yyyy
  time: string;
  phone: string;
  name: string;
  note: string;
  consultFirst: boolean;
  status: OrderStatus;
  warrantyMonths: number;
  createdAt: number;
};

export const statusLabel: Record<OrderStatus, string> = {
  booked: 'Đã đặt',
  confirmed: 'Đã xác nhận',
  done: 'Đã làm',
};

export type Draft = {
  title: string;
  categoryId: string;
  consultFirst: boolean;
  address: string;
  phone: string;
  name: string;
  note: string;
  date: string;
  time: string;
};

type State = {
  /** Session restored from storage; screens wait for it before routing. */
  ready: boolean;
  loggedIn: boolean;
  session: AuthSession | null;
  profile: Profile;
  orders: Order[];
  draft: Draft;
  restore: () => Promise<void>;
  /** Signs in with phone + password; an unknown phone gets a new account. */
  signIn: (phone: string, password: string) => Promise<void>;
  tryNow: () => Promise<void>;
  logout: () => Promise<void>;
  loadOrders: () => Promise<void>;
  updateProfile: (p: Pick<Profile, 'name' | 'phone' | 'address'>) => Promise<void>;
  sendFeedback: (f: { stars: number; topic: string; content: string }) => Promise<void>;
  setDraft: (p: Partial<Draft>) => void;
  startDraft: (title: string, categoryId: string) => void;
  placeOrder: () => Promise<Order>;
  confirm: (id: string) => void;
};

const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

/** Đơn đã làm còn bảo hành hay không (tính từ ngày làm + số tháng bảo hành) */
export const warrantyActive = (o: Order) => {
  const [d, m, y] = o.date.split('-').map(Number);
  const end = new Date(y, m - 1 + o.warrantyMonths, d);
  return end.getTime() > Date.now();
};

const seed: Order[] = [
  { id: 's1', code: '250815532712', title: 'Chống thấm nhà vệ sinh 1500k, chống dột mái nhà 500k: 2000k', categoryId: 'xay-dung', address: '63 Đoàn Hồng Phước, Hòa Thạnh, Tân Phú', date: '15-08-2026', time: '08:00', phone: '0968409323', name: 'Nguyễn Văn An', note: '', consultFirst: false, status: 'done', warrantyMonths: 12, createdAt: 1 },
  { id: 's2', code: '250810532711', title: 'Vệ sinh máy giặt Toshiba 9kg 350k', categoryId: 'dien-may', address: '63 Đoàn Hồng Phước, Hòa Thạnh, Tân Phú', date: '10-08-2026', time: '14:00', phone: '0968409323', name: 'Nguyễn Văn An', note: '', consultFirst: false, status: 'done', warrantyMonths: 3, createdAt: 2 },
  { id: 's3', code: '250804532710', title: 'Vệ sinh bồn nước năng lượng mặt trời 500k', categoryId: 'dien-nuoc', address: '63 Đoàn Hồng Phước, Hòa Thạnh, Tân Phú', date: '04-08-2026', time: '09:00', phone: '0968409323', name: 'Nguyễn Văn An', note: '', consultFirst: false, status: 'done', warrantyMonths: 1, createdAt: 3 },
  { id: 's4', code: '250722532709', title: 'Thay bản lề cửa kính 350k', categoryId: 'co-khi', address: '34 Huỳnh Thiện Lộc, Hòa Thạnh, Tân Phú', date: '22-07-2026', time: '15:00', phone: '0968409323', name: 'Nguyễn Văn An', note: '', consultFirst: false, status: 'done', warrantyMonths: 1, createdAt: 4 },
  { id: 's5', code: '250716532708', title: 'Thông nghẹt sàn toilet 450k', categoryId: 'thong-nghet', address: '34 Huỳnh Thiện Lộc, Hòa Thạnh, Tân Phú', date: '16-07-2026', time: '10:00', phone: '0968409323', name: 'Nguyễn Văn An', note: '', consultFirst: false, status: 'done', warrantyMonths: 1, createdAt: 5 },
  { id: 's6', code: '250917532715', title: 'Sửa máy lạnh không lạnh', categoryId: 'dien-lanh', address: '88 Đường Số 18, Hiệp Bình, Hồ Chí Minh', date: '19-09-2026', time: '09:00', phone: '0968409323', name: 'Nguyễn Văn An', note: 'Máy Daikin 1.5HP, chảy nước', consultFirst: true, status: 'confirmed', warrantyMonths: 3, createdAt: 6 },
];

/** The demo customer, used until someone signs in to the server. */
const demoProfile: Profile = { name: user.name, phone: user.phone, address: user.address, points: user.points };

/** A new account: the phone is the sign-in name when it looks like one. */
const newProfile = (session: AuthSession): Profile => ({
  name: '',
  phone: /^\d{9,11}$/.test(session.username) ? session.username : '',
  address: '',
  points: 0,
});

export const displayName = (p: Profile) => p.name.trim() || 'Quý khách';

const draftFor = (p: Profile, title = '', categoryId = 'khac'): Draft => ({
  title,
  categoryId,
  consultFirst: false,
  address: p.address,
  phone: p.phone,
  name: p.name,
  note: '',
  date: fmt(new Date()),
  time: '09:00',
});

/** Server error codes → messages for the login form. */
const AUTH_ERRORS: Record<string, string> = {
  wrong_password: 'Sai mật khẩu',
  user_exists: 'Số điện thoại đã được đăng ký',
  forbidden: 'Tài khoản không có quyền truy cập',
};
export const authErrorText = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  return AUTH_ERRORS[msg] ?? msg;
};

export const useStore = create<State>((set, get) => {
  /** Data that belongs to the signed-in user, straight from the server. */
  const loadUserData = async (session: AuthSession) => {
    void useCatalog.getState().load();
    if (hasTable('profiles')) {
      try {
        const profile = await loadProfile(session.userId);
        if (profile) set({ profile, draft: draftFor(profile) });
      } catch {
        // Offline: keep the empty profile; the next start retries.
      }
    }
    await get().loadOrders().catch(() => {});
  };

  const startSession = (session: AuthSession) => {
    const profile = hasTable('profiles') ? newProfile(session) : demoProfile;
    set({ session, loggedIn: true, profile, draft: draftFor(profile), orders: hasTable('orders') ? [] : seed });
    void loadUserData(session);
  };

  return {
    ready: false,
    loggedIn: false,
    session: null,
    profile: demoProfile,
    orders: seed,
    draft: draftFor(demoProfile),

    restore: async () => {
      const [userId, username] = await Promise.all([getStoredUserId(), getStoredUsername()]);
      if (userId) startSession({ userId, username: username ?? userId });
      set({ ready: true });
    },

    signIn: async (phone, password) => {
      let session: AuthSession;
      try {
        session = await authenticate('sign-in', { username: phone, password });
      } catch (e) {
        if (!(e instanceof Error) || e.message !== 'user_not_found') throw e;
        session = await authenticate('sign-up', { username: phone, password });
      }
      await setStoredSession(session);
      startSession(session);
    },

    tryNow: async () => {
      const session = await authenticate('try-now');
      await setStoredSession(session);
      startSession(session);
    },

    logout: async () => {
      set({ session: null, loggedIn: false, orders: seed, profile: demoProfile, draft: draftFor(demoProfile) });
      await setStoredSession(null);
      await logoutServer();
    },

    loadOrders: async () => {
      const session = get().session;
      if (!session || !hasTable('orders')) return;
      set({ orders: await listOrders(session.userId) });
    },

    updateProfile: async (p) => {
      const session = get().session;
      const profile = { ...get().profile, ...p };
      if (session && hasTable('profiles')) await saveProfile(session.userId, profile);
      set({ profile });
    },

    sendFeedback: async (f) => {
      const session = get().session;
      if (session && hasTable('feedback')) await sendFeedback(session.userId, { ...f, phone: get().profile.phone });
    },

    setDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
    startDraft: (title, categoryId) => set({ draft: draftFor(get().profile, title, categoryId) }),

    placeOrder: async () => {
      const d = get().draft;
      const now = new Date();
      const code = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getTime()).slice(-6)}`;
      const fields: Omit<Order, 'id'> = {
        code,
        title: d.title,
        categoryId: d.categoryId,
        address: d.address,
        date: d.date,
        time: d.time,
        phone: d.phone,
        name: d.name,
        note: d.note,
        consultFirst: d.consultFirst,
        status: 'booked',
        warrantyMonths: 3,
        createdAt: now.getTime(),
      };
      const session = get().session;
      const onServer = session !== null && hasTable('orders');
      const order = onServer ? await createOrder(session.userId, fields) : { ...fields, id: `o-${now.getTime()}` };
      set((s) => ({ orders: [order, ...s.orders] }));

      // First booking fills in what the profile is still missing.
      const p = get().profile;
      if (!p.name.trim() || !p.address.trim()) {
        get()
          .updateProfile({ name: p.name.trim() || d.name, phone: p.phone || d.phone, address: p.address.trim() || d.address })
          .catch(() => {});
      }

      // Demo without a server: tổng đài "gọi xác nhận" sau vài giây. On the server an admin confirms.
      if (!onServer) setTimeout(() => get().confirm(order.id), 6000);
      return order;
    },

    confirm: (id) => set((s) => ({ orders: s.orders.map((o) => (o.id === id && o.status === 'booked' ? { ...o, status: 'confirmed' } : o)) })),
  };
});
