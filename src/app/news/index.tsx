import { FlatList, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Text, Header, Screen, Tap, Row } from '@/components/ui';
import { news } from '@/data';
import { useTheme, space, radius, shadow } from '@/theme';

export default function NewsScreen() {
  const t = useTheme();
  const router = useRouter();
  const [featured, ...rest] = news;
  return (
    <Screen>
      <Header title="Tin tức" />
      <FlatList
        data={rest}
        keyExtractor={(n) => n.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: space.lg, gap: 12, paddingBottom: 40 }}
        ListHeaderComponent={
          /* Bài nổi bật: ảnh lớn, chữ đè trên gradient */
          <Tap onPress={() => router.push(`/news/${featured.id}`)} style={[styles.featured, shadow.card]}>
            <Image source={{ uri: featured.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16, gap: 6 }}>
              <View style={[styles.tag, { backgroundColor: t.primary }]}>
                <Text weight="bold" size={11} color={t.onPrimary}>
                  {featured.tag}
                </Text>
              </View>
              <Text weight="bold" size={19} color="#fff" style={{ lineHeight: 26 }}>
                {featured.title}
              </Text>
              <Row style={{ gap: 4 }}>
                <Clock size={12} color="rgba(255,255,255,0.8)" />
                <Text size={12} color="rgba(255,255,255,0.8)">
                  {featured.date}
                </Text>
              </Row>
            </View>
          </Tap>
        }
        renderItem={({ item }) => (
          /* Bài thường: thumbnail trái, nội dung phải */
          <Tap onPress={() => router.push(`/news/${item.id}`)} style={[styles.card, { backgroundColor: t.card }, !t.isDark && shadow.card]}>
            <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" transition={300} />
            <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
              <Row style={{ gap: 8 }}>
                <View style={[styles.tag, { backgroundColor: t.primarySoft }]}>
                  <Text weight="bold" size={10.5} color={t.primaryText}>
                    {item.tag}
                  </Text>
                </View>
                <Text size={11.5} tone="mute">
                  {item.date}
                </Text>
              </Row>
              <Text weight="bold" size={14.5} numberOfLines={2} style={{ lineHeight: 20 }}>
                {item.title}
              </Text>
              <Text size={12.5} tone="sub" numberOfLines={2} style={{ lineHeight: 18 }}>
                {item.excerpt}
              </Text>
            </View>
          </Tap>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  featured: { height: 220, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#ddd', marginBottom: 4 },
  card: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: radius.lg },
  thumb: { width: 104, height: 104, borderRadius: radius.md, backgroundColor: '#eee' },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});
