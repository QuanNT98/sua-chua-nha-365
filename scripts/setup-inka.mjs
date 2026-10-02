#!/usr/bin/env node
/**
 * Sets up this app's data on inka.vn and writes the IDs into src/services/config.ts.
 *
 *   node scripts/setup-inka.mjs <admin-username> <admin-password>
 *
 * Needs a network that reaches inka.vn ports 8000–8063 (office Wi-Fi blocks them; 4G works).
 * Safe to run again: existing tables are reused and a table that already has rows is not re-seeded.
 *
 * Steps: admin sign-in → database → tables + columns + permissions → seed the catalog
 * from src/data → read the permissions back.
 *
 * Table permission flags on inka: true = any signed-in user may do it, false = owner/admins only.
 */
import { Buffer } from 'node:buffer';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('Usage: node scripts/setup-inka.mjs <admin-username> <admin-password>');
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DB_NAME = 'tho_viet';

/* ── bundled app data (src/data/index.ts has no imports, so transpile and load it) ── */
const dataJs = ts.transpileModule(readFileSync(join(ROOT, 'src/data/index.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const data = await import('data:text/javascript;base64,' + Buffer.from(dataJs).toString('base64'));

const READ_ONLY = { read: true, write: false, edit: false, delete: false };
const col = (type, extra) => ({ type, ...extra });
const sorted = (rows) => rows.map((r, i) => ({ ...r, sort: i + 1 }));

/** name → columns, what customers may do, and rows to seed when the table is empty. */
const TABLES = {
  orders: {
    auth: { read: true, write: true, edit: false, delete: false },
    schema: {
      user_id: col('id'), code: col('string'), title: col('string'), category_id: col('string'), address: col('string'),
      date: col('string'), time: col('string'), phone: col('phone'), name: col('string'), note: col('string'),
      consult_first: col('boolean'), status: col('status', { values: ['booked', 'confirmed', 'done'] }),
      warranty_months: col('number'), created_at: col('timestamp'),
    },
  },
  profiles: {
    // Append-only: the app adds a row per save and reads the newest one (see src/services/account.ts).
    auth: { read: true, write: true, edit: false, delete: false },
    schema: { user_id: col('id'), name: col('string'), phone: col('phone'), address: col('string'), points: col('number'), updated_at: col('timestamp') },
  },
  feedback: {
    auth: { read: false, write: true, edit: false, delete: false },
    schema: { user_id: col('id'), stars: col('rating'), topic: col('string'), content: col('string'), phone: col('phone'), created_at: col('timestamp') },
  },
  categories: {
    auth: READ_ONLY,
    schema: { key: col('string'), name: col('string'), emoji: col('string'), kind: col('enum', { values: ['service', 'other', 'pricing', 'news'] }), sort: col('number') },
    rows: () => sorted(data.categories.map((c) => ({ key: c.id, name: c.name, emoji: c.emoji, kind: c.kind }))),
  },
  services: {
    auth: READ_ONLY,
    schema: { key: col('string'), category_id: col('string'), name: col('string'), sort: col('number') },
    rows: () => sorted(data.services.map((s) => ({ key: s.id, category_id: s.categoryId, name: s.name }))),
  },
  prices: {
    auth: READ_ONLY,
    schema: {
      category_id: col('string'), group_id: col('string'), group_title: col('string'), name: col('string'),
      unit: col('string'), min: col('currency'), max: col('currency'), note: col('string'), sort: col('number'),
    },
    rows: () =>
      sorted(
        data.priceLists.flatMap((l) =>
          l.groups.flatMap((g) =>
            g.items.map((i) => ({
              category_id: l.categoryId, group_id: g.id, group_title: g.title,
              name: i.name, unit: i.unit, min: i.min, max: i.max ?? 0, note: i.note ?? '',
            })),
          ),
        ),
      ),
  },
  news: {
    auth: READ_ONLY,
    schema: {
      key: col('string'), title: col('string'), date: col('string'), tag: col('string'), excerpt: col('string'),
      image: col('image'), author: col('string'), read_min: col('number'), sort: col('number'),
    },
    rows: () =>
      sorted(data.news.map((n) => ({ key: n.id, title: n.title, date: n.date, tag: n.tag, excerpt: n.excerpt, image: n.image, author: n.author, read_min: n.readMin }))),
  },
  // A record holds under ~1 KB, so an article's text lives here, one paragraph per row.
  news_body: {
    auth: READ_ONLY,
    schema: { news_key: col('string'), text: col('richtext'), sort: col('number') },
    rows: () => sorted(data.news.flatMap((n) => n.body.map((text) => ({ news_key: n.id, text })))),
  },
  promos: {
    auth: READ_ONLY,
    schema: {
      key: col('string'), headline: col('string'), amount: col('string'), sub: col('string'), items: col('array'),
      foot: col('string'), color_from: col('color'), color_to: col('color'), sort: col('number'),
    },
    rows: () =>
      sorted(data.promos.map((p) => ({ key: p.id, headline: p.headline, amount: p.amount, sub: p.sub, items: p.items, foot: p.foot, color_from: p.colors[0], color_to: p.colors[1] }))),
  },
  trades: {
    auth: READ_ONLY,
    schema: {
      key: col('string'), title: col('string'), subtitle: col('string'), lines: col('array'), emojis: col('array'),
      color_from: col('color'), color_to: col('color'), accent: col('color'), sort: col('number'),
    },
    rows: () =>
      sorted(data.trades.map((t) => ({ key: t.id, title: t.title, subtitle: t.subtitle, lines: t.lines, emojis: t.emojis, color_from: t.colors[0], color_to: t.colors[1], accent: t.accent }))),
  },
  member_tiers: {
    auth: READ_ONLY,
    schema: { name: col('string'), from_points: col('number'), benefit: col('string'), sort: col('number') },
    rows: () => sorted(data.memberTiers.map((t) => ({ name: t.name, from_points: t.from, benefit: t.benefit }))),
  },
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
/** The column-schema record: every value is a column config like { type: 'string' }. */
const isSchema = (content) => {
  const values = Object.values(content ?? {});
  return values.length > 0 && values.every((v) => v !== null && typeof v === 'object' && typeof v.type === 'string');
};
const fail = (what, r) => {
  console.error(`✗ ${what}:`, r?.error ?? JSON.stringify(r));
  process.exit(1);
};

async function signIn(s, user, pass) {
  let r = await s.req('POST', '/sign-in/', '', { username: user, password: pass });
  if (!r.success && r.error === 'user_not_found') {
    console.log(`  tài khoản ${user} chưa có → đăng ký mới`);
    r = await s.req('POST', '/sign-up/', '', { username: user, password: pass });
  }
  if (!r.success || !r.userId) fail(`đăng nhập ${user}`, r);
  return r.userId;
}

/* ── 1. admin + database ── */
console.log('1. Đăng nhập admin…');
const admin = session();
const adminId = await signIn(admin, username, password);

let db = list(await admin.api('GET', 'database', adminId, { query: '?limit=255' })).find((d) => d.db_name === DB_NAME);
if (!db) {
  const r = await admin.api('POST', 'database', adminId, { body: DB_NAME });
  if (!ok(r) || !r.data?.db_id) fail('tạo database', r);
  db = { db_id: r.data.db_id };
}
const dbId = db.db_id;
console.log(`  database "${DB_NAME}" ${dbId}`);

/* ── 2. tables: create, columns, permissions, seed ── */
console.log('2. Bảng…');
const existing = list(await admin.api('GET', 'table', dbId, { query: '?limit=255' }));
const ids = {};
for (const [name, spec] of Object.entries(TABLES)) {
  let tblId = existing.find((t) => t.tbl_name === name)?.tbl_id;
  const created = !tblId;
  if (!tblId) {
    const r = await admin.api('POST', 'table', dbId, { body: name });
    if (!ok(r) || !r.data?.tbl_id) fail(`tạo bảng ${name}`, r);
    tblId = r.data.tbl_id;
  }
  ids[name] = tblId;

  // Server bug: after some deletes a data row sits in the schema slot, and saving the
  // schema overwrites whatever is there. Put such a row back afterwards.
  const head = list(await admin.api('GET', 'record', tblId, { query: '?limit=255' }))[0];
  const displaced = head && !isSchema(head.content) ? head.content : null;
  const meta = await admin.api('PUT', 'metadata', tblId, { body: spec.schema });
  if (!ok(meta)) fail(`lưu cột ${name}`, meta);
  if (displaced) {
    const r = await admin.api('POST', 'record', tblId, { body: displaced });
    if (!ok(r)) fail(`khôi phục dòng bị đè ở ${name}`, r);
  }

  const a = spec.auth;
  const auth = await admin.api('PUT', 'table', tblId, {
    body: { auth_read: a.read, auth_write: a.write, auth_edit: a.edit, auth_delete: a.delete, auth_owner: false },
  });
  if (!ok(auth)) fail(`đặt quyền ${name}`, auth);

  let seeded = '';
  if (spec.rows) {
    const current = list(await admin.api('GET', 'record', tblId, { query: '?limit=255' })).filter((r) => !isSchema(r.content)).length;
    if (current > 0) {
      seeded = `, đã có ${current} dòng`;
    } else {
      const rows = spec.rows();
      for (const row of rows) {
        const r = await admin.api('POST', 'record', tblId, { body: row });
        if (!ok(r)) fail(`thêm dòng vào ${name}`, r);
      }
      seeded = `, thêm ${rows.length} dòng`;
    }
  }
  console.log(`  ${created ? '+' : '='} ${name.padEnd(13)} ${tblId}${seeded}${displaced ? ', đã sửa lại dòng schema' : ''}`);
}

/* ── 3. write config ── */
const tableLines = Object.keys(TABLES).map((n) => `    ${n}: '${ids[n]}',`).join('\n');
const configPath = join(ROOT, 'src/services/config.ts');
writeFileSync(
  configPath,
  readFileSync(configPath, 'utf8')
    .replace(/dbId: '[^']*'/, `dbId: '${dbId}'`)
    .replace(/tables: \{[^}]*\}/, `tables: {\n${tableLines}\n  }`),
);
console.log('3. Đã ghi ID vào src/services/config.ts');

/* ── 4. read the permissions back ──
 * No test rows are written to the real tables: adding and deleting rows can corrupt a table on this server.
 */
console.log('4. Kiểm tra quyền đã lưu…');
const saved = list(await admin.api('GET', 'table', dbId, { query: '?limit=255' }));
const problems = [];
for (const [name, spec] of Object.entries(TABLES)) {
  const t = saved.find((x) => x.tbl_id === ids[name]);
  for (const flag of ['read', 'write', 'edit', 'delete']) {
    if (!t || t[`auth_${flag}`] !== spec.auth[flag]) problems.push(`${name}: auth_${flag} = ${t?.[`auth_${flag}`]}, mong đợi ${spec.auth[flag]}`);
  }
}

console.log('');
if (problems.length === 0) {
  console.log('✓ Xong. Quyền của từng bảng đúng như thiết kế.');
} else {
  console.log('⚠ Đã tạo dữ liệu nhưng quyền chưa đúng:');
  for (const p of problems) console.log(`  - ${p}`);
}
