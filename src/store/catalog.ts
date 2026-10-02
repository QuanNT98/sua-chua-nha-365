import { create } from 'zustand';
import { categories, memberTiers, news, priceLists, promos, services, trades } from '@/data';
import { fetchCatalog, type Catalog, type MemberTier } from '@/services/catalog';

type CatalogState = Catalog & {
  /** Replaces the bundled data with whatever the server has. */
  load: () => Promise<void>;
};

/** Starts with the data bundled in the app, so every screen renders before (or without) the server. */
export const useCatalog = create<CatalogState>((set, get) => ({
  categories,
  services,
  priceLists,
  news,
  promos,
  trades,
  memberTiers,
  load: async () => {
    const loaded = await fetchCatalog();
    // Keep the lists that did not change, so screens showing them do not re-render.
    const current = get();
    const changed = (Object.keys(loaded) as (keyof Catalog)[]).filter((k) => JSON.stringify(loaded[k]) !== JSON.stringify(current[k]));
    if (changed.length) set(Object.fromEntries(changed.map((k) => [k, loaded[k]])));
  },
}));

export const useCategory = (id: string | undefined) => useCatalog((s) => s.categories.find((c) => c.id === id));

/** Current tier for a points total, and the next one to reach (the top tier points at itself). */
export function tierInfo(points: number, tiers: MemberTier[]) {
  const sorted = [...tiers].sort((a, b) => a.from - b.from);
  const index = Math.max(0, sorted.filter((x) => x.from <= points).length - 1);
  const next = sorted[index + 1];
  return {
    tier: sorted[index]?.name ?? '',
    nextTier: next?.name ?? sorted[index]?.name ?? '',
    nextTierAt: next?.from ?? Math.max(points, 1),
  };
}
