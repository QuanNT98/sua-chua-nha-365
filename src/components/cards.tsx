import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Wrench, ChevronRight, ArrowRight, CircleDollarSign, CheckCircle2, XCircle, MapPin } from 'lucide-react-native';
import { Text, Tap, Row, Badge } from './ui';
import { useTheme, radius, space, shadow, formatRange, palette } from '@/theme';
import { MapCanvas } from './map';
import type { Category, Service, PriceItem } from '@/data';
import { warrantyActive, statusLabel, type Order } from '@/store';

/* Ô dịch vụ ở trang chủ: icon mascot (emoji) + tên 2 dòng */
export function CategoryTile({ item }: { item: Category }) {
  const router = useRouter();
  const go = () => {
    if (item.kind === 'pricing') router.push('/pricing/dien-nuoc');
    else if (item.kind === 'news') router.push('/news');
    else router.push(`/services?cat=${item.id}`);
  };
  return (
    <Tap onPress={go} style={{ width: '25%', alignItems: 'center', paddingVertical: 10 }}>
      <View style={styles.emojiWrap}>
        <Text size={38} style={{ lineHeight: 46 }}>
          {item.emoji}
        </Text>
      </View>
      <Text weight="semibold" size={12.5} style={{ textAlign: 'center', marginTop: 6, lineHeight: 17 }}>
        {item.name}
      </Text>
    </Tap>
  );
}

/* Dòng dịch vụ trong danh sách "Dịch vụ Sửa chữa nhà 365" */
export function ServiceRow({ item, onPress }: { item: Service; onPress: () => void }) {
  const t = useTheme();
  return (
    <Tap onPress={onPress} style={[styles.serviceRow, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
      <View style={[styles.wrench, { backgroundColor: t.primarySoft }]}>
        <Wrench size={18} color={t.primary} fill={t.primary} />
      </View>
      <Text weight="semibold" size={15} style={{ flex: 1 }}>
        {item.name}
      </Text>
      <ChevronRight size={20} color={t.textMute} />
    </Tap>
  );
}

/* Dòng bảng giá */
export function PriceRow({ item, onPress }: { item: PriceItem; onPress: () => void }) {
  const t = useTheme();
  return (
    <View style={[styles.priceRow, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
      <Row style={{ alignItems: 'flex-start', gap: 12 }}>
        <View style={[styles.dollar, { backgroundColor: t.primarySoft }]}>
          <CircleDollarSign size={20} color={t.primary} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text weight="semibold" size={15} style={{ lineHeight: 21 }}>
            {item.name}
          </Text>
          <Text size={13} tone="sub">
            Đơn vị: {item.unit}
          </Text>
          <Row style={{ gap: 4 }}>
            <Text size={13} tone="sub">
              Giá:
            </Text>
            <Text weight="bold" size={14} color={t.price}>
              {formatRange(item.min, item.max)}
            </Text>
          </Row>
        </View>
        <Tap onPress={onPress} style={[styles.goBtn, { backgroundColor: t.cardAlt }]}>
          <ArrowRight size={14} color={t.textSub} />
        </Tap>
      </Row>
      {!!item.note && (
        <View style={[styles.note, { backgroundColor: t.cardAlt }]}>
          <Text size={12.5} tone="sub" style={{ fontStyle: 'italic' }} numberOfLines={1}>
            Ghi chú: {item.note}
          </Text>
        </View>
      )}
    </View>
  );
}

/* Thẻ đơn trong Lịch sử công việc */
export function OrderCard({ item, onPress }: { item: Order; onPress: () => void }) {
  const t = useTheme();
  const done = item.status === 'done';
  const active = done && warrantyActive(item);
  return (
    <Tap onPress={onPress} style={[styles.order, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
      <Text weight="bold" size={13} color={t.primaryText}>
        #{item.code}
      </Text>
      <Text weight="bold" size={15} style={{ marginTop: 6, lineHeight: 22 }}>
        {item.title}
      </Text>
      <Text size={13} tone="sub" style={{ marginTop: 6 }}>
        Địa chỉ: {item.address}
      </Text>
      <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
        <Text size={13} tone="sub">
          Thời gian: {item.date}
        </Text>
        {done ? (
          <Row style={[styles.wBadge, { backgroundColor: active ? palette.greenSoft : t.cardAlt }]}>
            {active ? <CheckCircle2 size={14} color={palette.green} /> : <XCircle size={14} color={t.textMute} />}
            <Text weight="semibold" size={12} color={active ? palette.green : t.textMute}>
              {active ? 'Còn bảo hành' : 'Hết bảo hành'}
            </Text>
          </Row>
        ) : (
          <Badge label={statusLabel[item.status]} color={item.status === 'confirmed' ? palette.green : t.primaryText} soft={item.status === 'confirmed' ? palette.greenSoft : t.primarySoft} />
        )}
      </Row>
    </Tap>
  );
}

/* Bản đồ "Khu vực làm việc" ở trang chủ + nút Xem bản đồ chi tiết */
export function WorkAreaMap({ onPress }: { onPress?: () => void }) {
  const t = useTheme();
  return (
    <View style={styles.map}>
      <MapCanvas variant="home" style={StyleSheet.absoluteFill} />
      <Tap onPress={onPress} style={[styles.mapBtn, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
        <Row style={{ gap: 8 }}>
          <MapPin size={16} color={t.primary} fill={t.primary} />
          <Text size={14} weight="semibold">
            Xem bản đồ chi tiết
          </Text>
        </Row>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiWrap: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, marginHorizontal: space.lg, marginBottom: 12 },
  wrench: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  priceRow: { borderRadius: radius.lg, padding: 14, marginHorizontal: space.lg, marginBottom: 12, gap: 10 },
  dollar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  goBtn: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  note: { borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  order: { padding: 14, borderRadius: radius.md, marginHorizontal: space.lg, marginBottom: 12 },
  wBadge: { gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  map: { height: 250, borderRadius: radius.lg, marginHorizontal: space.lg, overflow: 'hidden' },
  mapBtn: { position: 'absolute', left: 12, bottom: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.full },
});
