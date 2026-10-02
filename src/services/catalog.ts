/**
 * Catalog on inka.vn: categories, services, prices, news, promos, trades and
 * member tiers. Customers can only read these tables; edit them with the
 * Database Manager app. Columns are created by scripts/setup-inka.mjs.
 */
import type { Category, News, PriceList, Promo, Service, Trade } from '@/data';
import { hasTable, type InkaTable } from './config';
import { num, str, strList, tableRows } from './records';
import type { RecordContent } from '@/types';

export type MemberTier = { name: string; from: number; benefit: string };

export type Catalog = {
  categories: Category[];
  services: Service[];
  priceLists: PriceList[];
  news: News[];
  promos: Promo[];
  trades: Trade[];
  memberTiers: MemberTier[];
};

const KINDS: Category['kind'][] = ['service', 'other', 'pricing', 'news'];

const toCategory = (c: RecordContent): Category => ({
  id: str(c.key),
  name: str(c.name),
  emoji: str(c.emoji),
  kind: KINDS.includes(c.kind as Category['kind']) ? (c.kind as Category['kind']) : 'service',
});

const toService = (c: RecordContent): Service => ({ id: str(c.key), categoryId: str(c.category_id), name: str(c.name) });

/** One row per price item; rows are grouped back into category → group → items. */
function toPriceLists(rows: RecordContent[]): PriceList[] {
  const lists: PriceList[] = [];
  for (const c of rows) {
    const categoryId = str(c.category_id);
    let list = lists.find((l) => l.categoryId === categoryId);
    if (!list) lists.push((list = { categoryId, groups: [] }));
    const groupId = str(c.group_id);
    let group = list.groups.find((g) => g.id === groupId);
    if (!group) list.groups.push((group = { id: groupId, title: str(c.group_title), items: [] }));
    group.items.push({
      name: str(c.name),
      unit: str(c.unit),
      min: num(c.min),
      ...(num(c.max) > 0 && { max: num(c.max) }),
      ...(str(c.note) && { note: str(c.note) }),
    });
  }
  return lists;
}

/** Paragraphs come from the news_body table: a record is too small (~1 KB) for a whole article. */
const toNews = (c: RecordContent, paragraphs: RecordContent[]): News => ({
  id: str(c.key),
  title: str(c.title),
  date: str(c.date),
  tag: str(c.tag),
  excerpt: str(c.excerpt),
  image: str(c.image),
  author: str(c.author),
  readMin: num(c.read_min),
  body: paragraphs.filter((p) => str(p.news_key) === str(c.key)).map((p) => str(p.text)),
});

const toPromo = (c: RecordContent): Promo => ({
  id: str(c.key),
  headline: str(c.headline),
  amount: str(c.amount),
  sub: str(c.sub),
  items: strList(c.items),
  foot: str(c.foot),
  colors: [str(c.color_from), str(c.color_to)],
});

const toTrade = (c: RecordContent): Trade => {
  const emojis = strList(c.emojis);
  return {
    id: str(c.key),
    title: str(c.title),
    subtitle: str(c.subtitle),
    lines: strList(c.lines),
    emojis: [emojis[0] ?? '', emojis[1] ?? '', emojis[2] ?? ''],
    colors: [str(c.color_from), str(c.color_to)],
    accent: str(c.accent),
  };
};

const toTier = (c: RecordContent): MemberTier => ({ name: str(c.name), from: num(c.from_points), benefit: str(c.benefit) });

async function load<T>(table: InkaTable, map: (rows: RecordContent[]) => T[]): Promise<T[] | null> {
  if (!hasTable(table)) return null;
  try {
    const out = map((await tableRows(table)).map((r) => r.content));
    return out.length ? out : null;
  } catch {
    return null;
  }
}

async function loadNews(): Promise<News[] | null> {
  const paragraphs = (await load('news_body', (rows) => rows)) ?? [];
  return load('news', (rows) => rows.map((c) => toNews(c, paragraphs)));
}

const each = <T>(fn: (c: RecordContent) => T) => (rows: RecordContent[]) => rows.map(fn);

/** Whatever could be loaded; a table that is missing, empty or unreachable is left out. */
export async function fetchCatalog(): Promise<Partial<Catalog>> {
  const [categories, services, priceLists, news, promos, trades, memberTiers] = await Promise.all([
    load('categories', each(toCategory)),
    load('services', each(toService)),
    load('prices', toPriceLists),
    loadNews(),
    load('promos', each(toPromo)),
    load('trades', each(toTrade)),
    load('member_tiers', (rows) => rows.map(toTier).sort((a, b) => a.from - b.from)),
  ]);
  return {
    ...(categories && { categories }),
    ...(services && { services }),
    ...(priceLists && { priceLists }),
    ...(news && { news }),
    ...(promos && { promos }),
    ...(trades && { trades }),
    ...(memberTiers && { memberTiers }),
  };
}
