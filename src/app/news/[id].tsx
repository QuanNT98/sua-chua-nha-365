import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Share2, Clock, User, ChevronRight } from 'lucide-react-native';
import { Text, Tap, Row, Button, Divider } from '@/components/ui';
import { news } from '@/data';
import { useStore } from '@/store';
import { useTheme, space, radius, shadow } from '@/theme';

const { width } = Dimensions.get('window');

export default function NewsDetail() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const startDraft = useStore((s) => s.startDraft);
  const item = news.find((n) => n.id === id) ?? news[0];
  const related = news.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Ảnh bìa + nút nổi */}
        <View>
          <Image source={{ uri: item.image }} style={{ width, height: 300 }} contentFit="cover" transition={300} />
          <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent']} style={[StyleSheet.absoluteFill, { height: 130 }]} />
          <Row style={{ position: 'absolute', top: insets.top + 6, left: space.lg, right: space.lg, justifyContent: 'space-between' }}>
            <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace('/news'))} style={styles.round}>
              <ChevronLeft size={22} color="#fff" />
            </Tap>
            <Tap style={styles.round}>
              <Share2 size={18} color="#fff" />
            </Tap>
          </Row>
        </View>

        {/* Nội dung */}
        <View style={[styles.sheet, { backgroundColor: t.bg }]}>
          <View style={[styles.tag, { backgroundColor: t.primary }]}>
            <Text weight="bold" size={11} color={t.onPrimary}>
              {item.tag}
            </Text>
          </View>
          <Text weight="bold" size={22} style={{ lineHeight: 30, marginTop: 10 }}>
            {item.title}
          </Text>
          <Row style={{ gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
            <Row style={{ gap: 5 }}>
              <User size={13} color={t.textMute} />
              <Text size={12.5} tone="sub">
                {item.author}
              </Text>
            </Row>
            <Row style={{ gap: 5 }}>
              <Clock size={13} color={t.textMute} />
              <Text size={12.5} tone="sub">
                {item.date} · {item.readMin} phút đọc
              </Text>
            </Row>
          </Row>

          <Text size={15.5} weight="semibold" tone="sub" style={{ lineHeight: 25, marginTop: 18 }}>
            {item.excerpt}
          </Text>
          <Divider style={{ marginVertical: 16 }} />
          {item.body.map((p, i) => (
            <Text key={i} size={15} style={{ lineHeight: 26, marginBottom: 14 }}>
              {p}
            </Text>
          ))}

          {/* Box CTA trong bài */}
          <View style={[styles.cta, { backgroundColor: t.primarySoft, borderColor: t.primary }]}>
            <Text weight="bold" size={15}>
              Cần thợ xử lý ngay?
            </Text>
            <Text size={13} tone="sub" style={{ lineHeight: 19, marginTop: 2 }}>
              Đặt lịch trên app giảm ngay 50K, thợ đến trong ngày, bảo hành rõ ràng.
            </Text>
          </View>

          {/* Bài liên quan */}
          <Text weight="bold" size={17} style={{ marginTop: 28, marginBottom: 12 }}>
            Bài viết liên quan
          </Text>
          {related.map((n) => (
            <Tap key={n.id} onPress={() => router.push(`/news/${n.id}`)} style={[styles.related, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
              <Image source={{ uri: n.image }} style={styles.relatedImg} contentFit="cover" transition={300} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text weight="bold" size={11} color={t.primaryText}>
                  {n.tag} · {n.date}
                </Text>
                <Text weight="semibold" size={14} numberOfLines={2} style={{ lineHeight: 19 }}>
                  {n.title}
                </Text>
              </View>
              <ChevronRight size={18} color={t.textMute} />
            </Tap>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: t.card, paddingBottom: insets.bottom + 12, borderTopColor: t.border }]}>
        <Button
          title="Đặt lịch ngay"
          onPress={() => {
            startDraft('', 'khac');
            router.push('/booking');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  sheet: { marginTop: -24, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg, paddingTop: 20 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  cta: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginTop: 6 },
  related: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.md, marginBottom: 10 },
  relatedImg: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: '#eee' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: 12, borderTopWidth: 1 },
});
