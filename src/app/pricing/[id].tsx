import { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Header, Screen, Tap, Chip } from '@/components/ui';
import { PriceRow } from '@/components/cards';
import { priceLists, getPriceList, getCategory } from '@/data';
import { useStore } from '@/store';
import { useTheme, space } from '@/theme';

export default function PricingScreen() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const startDraft = useStore((s) => s.startDraft);
  const [catId, setCatId] = useState(id);
  const list = getPriceList(catId) ?? priceLists[0];
  const [group, setGroup] = useState(list.groups[0].id);
  useEffect(() => setGroup(list.groups[0].id), [catId]);
  const items = list.groups.find((g) => g.id === group)?.items ?? [];
  const catName = getCategory(list.categoryId)?.name.replace('\n', ' ');

  return (
    <Screen>
      <Header title={`Bảng giá - ${catName}`} />
      {/* Chọn nhóm dịch vụ */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 8, paddingBottom: 6 }}>
          {priceLists.map((p) => (
            <Chip key={p.categoryId} label={getCategory(p.categoryId)!.name.replace('\n', ' ')} active={p.categoryId === list.categoryId} onPress={() => setCatId(p.categoryId)} />
          ))}
        </ScrollView>
      </View>
      {/* Tab nhóm như app gốc */}
      <View style={[styles.tabsWrap, { borderBottomColor: t.border, backgroundColor: t.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg }}>
          {list.groups.map((g) => {
            const on = g.id === group;
            return (
              <Tap key={g.id} onPress={() => setGroup(g.id)} haptic={false} style={styles.tab}>
                <Text weight="bold" size={15} color={on ? t.primaryText : t.textSub}>
                  {g.title}
                </Text>
                <View style={[styles.underline, { backgroundColor: on ? t.primary : 'transparent' }]} />
              </Tap>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.name}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <PriceRow
            item={item}
            onPress={() => {
              startDraft(item.name, list.categoryId);
              router.push('/booking');
            }}
          />
        )}
        ListFooterComponent={
          <Text size={12} tone="mute" style={{ textAlign: 'center', paddingHorizontal: 32, lineHeight: 18, marginTop: 8 }}>
            Giá tham khảo, chưa bao gồm VAT. Thợ sẽ báo giá chính xác sau khi khảo sát thực tế.
          </Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsWrap: { borderBottomWidth: 1 },
  tab: { paddingTop: 12, paddingHorizontal: 12, alignItems: 'center' },
  underline: { height: 3, borderRadius: 2, alignSelf: 'stretch', marginTop: 10 },
});
