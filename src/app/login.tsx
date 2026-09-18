import { useEffect, useRef, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Text, Button, Tap } from '@/components/ui';
import { useStore } from '@/store';
import { useTheme, radius, font } from '@/theme';

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useStore((s) => s.login);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('0968409323');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<TextInput>(null);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRef.current?.focus(), 300);
  }, [step]);

  useEffect(() => {
    if (otp.length === 6) {
      setLoading(true);
      setTimeout(() => {
        login();
        router.replace('/(tabs)');
      }, 700);
    }
  }, [otp]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient colors={[t.headerTop, t.headerBottom]} style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' }}>
        {step === 'otp' && (
          <Tap onPress={() => setStep('phone')} style={[styles.back, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
            <ChevronLeft size={22} color={t.text} />
          </Tap>
        )}
        <View style={styles.logo}>
          <Text size={44} style={{ lineHeight: 52 }}>
            👷
          </Text>
        </View>
        <Text weight="bold" size={26} style={{ marginTop: 12 }}>
          Thợ Việt
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
              Nhập số điện thoại để nhận mã xác thực.
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
            <Button title="Nhận mã OTP" disabled={phone.length < 9} onPress={() => setStep('otp')} style={{ marginTop: 22 }} />
            <Text size={12} tone="mute" style={{ marginTop: 16, textAlign: 'center', lineHeight: 18 }}>
              Bằng việc tiếp tục, bạn đồng ý với <Text size={12} tone="primary" weight="semibold">Chính sách phục vụ khách hàng</Text> của Thợ Việt.
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInRight}>
            <Text weight="bold" size={20}>
              Nhập mã xác thực
            </Text>
            <Text size={14} tone="sub" style={{ marginTop: 6, lineHeight: 22 }}>
              Mã OTP đã gửi đến <Text weight="bold" size={14}>{phone}</Text>. Nhập 6 số bất kỳ để demo.
            </Text>
            <Pressable onPress={() => otpRef.current?.focus()} style={styles.otpRow}>
              {Array.from({ length: 6 }).map((_, i) => {
                const filled = otp[i] !== undefined;
                const active = otp.length === i;
                return (
                  <View key={i} style={[styles.otpBox, { backgroundColor: t.card, borderColor: active ? t.primary : filled ? t.text : t.border, borderWidth: active ? 2 : 1 }]}>
                    <Text weight="bold" size={22}>
                      {otp[i] ?? ''}
                    </Text>
                  </View>
                );
              })}
            </Pressable>
            <TextInput ref={otpRef} value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" style={{ position: 'absolute', opacity: 0, height: 1 }} />
            <Button title="Xác nhận" loading={loading} disabled={otp.length < 6} style={{ marginTop: 26 }} />
            <Text size={13} tone="sub" style={{ marginTop: 16, textAlign: 'center' }}>
              Không nhận được mã? <Text size={13} tone="primary" weight="bold">Gửi lại (59s)</Text>
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
  otpRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  otpBox: { flex: 1, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
