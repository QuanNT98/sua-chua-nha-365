/**
 * In-memory mock of the inka.vn API, used when the server is unreachable
 * and nothing is cached. Responses use the same { status, data, error } shape
 * and the same URL routing as the real server, so every screen keeps working.
 * Data resets when the app restarts.
 */
import { DEFAULT_AUTH, bitmaskToAuthBody } from './auth';
import type {
  ApiEnvelope, Database, JoinRequest, Member, RecordContent, RecordItem, RequestOptions, Role, Table, TableMeta, TableRoles,
} from '../types';

interface MockTable {
  dbId: string;
  tbl: Table;
  metaId: string;
  meta: TableMeta;
  rows: RecordItem[];
}

interface MockDb {
  db: Database;
  members: Member[];
  adminIds: string[];
  roles: Role[];
  /** Join requests waiting for approval (private databases). */
  pending: JoinRequest[];
}

const SELF = '__self__';
let currentUser = 'demo_user';
let state: { dbs: MockDb[]; tables: MockTable[] } | null = null;

export function setMockUser(userId: string) {
  currentUser = userId;
}

const hexId = () =>
  Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const today = () => new Date().toISOString().slice(0, 10);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const ok = <T>(data: T): ApiEnvelope<T> => ({ status: 'ok', data });
const fail = (error: string): ApiEnvelope => ({ status: 'error', error });

function makeTable(dbId: string, tbl_name: string, meta: TableMeta, rows: RecordContent[]): MockTable {
  return {
    dbId,
    tbl: { tbl_id: hexId(), tbl_name, ...bitmaskToAuthBody(DEFAULT_AUTH) },
    metaId: hexId(),
    meta,
    rows: rows.map((content) => ({ rc_id: hexId(), content })),
  };
}

function seed() {
  const shopId = 'a1c3e5f700000001';
  const wikiId = 'b2d4f6a800000002';

  const people: Member[] = [
    { user_id: 'user_lan', user_name: 'Lan Nguyễn', joined: '2026-06-02' },
    { user_id: 'user_minh', user_name: 'Minh Trần', joined: '2026-07-14' },
    { user_id: 'user_hoa', user_name: 'Hoa Lê', joined: '2026-08-21' },
  ];

  const customers = makeTable(
    shopId,
    'customers',
    { name: { type: 'string' }, email: { type: 'email' }, city: { type: 'string' }, vip: { type: 'boolean' } },
    [
      { name: 'Công ty An Phát', email: 'lienhe@anphat.vn', city: 'Hà Nội', vip: 'true' },
      { name: 'Bảo Minh Store', email: 'order@baominh.vn', city: 'Đà Nẵng', vip: 'false' },
      { name: 'Nguyễn Thu Trang', email: 'trang.nt@gmail.com', city: 'TP.HCM', vip: 'false' },
    ],
  );

  const products = makeTable(
    shopId,
    'products',
    {
      name: { type: 'string' },
      category: { type: 'enum', values: ['Điện tử', 'Gia dụng', 'Thời trang'] },
      price: { type: 'currency' },
      stock: { type: 'number' },
    },
    [
      { name: 'Tai nghe Bluetooth', category: 'Điện tử', price: '450000', stock: '120' },
      { name: 'Nồi chiên không dầu', category: 'Gia dụng', price: '1890000', stock: '35' },
      { name: 'Áo khoác gió', category: 'Thời trang', price: '320000', stock: '80' },
      { name: 'Bàn phím cơ', category: 'Điện tử', price: '1250000', stock: '42' },
    ],
  );

  const [c1, c2, c3] = customers.rows;
  const [p1, p2, , p4] = products.rows;
  const orders = makeTable(
    shopId,
    'orders',
    {
      customer: { type: 'foreign key', table: customers.tbl.tbl_id, display: 'name' },
      product: { type: 'foreign key', table: products.tbl.tbl_id, display: 'name' },
      qty: { type: 'number' },
      unit_price: { type: 'currency' },
      total: { type: 'formula', formula: 'qty * unit_price' },
      status: { type: 'status', values: ['Mới', 'Đang giao', 'Hoàn tất'] },
    },
    [
      { customer: c1.rc_id, product: p2.rc_id, qty: '3', unit_price: '1890000', status: 'Hoàn tất' },
      { customer: c2.rc_id, product: p1.rc_id, qty: '10', unit_price: '430000', status: 'Đang giao' },
      { customer: c3.rc_id, product: p4.rc_id, qty: '1', unit_price: '1250000', status: 'Mới' },
    ],
  );

  const docs = makeTable(
    wikiId,
    'docs',
    { title: { type: 'string' }, author: { type: 'string' }, updated: { type: 'date' } },
    [
      { title: 'Quy trình onboarding', author: 'Lan Nguyễn', updated: '2026-09-10' },
      { title: 'Hướng dẫn deploy', author: 'Minh Trần', updated: '2026-09-18' },
    ],
  );

  state = {
    dbs: [
      {
        db: { db_id: shopId, db_name: 'shop_demo', owner_id: SELF, status: 'active', ...bitmaskToAuthBody(DEFAULT_AUTH) },
        members: [...people],
        adminIds: ['user_lan'],
        pending: [
          { user_id: 'user_tuan', user_name: 'Tuấn Phạm', requested_at: hoursAgo(2) },
          { user_id: 'user_mai', user_name: 'Mai Đỗ', requested_at: hoursAgo(26) },
          { user_id: 'user_khoa', user_name: 'Khoa Vũ', requested_at: hoursAgo(75) },
        ],
        roles: [
          { role_id: hexId(), role_name: 'members' },
          { role_id: hexId(), role_name: 'admin' },
          { role_id: hexId(), role_name: 'editor' },
        ],
      },
      {
        db: { db_id: wikiId, db_name: 'team_wiki', owner_id: 'user_lan', status: 'active', ...bitmaskToAuthBody(DEFAULT_AUTH) },
        members: [people[0], people[1]],
        adminIds: ['user_lan'],
        pending: [],
        roles: [{ role_id: hexId(), role_name: 'members' }],
      },
    ],
    tables: [customers, products, orders, docs],
  };
  return state;
}

