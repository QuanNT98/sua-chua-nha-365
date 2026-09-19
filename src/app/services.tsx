import { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, FlatList, ScrollView, StyleSheet, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { Text, Chip, Tap, Row, Header } from '@/components/ui';
import { ServiceRow } from '@/components/cards';
import { services, serviceCategories, searchHints } from '@/data';
import { useStore } from '@/store';
import { useTheme, space, radius, font, shadow } from '@/theme';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

export default function ServicesScreen() {
  const t = useTheme();
  const router = useRouter();
  const { cat, focus } = useLocalSearchParams<{ cat?: string; focus?: string }>();
  const startDraft = useStore((s) => s.startDraft);
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string>('all');
  const inputRef = useRef<TextInput>(null);
  const { width: screenW } = useWindowDimensions();

  // Cuộn chip đang chọn vào giữa màn hình
  const chipsRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const onChipLayout = (id: string) => (e: LayoutChangeEvent) => {
    chipLayouts.current[id] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
    if (id === active) centerChip(id, false);
  };
  const centerChip = (id: string, animated = true) => {
    const l = chipLayouts.current[id];
    if (!l) return;
    chipsRef.current?.scrollTo({ x: Math.max(0, l.x + l.width / 2 - screenW / 2), animated });
  };
  useEffect(() => {
    centerChip(active);
  }, [active]);

  useEffect(() => {
    if (cat) setActive(cat);
  }, [cat]);
  useEffect(() => {
    if (focus) setTimeout(() => inputRef.current?.focus(), 300);
  }, [focus]);

  const list = useMemo(() => {
    let out = active === 'all' ? services : services.filter((s) => s.categoryId === active);
    if (q.trim()) out = out.filter((s) => norm(s.name).includes(norm(q)));
    return out;
  }, [active, q]);

  const book = (title: string, categoryId: string) => {
    startDraft(title, categoryId);
    router.push('/booking');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Header title="Dịch vụ Sửa chữa nhà 365" />
      <View style={{ paddingHorizontal: space.lg, paddingBottom: 6 }}>
        <View style={[styles.search, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
          <Search size={20} color={t.textSub} />
          <TextInput
            ref={inputRef}
            value={q}
            onChangeText={setQ}
            placeholder="Tìm kiếm dịch vụ..."
            placeholderTextColor={t.textMute}
            style={{ flex: 1, fontFamily: font.medium, fontSize: 15, color: t.text }}
          />
          {!!q && (
            <Tap onPress={() => setQ('')} haptic={false}>
              <X size={16} color={t.textMute} />
            </Tap>
          )}
        </View>
        <Text size={12.5} tone="sub" style={{ marginTop: 8, fontStyle: 'italic', lineHeight: 18 }}>
          Gợi ý tìm kiếm: {searchHints}
        </Text>
      </View>

      <View>
        <ScrollView ref={chipsRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 8, paddingVertical: 10 }}>
          <View onLayout={onChipLayout('all')}>
            <Chip label="Tất cả" active={active === 'all'} onPress={() => setActive('all')} />
          </View>
          {serviceCategories.map((c) => (
            <View key={c.id} onLayout={onChipLayout(c.id)}>
              <Chip label={c.name.replace('\n', ' ')} active={active === c.id} onPress={() => setActive(c.id)} />
            </View>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <Row style={{ paddingHorizontal: space.lg, gap: 8, marginBottom: 12, marginTop: 4 }}>
            <Text weight="bold" size={17}>
              {active === 'all' ? 'Tất cả dịch vụ' : serviceCategories.find((c) => c.id === active)?.name.replace('\n', ' ')}
            </Text>
            <View style={[styles.count, { backgroundColor: t.primary }]}>
              <Text weight="bold" size={12} color={t.onPrimary}>
                {active === 'all' && !q ? 443 : list.length}
              </Text>
            </View>
          </Row>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40, gap: 12, paddingHorizontal: 40 }}>
            <Text size={14} tone="sub" style={{ textAlign: 'center' }}>
              Không tìm thấy “{q}”. Bạn vẫn có thể đặt lịch với nội dung này.
            </Text>
            <Tap onPress={() => book(q, 'khac')} style={[styles.bookAnyway, { backgroundColor: t.primary }]}>
              <Text weight="bold" size={14} color={t.onPrimary}>
                Đặt lịch “{q}”
              </Text>
            </Tap>
          </View>
        }
        renderItem={({ item }) => <ServiceRow item={item} onPress={() => book(item.name, item.categoryId)} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { marginTop: 4, height: 50, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 },
  count: { paddingHorizontal: 10, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bookAnyway: { paddingHorizontal: 18, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
