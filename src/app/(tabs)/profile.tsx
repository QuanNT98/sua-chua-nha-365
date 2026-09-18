import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, MapPin, ShieldCheck, CircleDollarSign, Newspaper, Phone, FileText, ChevronRight, LogOut, Pencil, Moon } from 'lucide-react-native';
import { Text, Row, Card, Tap, Divider } from '@/components/ui';
import { user } from '@/data';
import { useStore } from '@/store';
import { useTheme, space, radius, palette } from '@/theme';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useStore((s) => s.logout);
  const orders = useStore((s) => s.orders);

  const groups = [
    {
      title: 'Tiện ích',
      items: [
        { icon: Crown, label: 'Chương trình thành viên', sub: `Hạng ${user.tier} · ${user.points.toLocaleString('vi-VN')} điểm`, color: '#D99A00', to: '/member' },
        { icon: ShieldCheck, label: 'Lịch sử bảo hành', sub: `${orders.filter((o) => o.status === 'done').length} công việc đã làm`, color: palette.green, to: '/(tabs)/history' },
        { icon: CircleDollarSign, label: 'Bảng giá dịch vụ', sub: 'Giá cả minh bạch', color: '#2563EB', to: '/pricing/dien-nuoc' },
        { icon: Newspaper, label: 'Tin tức', sub: 'Khuyến mãi & mẹo hay', color: '#7C3AED', to: '/news' },
      ],
    },
    {
      title: 'Tài khoản',
      items: [
        { icon: MapPin, label: 'Địa chỉ', sub: user.address, color: '#E5484D' },
        { icon: Moon, label: 'Giao diện', sub: 'Theo hệ thống', color: '#64748B' },
      ],
    },
    {
      title: 'Hỗ trợ',
      items: [
        { icon: Phone, label: 'Hotline 1800 8122', sub: 'Miễn phí · 7:00 – 21:00', color: palette.green },
        { icon: FileText, label: 'Chính sách phục vụ khách hàng', sub: 'thoviet.com.vn', color: '#64748B' },
      ],
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[t.headerTop, t.headerBottom]} style={{ paddingTop: insets.top + 10, paddingBottom: 20, paddingHorizontal: space.lg }}>
        <Text weight="bold" size={20} style={{ textAlign: 'center' }}>
          Tài khoản
        </Text>
        <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radius.lg }}>
          <View style={[styles.avatar, { backgroundColor: t.primarySoft }]}>
            <Text size={30} style={{ lineHeight: 36 }}>
              👷
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text weight="bold" size={17}>
              {user.name}
            </Text>
            <Text size={13} tone="sub">
              {user.phone}
            </Text>
            <Row style={[styles.tier, { backgroundColor: t.primarySoft }]}>
              <Crown size={12} color="#D99A00" fill="#D99A00" />
              <Text weight="bold" size={11} color="#B8860B">
                Thành viên {user.tier}
              </Text>
            </Row>
          </View>
          <Tap style={[styles.edit, { backgroundColor: t.cardAlt }]}>
            <Pencil size={16} color={t.text} />
          </Tap>
        </Card>
      </LinearGradient>

      {groups.map((g) => (
        <View key={g.title} style={{ marginTop: 16 }}>
          <Text weight="bold" size={12} tone="mute" style={{ paddingHorizontal: space.lg, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {g.title}
          </Text>
          <Card style={{ marginHorizontal: space.lg, padding: 0, borderRadius: radius.lg, overflow: 'hidden' }}>
            {g.items.map((it, i) => (
              <View key={it.label}>
                <Tap onPress={() => 'to' in it && it.to && router.push(it.to as any)} scale={false} haptic="selection" pressedStyle={{ backgroundColor: t.cardAlt }} style={styles.item}>
                  <View style={[styles.icon, { backgroundColor: it.color + (t.isDark ? '33' : '18') }]}>
                    <it.icon size={18} color={it.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text weight="semibold" size={14}>
                      {it.label}
                    </Text>
                    <Text size={12} tone="mute" numberOfLines={1}>
                      {it.sub}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={t.textMute} />
                </Tap>
                {i < g.items.length - 1 && <Divider style={{ marginLeft: 62 }} />}
              </View>
            ))}
          </Card>
        </View>
      ))}

      <Tap
        onPress={() => {
          logout();
          router.replace('/login');
        }}
        scale={false}
        haptic="selection"
        pressedStyle={{ backgroundColor: t.cardAlt }}
        style={[styles.logout, { borderColor: t.border }]}>
        <LogOut size={18} color="#E5484D" />
        <Text weight="bold" size={14} color="#E5484D">
          Đăng xuất
        </Text>
      </Tap>
      <Text size={11} tone="mute" style={{ textAlign: 'center', marginTop: 14 }}>
        Phiên bản 4.7.1 (demo)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  tier: { alignSelf: 'flex-start', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  edit: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logout: { marginHorizontal: space.lg, marginTop: 24, height: 50, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
