#!/usr/bin/env node
/**
 * Sets up this app's data on inka.vn and writes the IDs into src/services/config.ts.
 *
 *   node scripts/setup-inka.mjs <admin-username> <admin-password>
 *
 * Needs a network that reaches inka.vn ports 8000–8063 (office Wi-Fi blocks them; 4G works).
 * Safe to run again: it reuses the database/table if they already exist.
 *
 * Steps: sign in (or sign up) the admin → database "tho_viet" → table "orders" →
 * column schema → check that a fresh customer account can create and read an order.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('Usage: node scripts/setup-inka.mjs <admin-username> <admin-password>');
  process.exit(1);
}

const DB_NAME = 'tho_viet';
const TABLE_NAME = 'orders';
const SCHEMA = {
  user_id: { type: 'id' },
  code: { type: 'string' },
  title: { type: 'string' },
  category_id: { type: 'string' },
  address: { type: 'string' },
  date: { type: 'string' },
  time: { type: 'string' },
  phone: { type: 'phone' },
  name: { type: 'string' },
  note: { type: 'string' },
  consult_first: { type: 'boolean' },
  status: { type: 'status', values: ['booked', 'confirmed', 'done'] },
  warranty_months: { type: 'number' },
  created_at: { type: 'timestamp' },
};

/* ── tiny client: same URL rules as src/services/api.ts ── */
const port = (root = '') => {
  try {
    return 8000 + Number(BigInt('0x' + (root || '0')) & 0x3fn);
  } catch {
    return 8000;
  }
};

function session() {
  const s = { cookie: '' };
  s.req = async (method, path, root, body) => {
    const res = await fetch(`http://inka.vn:${port(root)}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(s.cookie && { Cookie: s.cookie }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const m = c.match(/^auth_token=([^;]*)/);
      if (m) s.cookie = `auth_token=${m[1]}`;
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: 'bad_response', error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
  };
  s.api = (method, ctrl, root, { keys = '', query = '', body } = {}) => s.req(method, `/${ctrl}/${root}${keys}${query}`, root, body);
  return s;
}

const ok = (r) => r?.status === 'ok';
const list = (r) => (ok(r) && Array.isArray(r.data) ? r.data : []);
const fail = (what, r) => {
  console.error(`✗ ${what}:`, r?.error ?? JSON.stringify(r));
  process.exit(1);
};

async function signIn(s, user, pass, allowSignUp) {
  let r = await s.req('POST', '/sign-in/', '', { username: user, password: pass });
  if (!r.success && r.error === 'user_not_found' && allowSignUp) {
    console.log(`  tài khoản ${user} chưa có → đăng ký mới`);
    r = await s.req('POST', '/sign-up/', '', { username: user, password: pass });
  }
  if (!r.success || !r.userId) fail(`đăng nhập ${user}`, r);
  return r.userId;
}

/* ── 1. admin ── */
console.log('1. Đăng nhập admin…');
const admin = session();
const adminId = await signIn(admin, username, password, true);
console.log(`  userId ${adminId}`);

/* ── 2. database ── */
console.log(`2. Database "${DB_NAME}"…`);
let db = list(await admin.api('GET', 'database', adminId, { query: '?limit=255' })).find((d) => d.db_name === DB_NAME);
if (!db) {
  const r = await admin.api('POST', 'database', adminId, { body: DB_NAME });
  if (!ok(r) || !r.data?.db_id) fail('tạo database', r);
  db = { db_id: r.data.db_id };
  console.log('  đã tạo');
}
const dbId = db.db_id;
console.log(`  dbId ${dbId}`);

/* ── 3. table ── */
console.log(`3. Table "${TABLE_NAME}"…`);
let tbl = list(await admin.api('GET', 'table', dbId, { query: '?limit=255' })).find((t) => t.tbl_name === TABLE_NAME);
if (!tbl) {
  const r = await admin.api('POST', 'table', dbId, { body: TABLE_NAME });
  if (!ok(r) || !r.data?.tbl_id) fail('tạo table', r);
  tbl = { tbl_id: r.data.tbl_id };
  console.log('  đã tạo');
}
const tblId = tbl.tbl_id;
console.log(`  tblId ${tblId}`);

/* ── 4. schema ── */
console.log('4. Khai báo cột…');
const meta = await admin.api('PUT', 'metadata', tblId, { body: SCHEMA });
if (!ok(meta)) fail('lưu schema', meta);
console.log(`  ${Object.keys(SCHEMA).length} cột`);

/* ── 5. customer permission check ── */
console.log('5. Thử quyền với một tài khoản khách mới…');
const customer = session();
const customerName = `thoviet_test_${Date.now().toString(36)}`;
const customerId = await signIn(customer, customerName, `Test${Date.now()}`, true);

const tryCustomer = async () => {
  const w = await customer.api('POST', 'record', tblId, { body: { user_id: customerId, code: 'SETUP_TEST', title: 'setup test', status: 'booked' } });
  const r = await customer.api('GET', 'record', tblId, { query: '?limit=255' });
  return { write: ok(w), read: ok(r), rcId: w?.data?.rc_id, error: (!ok(w) && w?.error) || (!ok(r) && r?.error) };
};

let check = await tryCustomer();
let needsJoin = false;
if (!(check.write && check.read)) {
  needsJoin = true;
  console.log(`  chưa được (${check.error}) → cho khách tham gia database rồi thử lại`);
  const j = await customer.api('PUT', 'member', dbId, { body: 'user' });
  console.log(`  join: ${ok(j) ? j.data?.action ?? 'ok' : j?.error}`);
  check = await tryCustomer();
}

if (check.rcId) await admin.api('DELETE', 'record', check.rcId); // remove the test order

/* ── 6. write config ── */
const configPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'services', 'config.ts');
const src = readFileSync(configPath, 'utf8')
  .replace(/dbId: '[^']*'/, `dbId: '${dbId}'`)
  .replace(/ordersTable: '[^']*'/, `ordersTable: '${tblId}'`)
  .replace(/joinOnSignIn: (true|false)/, `joinOnSignIn: ${needsJoin}`);
writeFileSync(configPath, src);
console.log('6. Đã ghi ID vào src/services/config.ts');

console.log('');
if (check.write && check.read) {
  console.log('✓ Xong. Khách tạo và đọc được đơn.');
  if (needsJoin) console.log('  Khách phải tham gia database trước → app sẽ tự join sau khi đăng nhập (joinOnSignIn: true).');
} else {
  console.log(`⚠ Đã tạo dữ liệu nhưng khách chưa ghi/đọc được đơn (write=${check.write}, read=${check.read}, lỗi: ${check.error}).`);
  console.log('  Mở app Database Manager → database tho_viet → Auth: tắt các flag của DB và table orders, rồi chạy lại script.');
}
