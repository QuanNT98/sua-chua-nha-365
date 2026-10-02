import { useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Header, Button } from '@/components/ui';
import { useStore } from '@/store';
import { useTheme, space, radius, font } from '@/theme';

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <Text weight="bold" size={15} style={{ marginBottom: 8, marginTop: 18 }}>
      {children} {required && <Text color="#E5484D" size={15}>*</Text>}
    </Text>
  );
}

export default function ProfileEditScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [saving, setSaving] = useState(false);
  const inputStyle = [styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: font.medium }];

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone, address: address.trim() });
      router.back();
    } catch (e) {
      setSaving(false);
      Alert.alert('Chưa lưu được', `${e instanceof Error ? e.message : String(e)}\nVui lòng kiểm tra kết nối và thử lại.`);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <Header title="Thông tin cá nhân" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120 }}>
        <Label required>Họ và tên</Label>
        <TextInput value={name} onChangeText={setName} placeholder="Họ và tên" placeholderTextColor={t.textMute} style={inputStyle} />

        <Label>Số điện thoại</Label>
        <TextInput value={phone} onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 11))} keyboardType="number-pad" placeholder="Số điện thoại liên hệ" placeholderTextColor={t.textMute} style={inputStyle} />

        <Label>Địa chỉ</Label>
        <TextInput value={address} onChangeText={setAddress} multiline placeholder="Số nhà, đường, phường, quận" placeholderTextColor={t.textMute} style={[...inputStyle, { minHeight: 76, textAlignVertical: 'top' }]} />
        <Text size={12.5} tone="sub" style={{ marginTop: 12, lineHeight: 18 }}>
          Thông tin này được điền sẵn mỗi khi bạn đặt lịch.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: t.card, paddingBottom: insets.bottom + 12, borderTopColor: t.border }]}>
        <Button title="Lưu" loading={saving} disabled={!name.trim()} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: 12, borderTopWidth: 1 },
});
