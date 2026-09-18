import { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ClipboardList } from 'lucide-react-native';
import { Text, Tap, Button } from '@/components/ui';
import { OrderCard } from '@/components/cards';
import { useStore } from '@/store';
import { useTheme, space } from '@/theme';

export default function HistoryScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const orders = useStore((s) => s.orders);
  const [tab, setTab] = useState<'booked' | 'done'>('booked');
  const list = orders.filter((o) => (tab === 'done' ? o.status === 'done' : o.status !== 'done'));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient colors={[t.headerTop, t.headerBottom]} style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}>
        <Text weight="bold" size={20} style={{ textAlign: 'center' }}>
          Lịch sử công việc
        </Text>
      </LinearGradient>

      <View style={[styles.tabs, { borderBottomColor: t.border }]}>
        {(['booked', 'done'] as const).map((k) => {
          const on = tab === k;
          return (
            <Tap key={k} onPress={() => setTab(k)} haptic={false} style={styles.tab}>
              <Text weight="bold" size={16} color={on ? t.primaryText : t.text}>
                {k === 'booked' ? 'Đã đặt' : 'Đã làm'}
              </Text>
              <View style={[styles.underline, { backgroundColor: on ? t.primary : 'transparent' }]} />
            </Tap>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 32, flexGrow: 1 }}
        renderItem={({ item }) => <OrderCard item={item} onPress={() => router.push(`/order/${item.id}`)} />}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 }}>
            <View style={[styles.empty, { backgroundColor: t.primarySoft }]}>
              <ClipboardList size={36} color={t.primary} />
            </View>
            <Text weight="bold" size={16}>
              Chưa có lịch hẹn nào
            </Text>
            <Button title="Đặt lịch ngay" size="md" onPress={() => router.push('/services')} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: space.lg },
  tab: { flex: 1, alignItems: 'center', paddingTop: 12 },
  underline: { height: 3, borderRadius: 2, alignSelf: 'stretch', marginTop: 10 },
  empty: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
