import { View, ScrollView, StyleSheet } from 'react-native';
import { ArrowUpCircle, Crown, AlertCircle, Percent, Clock, Headphones, Gift, Check } from 'lucide-react-native';
import { Text, Header, Screen, Card, Row } from '@/components/ui';
import { user, memberBenefits, memberTiers } from '@/data';
import { useTheme, space, radius, formatVND } from '@/theme';

const icons: Record<string, any> = { percent: Percent, clock: Clock, headphones: Headphones, gift: Gift };

export default function MemberScreen() {
  const t = useTheme();
  const need = user.nextTierAt - user.points;
  const pct = Math.min(100, Math.round((user.points / user.nextTierAt) * 100));
  return (
    <Screen>
      <Header title="Chương trình thành viên" />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Row style={{ gap: 10 }}>
          <ArrowUpCircle size={24} color={t.primary} />
          <View>
            <Text weight="bold" size={18}>
              Tiến độ nâng cấp
            </Text>
            <Text size={13} tone="sub">
              Tiến tới {user.nextTier}
            </Text>
          </View>
        </Row>

        <Card style={{ marginTop: 14, backgroundColor: t.isDark ? t.card : '#FFFBEE', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Crown size={26} color={t.primaryText} />
          <View>
            <Text weight="bold" size={15} color={t.primaryText}>
              Cấp độ hiện tại: {user.tier}
            </Text>
            <Text size={13} tone="sub">
              Tổng điểm tích lũy: {user.points.toLocaleString('vi-VN')}
            </Text>
          </View>
        </Card>

        <Row style={{ justifyContent: 'space-between', marginTop: 18 }}>
          <Text size={13} tone="sub">
            {user.tier}
          </Text>
          <Text weight="bold" size={14} color={t.primaryText}>
            {user.points.toLocaleString('vi-VN')}/{user.nextTierAt.toLocaleString('vi-VN')} điểm
          </Text>
          <Text size={13} tone="sub">
            {user.nextTier}
          </Text>
        </Row>
        <View style={[styles.bar, { backgroundColor: t.cardAlt }]}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: t.primary }]} />
        </View>

        <Card style={{ marginTop: 16, backgroundColor: t.isDark ? t.card : '#FFFBEE', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <AlertCircle size={24} color={t.primaryText} />
          <View>
            <Text weight="bold" size={15} color={t.primaryText}>
              Cần thêm {need.toLocaleString('vi-VN')} điểm
            </Text>
            <Text size={13} tone="sub">
              Tương đương {formatVND(need * 10000)}đ chi tiêu
            </Text>
          </View>
        </Card>

        <Text weight="bold" size={18} style={{ marginTop: 28 }}>
          Phúc Lợi Thành Viên
        </Text>
        {memberBenefits.map((b) => {
          const Icon = icons[b.icon];
          return (
            <Row key={b.title} style={{ gap: 14, marginTop: 16 }}>
              <View style={[styles.benefit, { backgroundColor: t.primarySoft }]}>
                <Icon size={20} color={t.primaryText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="bold" size={15}>
                  {b.title}
                </Text>
                <Text size={13} tone="sub" style={{ lineHeight: 19 }}>
                  {b.desc}
                </Text>
              </View>
            </Row>
          );
        })}

        <Text weight="bold" size={18} style={{ marginTop: 28 }}>
          Cấp Bậc Thành Viên
        </Text>
        <Text size={13} tone="sub" style={{ fontStyle: 'italic', marginTop: 4 }}>
          Công thức tích điểm: 10.000đ = 1 điểm
        </Text>
        <Card style={{ marginTop: 12, padding: 0 }}>
          {memberTiers.map((tier, i) => {
            const on = tier.name === user.tier;
            return (
              <Row key={tier.name} style={[styles.tierRow, { borderTopWidth: i ? 1 : 0, borderTopColor: t.border, backgroundColor: on ? t.primarySoft : 'transparent' }]}>
                <Crown size={18} color={on ? t.primaryText : t.textMute} />
                <View style={{ flex: 1 }}>
                  <Text weight="bold" size={14} color={on ? t.primaryText : t.text}>
                    {tier.name}
                  </Text>
                  <Text size={12} tone="sub">
                    Từ {tier.from.toLocaleString('vi-VN')} điểm · {tier.benefit}
                  </Text>
                </View>
                {on && <Check size={18} color={t.primaryText} />}
              </Row>
            );
          })}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { height: 8, borderRadius: 4, marginTop: 8 },
  fill: { height: 8, borderRadius: 4 },
  benefit: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tierRow: { gap: 12, padding: 14 },
});
