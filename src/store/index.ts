import { create } from 'zustand';
import { authenticate, joinDatabase, logoutServer, type AuthSession } from '@/services/api';
import { INKA, ordersOnServer } from '@/services/config';
import { createOrder, listOrders, saveOrder } from '@/services/orders';
import { getStoredUserId, getStoredUsername, setStoredSession } from '@/services/storage';

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
  orders: Order[];
  ordersLoading: boolean;
  draft: Draft;
  restore: () => Promise<void>;
  /** Signs in with phone + password; an unknown phone gets a new account. */
  signIn: (phone: string, password: string) => Promise<void>;
  tryNow: () => Promise<void>;
  logout: () => Promise<void>;
  loadOrders: () => Promise<void>;
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

const defaultDraft: Draft = {
  title: '',
  categoryId: 'khac',
  consultFirst: false,
  address: '88 Đường Số 18, Hiệp Bình, Hồ Chí Minh',
  phone: '0968409323',
  name: 'Nguyễn Văn An',
  note: '',
  date: fmt(new Date()),
  time: '09:00',
};

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
  /** Signed in with a server session: orders come from (and go to) inka. */
  const onServer = () => ordersOnServer() && get().session !== null;

  const startSession = async (session: AuthSession) => {
    // Already a member → the server just answers again; a failure shows up later as a failed order.
    if (ordersOnServer() && INKA.joinOnSignIn) await joinDatabase(INKA.dbId).catch(() => null);
    await setStoredSession(session);
    set({ session, loggedIn: true, orders: ordersOnServer() ? [] : seed });
    get().loadOrders().catch(() => {});
  };

  return {
    ready: false,
    loggedIn: false,
    session: null,
    orders: seed,
    ordersLoading: false,
    draft: defaultDraft,

    restore: async () => {
      const [userId, username] = await Promise.all([getStoredUserId(), getStoredUsername()]);
      if (userId) {
        set({ session: { userId, username: username ?? userId }, loggedIn: true, orders: ordersOnServer() ? [] : seed });
        get().loadOrders().catch(() => {});
      }
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
      await startSession(session);
    },

    tryNow: async () => startSession(await authenticate('try-now')),

    logout: async () => {
      set({ session: null, loggedIn: false, orders: seed });
      await setStoredSession(null);
      await logoutServer();
    },

    loadOrders: async () => {
      const session = get().session;
      if (!onServer() || !session) return;
      set({ ordersLoading: true });
      try {
        set({ orders: await listOrders(session.userId) });
      } finally {
        set({ ordersLoading: false });
      }
    },

    setDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
    startDraft: (title, categoryId) => set({ draft: { ...defaultDraft, date: fmt(new Date()), title, categoryId } }),

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
      const order = onServer() && session ? await createOrder(session.userId, fields) : { ...fields, id: `o-${now.getTime()}` };
      set((s) => ({ orders: [order, ...s.orders] }));
      // Demo: tổng đài "gọi xác nhận" sau vài giây
      setTimeout(() => get().confirm(order.id), 6000);
      return order;
    },

    confirm: (id) => {
      const order = get().orders.find((o) => o.id === id && o.status === 'booked');
      if (!order) return;
      const confirmed: Order = { ...order, status: 'confirmed' };
      set((s) => ({ orders: s.orders.map((o) => (o.id === id ? confirmed : o)) }));
      const session = get().session;
      if (onServer() && session) saveOrder(session.userId, confirmed).catch(() => {});
    },
  };
});
