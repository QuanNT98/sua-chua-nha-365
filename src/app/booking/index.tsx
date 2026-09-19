import { useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Check } from 'lucide-react-native';
import { Text, Header, Button, Tap, Chip, Row } from '@/components/ui';
import { timeSlots } from '@/data';
import { useStore } from '@/store';
import { useTheme, space, radius, font } from '@/theme';

const days = (() => {
  const dows = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { dow: dows[d.getDay()], day: d.getDate(), date: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}` };
  });
})();

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <Text weight="bold" size={15} style={{ marginBottom: 8, marginTop: 18 }}>
      {children} {required && <Text color="#E5484D" size={15}>*</Text>}
    </Text>
  );
}

export default function BookingScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, setDraft, placeOrder } = useStore();
  const [loading, setLoading] = useState(false);
  const inputStyle = [styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: font.medium }];
  const valid = draft.title.trim() && draft.address.trim() && draft.phone.length >= 9 && draft.name.trim();

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      const o = placeOrder();
      router.replace(`/booking/success?id=${o.id}`);
    }, 800);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <Header title="Đặt lịch nhanh chóng" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120 }}>
        <Label required>Nội dung công việc</Label>
        <TextInput value={draft.title} onChangeText={(title) => setDraft({ title })} multiline placeholder="VD: Vệ sinh máy lạnh 2 máy" placeholderTextColor={t.textMute} style={[...inputStyle, { minHeight: 100, textAlignVertical: 'top' }]} />
        <Tap onPress={() => setDraft({ consultFirst: !draft.consultFirst })} haptic={false} style={styles.checkRow}>
          <View style={[styles.checkbox, { borderColor: draft.consultFirst ? t.primary : t.textSub, backgroundColor: draft.consultFirst ? t.primary : 'transparent' }]}>
            {draft.consultFirst && <Check size={14} color={t.onPrimary} strokeWidth={3} />}
          </View>
          <Text size={15}>Yêu cầu tư vấn, báo giá trước</Text>
        </Tap>

        <Label required>Địa chỉ</Label>
        <View style={[styles.input, styles.addrBox, { backgroundColor: t.card, borderColor: t.border }]}>
          <TextInput value={draft.address} onChangeText={(address) => setDraft({ address })} placeholder="Số nhà, đường, phường, quận" placeholderTextColor={t.textMute} style={{ flex: 1, fontFamily: font.medium, fontSize: 15, color: t.text }} />
          <Search size={20} color={t.primary} />
        </View>

        <Label required>Số điện thoại</Label>
        <View style={[styles.input, styles.addrBox, { backgroundColor: t.card, borderColor: t.border, paddingLeft: 0 }]}>
          <Row style={[styles.flag, { borderRightColor: t.border }]}>
            <Text size={18}>🇻🇳</Text>
            <Text weight="semibold" size={15}>
              +84
            </Text>
          </Row>
          <TextInput value={draft.phone} onChangeText={(phone) => setDraft({ phone: phone.replace(/\D/g, '').slice(0, 10) })} keyboardType="number-pad" style={{ flex: 1, fontFamily: font.medium, fontSize: 15, color: t.text, paddingLeft: 14 }} />
        </View>

        <Label required>Họ và tên</Label>
        <TextInput value={draft.name} onChangeText={(name) => setDraft({ name })} placeholder="Họ và tên" placeholderTextColor={t.textMute} style={inputStyle} />

        <Label>Ghi chú</Label>
        <TextInput value={draft.note} onChangeText={(note) => setDraft({ note })} multiline placeholder="Vui lòng nhập ghi chú nếu có" placeholderTextColor={t.textMute} style={[...inputStyle, { minHeight: 76, textAlignVertical: 'top' }]} />

        <Label>Chọn ngày & giờ</Label>
        <Row style={{ gap: 8 }}>
          {days.slice(0, 5).map((d) => {
            const on = d.date === draft.date;
            return (
              <Tap key={d.date} onPress={() => setDraft({ date: d.date })} style={[styles.day, { backgroundColor: on ? t.primary : t.cardAlt }]}>
                <Text weight="bold" size={13} color={on ? t.onPrimary : t.textSub}>
                  {d.dow}
                </Text>
                <Text weight="bold" size={16} color={on ? t.onPrimary : t.text}>
                  {d.day}
                </Text>
              </Tap>
            );
          })}
        </Row>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {timeSlots.map((s) => (
            <Chip key={s} label={s} active={s === draft.time} onPress={() => setDraft({ time: s })} />
          ))}
        </View>
        <Text size={12.5} tone="sub" style={{ marginTop: 12, lineHeight: 18, fontStyle: 'italic' }}>
          Sau khi đặt lịch, tổng đài Sửa chữa nhà 365 sẽ gọi xác nhận trong 5–10 phút. Giảm 50K khi đặt lịch trên ứng dụng.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: t.card, paddingBottom: insets.bottom + 12, borderTopColor: t.border }]}>
        <Button title="Đặt lịch ngay" loading={loading} disabled={!valid} onPress={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  addrBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 0, height: 54 },
  flag: { gap: 6, paddingHorizontal: 14, height: '100%', borderRightWidth: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  day: { flex: 1, height: 60, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: 12, borderTopWidth: 1 },
});
