import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, PhoneCall } from 'lucide-react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Text, Button, Card, Row } from '@/components/ui';
import { useStore } from '@/store';
import { useTheme, palette } from '@/theme';

export default function Success() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useStore((s) => s.orders.find((o) => o.id === id))!;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top, paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.circle, { backgroundColor: palette.green }]}>
          <View style={styles.ring} />
          <Check size={48} color="#fff" strokeWidth={3} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)} style={{ alignItems: 'center', gap: 6 }}>
          <Text weight="bold" size={24}>
            Đặt lịch thành công!
          </Text>
          <Text size={14} tone="sub" style={{ textAlign: 'center', lineHeight: 22 }}>
            Mã lịch hẹn <Text weight="bold" size={14} color={t.primaryText}>#{order.code}</Text>
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(350)} style={{ width: '100%' }}>
          <Card style={{ gap: 10 }}>
            <Row style={{ gap: 10 }}>
              <PhoneCall size={18} color={t.primary} />
              <Text weight="semibold" size={14} style={{ flex: 1, lineHeight: 20 }}>
                Tổng đài Thợ Việt sẽ gọi số {order.phone} để xác nhận trong 5–10 phút.
              </Text>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text size={13} tone="sub">
                Nội dung
              </Text>
              <Text weight="semibold" size={13} style={{ maxWidth: '65%', textAlign: 'right' }} numberOfLines={2}>
                {order.title}
              </Text>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text size={13} tone="sub">
                Thời gian
              </Text>
              <Text weight="semibold" size={13}>
                {order.date} · {order.time}
              </Text>
            </Row>
          </Card>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.delay(500)} style={{ gap: 10 }}>
        <Button title="Xem lịch hẹn" onPress={() => router.replace(`/order/${order.id}`)} />
        <Button title="Về trang chủ" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 12, borderColor: 'rgba(46,160,67,0.15)' },
});
