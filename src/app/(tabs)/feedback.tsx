import { useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Phone, MessageCircle, Check } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Text, Button, Chip, Tap, Card, Row } from '@/components/ui';
import { useTheme, space, radius, font, palette } from '@/theme';

const topics = ['Chất lượng thợ', 'Giá cả', 'Thời gian', 'Ứng dụng', 'Tổng đài', 'Khác'];
const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];

export default function FeedbackScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [stars, setStars] = useState(5);
  const [topic, setTopic] = useState('Chất lượng thợ');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient colors={[t.headerTop, t.headerBottom]} style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}>
        <Text weight="bold" size={20} style={{ textAlign: 'center' }}>
          Góp ý
        </Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {sent ? (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <Animated.View entering={ZoomIn.springify()} style={[styles.ok, { backgroundColor: palette.green }]}>
              <Check size={40} color="#fff" strokeWidth={3} />
            </Animated.View>
            <Text weight="bold" size={20}>
              Cảm ơn góp ý của bạn!
            </Text>
            <Text size={14} tone="sub" style={{ textAlign: 'center', lineHeight: 22, maxWidth: 280 }}>
              Thợ Việt sẽ phản hồi trong 24h. Mọi góp ý đều giúp chúng tôi phục vụ tốt hơn.
            </Text>
            <Button title="Gửi góp ý khác" variant="secondary" size="md" onPress={() => { setSent(false); setText(''); }} style={{ marginTop: 8 }} />
          </Animated.View>
        ) : (
          <>
            <Text weight="bold" size={17}>
              Bạn hài lòng với Thợ Việt chứ?
            </Text>
            <Row style={{ justifyContent: 'center', gap: 10, marginTop: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Tap key={i} onPress={() => setStars(i)}>
                  <Star size={40} color={t.primary} fill={i <= stars ? t.primary : 'transparent'} strokeWidth={1.6} />
                </Tap>
              ))}
            </Row>
            <Text weight="bold" size={14} color={t.primaryText} style={{ textAlign: 'center', marginTop: 8 }}>
              {labels[stars]}
            </Text>

            <Text weight="bold" size={15} style={{ marginTop: 26, marginBottom: 10 }}>
              Chủ đề góp ý
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {topics.map((x) => (
                <Chip key={x} label={x} active={topic === x} onPress={() => setTopic(x)} />
              ))}
            </View>

            <Text weight="bold" size={15} style={{ marginTop: 22, marginBottom: 10 }}>
              Nội dung <Text color="#E5484D" size={15}>*</Text>
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder="Chia sẻ trải nghiệm hoặc đề xuất của bạn…"
              placeholderTextColor={t.textMute}
              style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: font.medium }]}
            />
            <Button title="Gửi góp ý" disabled={!text.trim()} onPress={() => setSent(true)} style={{ marginTop: 20 }} />

            <Text weight="bold" size={15} style={{ marginTop: 30, marginBottom: 10 }}>
              Hoặc liên hệ trực tiếp
            </Text>
            <Row style={{ gap: 10 }}>
              <Card style={{ flex: 1, alignItems: 'center', gap: 6, padding: 14 }}>
                <Phone size={22} color={palette.green} />
                <Text weight="bold" size={14}>
                  1800 8122
                </Text>
                <Text size={11} tone="sub">
                  Miễn phí 7:00–21:00
                </Text>
              </Card>
              <Card style={{ flex: 1, alignItems: 'center', gap: 6, padding: 14 }}>
                <MessageCircle size={22} color="#2563EB" />
                <Text weight="bold" size={14}>
                  Zalo OA
                </Text>
                <Text size={11} tone="sub">
                  Thợ Việt
                </Text>
              </Card>
            </Row>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 120, borderRadius: radius.md, borderWidth: 1, padding: 14, fontSize: 15, textAlignVertical: 'top' },
  ok: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
});
