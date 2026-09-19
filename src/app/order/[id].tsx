import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, MapPin, Calendar, Phone, User, ShieldCheck, FileText, Clock } from 'lucide-react-native';
import { Text, Header, Screen, Card, Row, Button, Divider, Badge } from '@/components/ui';
import { useStore, statusLabel, warrantyActive, type OrderStatus } from '@/store';
import { getCategory } from '@/data';
import { useTheme, space, palette } from '@/theme';

const steps: { key: OrderStatus; title: string; desc: string }[] = [
  { key: 'booked', title: 'Đã đặt lịch', desc: 'Sửa chữa nhà 365 đã tiếp nhận yêu cầu của bạn' },
  { key: 'confirmed', title: 'Đã xác nhận', desc: 'Tổng đài đã gọi xác nhận, thợ sẽ đến đúng hẹn' },
  { key: 'done', title: 'Đã làm', desc: 'Công việc hoàn tất, bắt đầu tính bảo hành' },
];

export default function OrderDetail() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const startDraft = useStore((s) => s.startDraft);
  if (!order) return null;
  const current = steps.findIndex((s) => s.key === order.status);
  const cat = getCategory(order.categoryId);
  const done = order.status === 'done';
  const active = done && warrantyActive(order);

  const rows = [
    { icon: FileText, label: 'Nội dung', value: order.title },
    { icon: MapPin, label: 'Địa chỉ', value: order.address },
    { icon: Calendar, label: 'Thời gian', value: `${order.date} · ${order.time}` },
    { icon: User, label: 'Khách hàng', value: order.name },
    { icon: Phone, label: 'Điện thoại', value: order.phone },
  ];

  return (
    <Screen>
      <Header title={`#${order.code}`} />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 120, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 8 }}>
            <Text size={26} style={{ lineHeight: 32 }}>
              {cat?.emoji}
            </Text>
            <View>
              <Text size={12} tone="sub">
                {cat?.name.replace('\n', ' ')}
              </Text>
              <Text weight="bold" size={17}>
                {statusLabel[order.status]}
              </Text>
            </View>
          </Row>
          {done ? (
            <Badge label={active ? 'Còn bảo hành' : 'Hết bảo hành'} color={active ? palette.green : t.textMute} soft={active ? palette.greenSoft : t.cardAlt} />
          ) : (
            order.consultFirst && <Badge label="Tư vấn, báo giá trước" color={t.primaryText} soft={t.primarySoft} />
          )}
        </Row>

        <Card>
          {steps.map((s, i) => {
            const isDone = i <= current;
            const isCur = i === current;
            return (
              <Row key={s.key} style={{ alignItems: 'flex-start', gap: 14 }}>
                <View style={{ alignItems: 'center', width: 24 }}>
                  <View style={[styles.dot, { backgroundColor: isDone ? t.primary : t.cardAlt, borderColor: isCur ? t.primaryText : 'transparent' }]}>{isDone && <Check size={14} color={t.onPrimary} strokeWidth={3} />}</View>
                  {i < steps.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 26, backgroundColor: i < current ? t.primary : t.border, marginVertical: 2 }} />}
                </View>
                <View style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 12 : 0 }}>
                  <Text weight="bold" size={14} tone={isDone ? 'text' : 'mute'}>
                    {s.title}
                  </Text>
                  {isDone && (
                    <Text size={12.5} tone="sub">
                      {s.desc}
                    </Text>
                  )}
                </View>
              </Row>
            );
          })}
        </Card>

        <Card style={{ gap: 12 }}>
          {rows.map((r, i) => (
            <View key={r.label}>
              <Row style={{ alignItems: 'flex-start', gap: 10 }}>
                <r.icon size={16} color={t.textMute} style={{ marginTop: 2 }} />
                <Text size={13} tone="sub" style={{ width: 80 }}>
                  {r.label}
                </Text>
                <Text weight="semibold" size={13.5} style={{ flex: 1, lineHeight: 20 }}>
                  {r.value}
                </Text>
              </Row>
              {i < rows.length - 1 && <Divider style={{ marginTop: 12 }} />}
            </View>
          ))}
          {!!order.note && (
            <>
              <Divider />
              <Text size={13} tone="sub" style={{ fontStyle: 'italic' }}>
                Ghi chú: {order.note}
              </Text>
            </>
          )}
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.shield, { backgroundColor: palette.greenSoft }]}>
            <ShieldCheck size={22} color={palette.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text weight="bold" size={14}>
              Bảo hành {order.warrantyMonths} tháng
            </Text>
            <Text size={12.5} tone="sub" style={{ lineHeight: 18 }}>
              {done ? 'Tính từ ngày hoàn thành. Hoàn tiền 100% nếu không xử lý dứt điểm.' : 'Áp dụng sau khi công việc hoàn tất.'}
            </Text>
          </View>
        </Card>

        {!done && (
          <Row style={{ gap: 8, paddingHorizontal: 4 }}>
            <Clock size={14} color={t.textMute} />
            <Text size={12.5} tone="sub" style={{ flex: 1, lineHeight: 18 }}>
              Cần đổi lịch hoặc huỷ? Gọi hotline 1800 8122 (miễn phí).
            </Text>
          </Row>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: t.card, paddingBottom: insets.bottom + 12, borderTopColor: t.border }]}>
        {done ? (
          <Button
            title={active ? 'Yêu cầu bảo hành' : 'Đặt lại dịch vụ này'}
            onPress={() => {
              startDraft(active ? `[Bảo hành #${order.code}] ${order.title}` : order.title, order.categoryId);
              router.push('/booking');
            }}
          />
        ) : (
          <Button title="Gọi tổng đài 1800 8122" icon={<Phone size={18} color={t.onPrimary} />} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  shield: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: 12, borderTopWidth: 1 },
});
