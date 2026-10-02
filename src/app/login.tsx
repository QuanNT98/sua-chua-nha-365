import { useEffect, useRef, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Text, Button, Tap } from '@/components/ui';
import { useStore, authErrorText } from '@/store';
import { useTheme, radius, font } from '@/theme';

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useStore((s) => s.signIn);
  const tryNow = useStore((s) => s.tryNow);
  const [step, setStep] = useState<'phone' | 'password'>('phone');
  const [phone, setPhone] = useState('0968409323');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'sign-in' | 'try-now' | null>(null);
  const [error, setError] = useState('');
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (step === 'password') setTimeout(() => passwordRef.current?.focus(), 300);
  }, [step]);

  const run = async (kind: 'sign-in' | 'try-now') => {
    setLoading(kind);
    setError('');
    try {
      await (kind === 'sign-in' ? signIn(phone, password) : tryNow());
      router.replace('/(tabs)');
    } catch (e) {
      setError(authErrorText(e));
      setLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient colors={[t.headerTop, t.headerBottom]} style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' }}>
        {step === 'password' && (
          <Tap onPress={() => { setStep('phone'); setError(''); }} style={[styles.back, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
            <ChevronLeft size={22} color={t.text} />
          </Tap>
        )}
        <View style={styles.logo}>
          <Text size={44} style={{ lineHeight: 52 }}>
            👷
          </Text>
        </View>
        <Text weight="bold" size={26} style={{ marginTop: 12 }}>
          Sửa chữa nhà 365
        </Text>
        <Text weight="semibold" size={13} tone="sub" style={{ letterSpacing: 1 }}>
          TÍN · TRÍ · TỐC · TINH · TÂM
        </Text>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {step === 'phone' ? (
          <Animated.View entering={FadeIn}>
            <Text weight="bold" size={20}>
              Đăng nhập
            </Text>
            <Text size={14} tone="sub" style={{ marginTop: 6, lineHeight: 22 }}>
              Nhập số điện thoại để đăng nhập hoặc tạo tài khoản mới.
            </Text>
            <Text weight="semibold" size={14} style={{ marginTop: 22, marginBottom: 8 }}>
              Số điện thoại <Text color="#E5484D">*</Text>
            </Text>
            <View style={[styles.input, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={[styles.flag, { borderRightColor: t.border }]}>
                <Text size={18}>🇻🇳</Text>
                <Text weight="semibold" size={15}>
                  +84
                </Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
                placeholder="Số điện thoại"
                placeholderTextColor={t.textMute}
                style={{ flex: 1, fontFamily: font.semibold, fontSize: 17, color: t.text, paddingHorizontal: 14 }}
              />
            </View>
            <Button title="Tiếp tục" disabled={phone.length < 9 || loading !== null} onPress={() => setStep('password')} style={{ marginTop: 22 }} />
            <Button title="Dùng thử không cần tài khoản" variant="ghost" size="md" loading={loading === 'try-now'} disabled={loading !== null} onPress={() => run('try-now')} style={{ marginTop: 8 }} />
            {error !== '' && (
              <Text size={13} color="#E5484D" style={{ marginTop: 8, textAlign: 'center' }}>
                {error}
              </Text>
            )}
            <Text size={12} tone="mute" style={{ marginTop: 16, textAlign: 'center', lineHeight: 18 }}>
              Bằng việc tiếp tục, bạn đồng ý với <Text size={12} tone="primary" weight="semibold">Chính sách phục vụ khách hàng</Text> của Sửa chữa nhà 365.
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInRight}>
            <Text weight="bold" size={20}>
              Nhập mật khẩu
            </Text>
            <Text size={14} tone="sub" style={{ marginTop: 6, lineHeight: 22 }}>
              Đăng nhập với số <Text weight="bold" size={14}>{phone}</Text>. Số chưa đăng ký sẽ được tạo tài khoản với mật khẩu này.
            </Text>
            <View style={[styles.input, { backgroundColor: t.card, borderColor: error ? '#E5484D' : t.border, marginTop: 22 }]}>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setError('');
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Mật khẩu"
                placeholderTextColor={t.textMute}
                returnKeyType="go"
                onSubmitEditing={() => password.length >= 6 && run('sign-in')}
                style={{ flex: 1, fontFamily: font.semibold, fontSize: 17, color: t.text, paddingHorizontal: 14 }}
              />
            </View>
            {error !== '' && (
              <Text size={13} color="#E5484D" style={{ marginTop: 8 }}>
                {error}
              </Text>
            )}
            <Button title={loading === 'sign-in' ? 'Đang đăng nhập…' : 'Đăng nhập'} loading={loading === 'sign-in'} disabled={password.length < 6 || loading !== null} onPress={() => run('sign-in')} style={{ marginTop: 22 }} />
            <Text size={12} tone="mute" style={{ marginTop: 14, textAlign: 'center' }}>
              Mật khẩu tối thiểu 6 ký tự
            </Text>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', left: 20, top: 60, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 88, height: 88, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  input: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: radius.md, borderWidth: 1 },
  flag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: '100%', borderRightWidth: 1 },
});
