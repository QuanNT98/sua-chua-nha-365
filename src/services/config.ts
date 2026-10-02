/**
 * IDs on inka.vn for this app. Written by `node scripts/setup-inka.mjs`
 * (run it on a network that can reach inka.vn ports 8000–8063, e.g. 4G).
 *
 * While a table id is empty the app uses the bundled data in src/data for it.
 */
export const INKA = {
  dbId: '00000000001d0080',
  tables: {
    orders: '00000000001d0100',
    profiles: '00000000001d0700',
    feedback: '00000000001d0880',
    categories: '00000000001d0900',
    services: '00000000001d0980',
    prices: '00000000001d0a00',
    news: '00000000001d0a80',
    news_body: '00000000001d0b00',
    promos: '00000000001d0b80',
    trades: '00000000001d0c00',
    member_tiers: '00000000001d0c80',
  },
};

export type InkaTable = keyof typeof INKA.tables;

export const hasTable = (name: InkaTable) => INKA.tables[name] !== '';
