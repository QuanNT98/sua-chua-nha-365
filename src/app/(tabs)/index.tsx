import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, CircleDollarSign } from 'lucide-react-native';
import { Text, Tap, Row } from '@/components/ui';
import { CategoryTile, WorkAreaMap } from '@/components/cards';
import { PromoCarousel, TradeCarousel, ArticleList, FloatingDiscount } from '@/components/home';
import { categories, user, promos, trades, news } from '@/data';
import { useStore } from '@/store';
import { useTheme, space, radius, shadow } from '@/theme';

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingHorizontal: space.lg, marginTop: 28, marginBottom: 14 }}>
      <Text weight="bold" size={22}>
        {title}
      </Text>
      {action && (
        <Tap onPress={onAction} hitSlop={10} haptic={false}>
          <Text size={14} tone="sub">
            {action}
          </Text>
        </Tap>
      )}
    </Row>
  );
}

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startDraft = useStore((s) => s.startDraft);
  const bookNow = () => {
    startDraft('', 'khac');
    router.push('/booking');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header vàng */}
        <LinearGradient colors={[t.headerTop, t.headerBottom]} style={{ paddingTop: insets.top + 10, paddingBottom: 6, paddingHorizontal: space.lg }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text size={17}>
              Xin chào, <Text weight="bold" size={17}>{user.name}</Text> 👋
            </Text>
            <Tap onPress={() => router.push('/member')} style={styles.points}>
              <View style={styles.coin}>
                <CircleDollarSign size={14} color="#fff" />
              </View>
              <Text weight="bold" size={13} color="#fff">
                {user.points.toLocaleString('vi-VN')} điểm
              </Text>
            </Tap>
          </Row>
          <Tap onPress={() => router.push('/services?focus=1')} style={[styles.search, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
            <Search size={20} color={t.textSub} />
            <Text size={15} tone="mute" style={{ flex: 1 }}>
              Hơn 100 dịch vụ Quý Khách đang cần?
            </Text>
          </Tap>
        </LinearGradient>

        {/* Đặt dịch vụ ngay */}
        <Text weight="bold" size={22} style={{ paddingHorizontal: space.lg, marginTop: 18 }}>
          Đặt dịch vụ ngay
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6, marginTop: 6 }}>
          {categories.map((c) => (
            <CategoryTile key={c.id} item={c} />
          ))}
        </View>

        {/* Khu vực làm việc */}
        <SectionTitle title="Khu vực làm việc" />
        <WorkAreaMap onPress={() => router.push('/map')} />

        {/* Chương trình khuyến mãi */}
        <SectionTitle title="Chương trình khuyến mãi" />
        <PromoCarousel data={promos} onPress={bookNow} />

        {/* Dịch vụ & Thương mại */}
        <SectionTitle title="Dịch vụ & Thương mại" />
        <TradeCarousel data={trades} onPress={() => router.push('/services?cat=dien-nuoc')} />

        {/* Bài viết nổi bật */}
        <SectionTitle title="Bài viết nổi bật" action="Xem thêm" onAction={() => router.push('/news')} />
        <ArticleList data={news} onPress={(id) => router.push(`/news/${id}`)} />

        <View style={{ alignItems: 'center', marginTop: 32, gap: 2 }}>
          <Text weight="bold" size={12} tone="mute">
            TÍN · TRÍ · TỐC · TINH · TÂM
          </Text>
          <Text size={11} tone="mute">
            Thợ Việt © 2026 · thợ của mọi nhà
          </Text>
        </View>
      </ScrollView>

      <FloatingDiscount bottom={16} onPress={bookNow} />
    </View>
  );
}

const styles = StyleSheet.create({
  points: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.35)', paddingLeft: 4, paddingRight: 12, paddingVertical: 4, borderRadius: 999 },
  coin: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F7B500', alignItems: 'center', justifyContent: 'center' },
  search: { marginTop: 18, height: 54, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 },
});