const getState = () => state ?? seed();

const exposeDb = (d: MockDb): Database => ({
  ...d.db,
  owner_id: d.db.owner_id === SELF ? currentUser : d.db.owner_id,
});

const exposeTable = (t: MockTable): Table => ({ ...t.tbl, row_count: t.rows.length });

function findRecord(rcId: string) {
  for (const t of getState().tables) {
    const idx = t.rows.findIndex((r) => r.rc_id === rcId);
    if (idx >= 0) return { table: t, idx };
  }
  return null;
}

function parseLimit(query?: string): number | undefined {
  const m = /limit=(\d+)/.exec(query ?? '');
  return m ? Number(m[1]) : undefined;
}

function handle(o: RequestOptions): ApiEnvelope {
  const s = getState();
  const key = o.keys?.[0] ?? '';
  const db = s.dbs.find((d) => d.db.db_id === o.root);
  const table = s.tables.find((t) => t.tbl.tbl_id === o.root);

  switch (o.ctrl) {
    case 'database': {
      if (o.method === 'GET') {
        return s.dbs.length ? ok(s.dbs.map(exposeDb)) : fail('null_handle');
      }
      if (o.method === 'POST') {
        const created: MockDb = {
          db: { db_id: hexId(), db_name: String(o.body), owner_id: SELF, status: 'active', ...bitmaskToAuthBody(DEFAULT_AUTH) },
          members: [],
          adminIds: [],
          roles: [],
          pending: [],
        };
        s.dbs.push(created);
        return ok({ db_id: created.db.db_id });
      }
      if (!db) return fail('not_found');
      if (o.method === 'PUT') {
        if (key) {
          // Owner/admin adds a user by id.
          if (!db.members.some((m) => m.user_id === key)) {
            db.members.push({ user_id: key, user_name: key, joined: today() });
          }
          return ok({ user_id: key, user_name: key });
        }
        if (typeof o.body === 'string') db.db.db_name = o.body;
        else Object.assign(db.db, o.body as object);
        return ok(exposeDb(db));
      }
      if (o.method === 'DELETE') {
        s.dbs = s.dbs.filter((d) => d !== db);
        return ok({});
      }
      break;
    }

    case 'member': {
      // Demo: any unknown database id behaves like a private DB, so the request waits for approval.
      if (!db && o.method === 'PUT') return ok({ action: 'pending' });
      if (!db) return fail('not_found');
      if (o.method === 'GET') return db.members.length ? ok(db.members) : fail('null_handle');
      if (o.method === 'PUT') {
        return ok({ action: 'member', db_name: db.db.db_name, ...bitmaskToAuthBody(DEFAULT_AUTH) });
      }
      if (o.method === 'DELETE') {
        db.members = db.members.filter((m) => m.user_id !== key);
        db.adminIds = db.adminIds.filter((id) => id !== key);
        return ok({});
      }
      break;
    }

    case 'admin': {
      if (!db) return fail('not_found');
      if (o.method === 'GET') {
        const admins = db.members.filter((m) => db.adminIds.includes(m.user_id));
        return admins.length ? ok(admins) : fail('null_handle');
      }
      if (o.method === 'POST') {
        if (!db.adminIds.includes(key)) db.adminIds.push(key);
        const m = db.members.find((x) => x.user_id === key);
        return ok({ user_id: key, user_name: m?.user_name ?? key });
      }
      if (o.method === 'DELETE') {
        db.adminIds = db.adminIds.filter((id) => id !== key);
        return ok({});
      }
      break;
    }

    case 'role': {
      if (!db) return fail('not_found');
      if (o.method === 'GET') return db.roles.length ? ok(db.roles) : fail('null_handle');
      if (o.method === 'POST') {
        const role = { role_id: hexId(), role_name: String(o.body) };
        db.roles.push(role);
        return ok(role);
      }
      break;
    }

    case 'table': {
      if (o.method === 'GET') {
        if (!db) return fail('not_found');
        const list = s.tables.filter((t) => t.dbId === db.db.db_id).map(exposeTable);
        return list.length ? ok(list) : fail('null_handle');
      }
      if (o.method === 'POST') {
        if (!db) return fail('not_found');
        const t = makeTable(db.db.db_id, String(o.body), {}, []);
        s.tables.push(t);
        return ok({ tbl_id: t.tbl.tbl_id });
      }
      if (!table) return fail('not_found');
      if (o.method === 'PUT') {
        if (typeof o.body === 'string') table.tbl.tbl_name = o.body;
        else Object.assign(table.tbl, o.body as Partial<Table> & TableRoles);
        return ok(exposeTable(table));
      }
      if (o.method === 'DELETE') {
        s.tables = s.tables.filter((t) => t !== table);
        return ok({});
      }
      break;
    }

    case 'record': {
      if (o.method === 'GET') {
        if (!table) return fail('not_found');
        const all: RecordItem[] = [{ rc_id: table.metaId, content: table.meta as RecordContent }, ...table.rows];
        const limit = parseLimit(o.query);
        return ok(limit ? all.slice(0, limit) : all);
      }
      if (o.method === 'POST') {
        if (!table) return fail('not_found');
        const rc = { rc_id: hexId(), content: { ...(o.body as RecordContent) } };
        table.rows.unshift(rc); // newest first, like the server
        return ok({ rc_id: rc.rc_id });
      }
      const found = findRecord(o.root);
      if (!found) return fail('not_found');
      if (o.method === 'PUT') {
        found.table.rows[found.idx] = { rc_id: o.root, content: { ...(o.body as RecordContent) } };
        return ok({ rc_id: o.root });
      }
      if (o.method === 'DELETE') {
        found.table.rows.splice(found.idx, 1);
        return ok({});
      }
      break;
    }

    case 'metadata': {
      if (!table) return fail('not_found');
      table.meta = { ...(o.body as TableMeta) };
      return ok({ rc_id: table.metaId });
    }

    case 'feed':
      return ok([]);
  }
  return fail('unsupported');
}

/* ── Join requests (no server API yet; see api.ts) ── */
const delay = () => new Promise((r) => setTimeout(r, 120));

export async function mockListJoinRequests(dbId: string): Promise<JoinRequest[]> {
  await delay();
  const db = getState().dbs.find((d) => d.db.db_id === dbId);
  return JSON.parse(JSON.stringify(db?.pending ?? [])) as JoinRequest[];
}

export async function mockResolveJoinRequest(dbId: string, userId: string, approve: boolean): Promise<void> {
  await delay();
  const db = getState().dbs.find((d) => d.db.db_id === dbId);
  const req = db?.pending.find((p) => p.user_id === userId);
  if (!db || !req) throw new Error('Yêu cầu không còn tồn tại');
  db.pending = db.pending.filter((p) => p.user_id !== userId);
  if (approve) db.members.push({ user_id: req.user_id, user_name: req.user_name, joined: today() });
}

export async function mockRequest(o: RequestOptions): Promise<ApiEnvelope> {
  await new Promise((r) => setTimeout(r, 120));
  // Deep copy so callers can never mutate mock state by reference.
  return JSON.parse(JSON.stringify(handle(o))) as ApiEnvelope;
}
