import React, { useRef } from 'react';
import { View, FlatList, Dimensions, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Tap, Row } from './ui';
import { useTheme, radius, space, shadow, TAB_BAR_BASE } from '@/theme';
import type { Promo, Trade, News } from '@/data';

const { width: W } = Dimensions.get('window');
const PEEK = 38;
const CARD_W = W - PEEK * 2 - 12;
const SNAP = CARD_W + 12;

/**
 * Carousel có "peek" 2 bên như app gốc, item giữa to hơn một chút.
 * Loop vô hạn: nhân 3 dữ liệu, bắt đầu ở bản giữa; khi cuộn tới biên thì nhảy (không animation) về vị trí tương ứng ở giữa.
 */
function Carousel<T extends { id: string }>({ data, render, height }: { data: T[]; render: (item: T) => React.ReactNode; height: number }) {
  const x = useRef(new Animated.Value(0)).current;
  const ref = useRef<FlatList<T>>(null);
  const n = data.length;
  const tripled = [...data, ...data, ...data];

  const recenter = (offsetX: number) => {
    const idx = Math.round(offsetX / SNAP);
    if (idx < n || idx >= 2 * n) {
      const target = n + (((idx % n) + n) % n);
      ref.current?.scrollToOffset({ offset: target * SNAP, animated: false });
    }
  };

  return (
    <Animated.FlatList
      ref={ref as any}
      data={tripled as any}
      horizontal
      keyExtractor={(i: T, idx: number) => `${i.id}-${idx}`}
      showsHorizontalScrollIndicator={false}
      snapToInterval={SNAP}
      decelerationRate="fast"
      initialScrollIndex={n}
      getItemLayout={(_, i) => ({ length: SNAP, offset: SNAP * i, index: i })}
      contentContainerStyle={{ paddingHorizontal: PEEK }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: true })}
      onMomentumScrollEnd={(e) => recenter(e.nativeEvent.contentOffset.x)}
      scrollEventThrottle={16}
      renderItem={({ item, index }: { item: T; index: number }) => {
        const scale = x.interpolate({ inputRange: [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP], outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' });
        return <Animated.View style={{ width: CARD_W, height, marginRight: 12, transform: [{ scale }] }}>{render(item)}</Animated.View>;
      }}
    />
  );
}

/* ---- Chương trình khuyến mãi ---- */
export function PromoCarousel({ data, onPress }: { data: Promo[]; onPress: () => void }) {
  return (
    <Carousel
      data={data}
      height={230}
      render={(p) => (
        <Tap onPress={onPress} style={[styles.promo, shadow.card]}>
          <LinearGradient colors={p.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Row style={{ alignItems: 'flex-end', gap: 6, paddingHorizontal: 14, paddingTop: 12 }}>
            <Text weight="bold" size={22} color="#E5484D" style={{ lineHeight: 26, fontStyle: 'italic' }}>
              {p.headline}
            </Text>
            <Text weight="bold" size={p.amount.length > 4 ? 26 : 40} color="#E5484D" style={{ lineHeight: p.amount.length > 4 ? 30 : 42, fontStyle: 'italic' }}>
              {p.amount}
            </Text>
            <Text weight="bold" size={9} color="#1F2937" style={{ flex: 1, lineHeight: 12, paddingBottom: 6, paddingRight: 56 }}>
              {p.sub}
            </Text>
          </Row>
          <Row style={{ gap: 8, paddingHorizontal: 14, marginTop: 8, flex: 1 }}>
            {p.items.map((it, i) => (
              <View key={it} style={[styles.promoTile, { backgroundColor: i === 1 ? '#FFFFFFCC' : '#FFFFFF99' }]}>
                <Text weight="bold" size={9} color="#374151" style={{ textAlign: 'center', lineHeight: 12 }}>
                  {it}
                </Text>
                <Text size={34} style={{ lineHeight: 40, marginTop: 4 }}>
                  {['👷', '🧑‍🔧', '👨‍🔧'][i]}
                </Text>
              </View>
            ))}
          </Row>
          <View style={styles.promoFoot}>
            <Text size={8.5} color="#374151" numberOfLines={1} style={{ lineHeight: 11, fontStyle: 'italic' }}>
              {p.foot}
            </Text>
          </View>
          <View style={styles.logoTag}>
            <Text weight="bold" size={9} color="#15803D">
              Sửa chữa nhà 365
            </Text>
          </View>
        </Tap>
      )}
    />
  );
}

/* ---- Dịch vụ & Thương mại (poster đứng) ---- */
export function TradeCarousel({ data, onPress }: { data: Trade[]; onPress: () => void }) {
  return (
    <Carousel
      data={data}
      height={CARD_W * 1.32}
      render={(tr) => (
        <Tap onPress={onPress} style={[styles.trade, shadow.card]}>
          <LinearGradient colors={tr.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {/* hoạ tiết gạch men */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: 8 }).map((_, r) => (
              <Row key={r} style={{ gap: 3, marginBottom: 3 }}>
                {Array.from({ length: 10 }).map((_, c) => (
                  <View key={c} style={{ flex: 1, aspectRatio: 1, backgroundColor: `rgba(255,255,255,${((r * 7 + c * 3) % 5) * 0.05 + 0.05})`, borderRadius: 2 }} />
                ))}
              </Row>
            ))}
          </View>
          <View style={{ alignItems: 'center', paddingTop: 16 }}>
            <View style={styles.logoCenter}>
              <Text weight="bold" size={10} color="#15803D">
                Sửa chữa nhà 365 · thợ của mọi nhà
              </Text>
            </View>
            <Text weight="bold" size={18} color={tr.accent} style={{ marginTop: 14, letterSpacing: 0.5 }}>
              {tr.title}
            </Text>
            <Text weight="bold" size={26} color={tr.accent} style={{ lineHeight: 32, textAlign: 'center', paddingHorizontal: 16 }}>
              {tr.subtitle}
            </Text>
            <View style={[styles.tradeLines, { backgroundColor: tr.accent }]}>
              {tr.lines.map((l) => (
                <Text key={l} weight="semibold" size={10.5} color="#fff" style={{ textAlign: 'center', lineHeight: 15 }}>
                  {l}
                </Text>
              ))}
            </View>
          </View>
          <Row style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, gap: -10 }}>
            <Text size={64} style={{ lineHeight: 76 }}>
              {tr.emojis[0]}
            </Text>
            <Text size={120} style={{ lineHeight: 140 }}>
              {tr.emojis[1]}
            </Text>
            <Text size={64} style={{ lineHeight: 76 }}>
              {tr.emojis[2]}
            </Text>
          </Row>
          <View style={styles.wood} />
        </Tap>
      )}
    />
  );
}

/* ---- Bài viết nổi bật ---- */
export function ArticleList({ data, onPress }: { data: News[]; onPress: (id: string) => void }) {
  const t = useTheme();
  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(a) => a.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: space.lg, gap: 14 }}
      renderItem={({ item }) => (
        <Tap onPress={() => onPress(item.id)} style={{ width: 230 }}>
          <Image source={{ uri: item.image }} style={styles.articleImg} contentFit="cover" transition={300} />
          <Text weight="semibold" size={14} numberOfLines={2} style={{ marginTop: 8, lineHeight: 20 }}>
            {item.title}
          </Text>
          <Text size={11.5} tone="mute" style={{ marginTop: 2 }}>
            {item.date}
          </Text>
        </Tap>
      )}
    />
  );
}

/* ---- Sticker "GIẢM GIÁ 50K" nổi, kéo thả được toàn màn hình ---- */
const STICKER_W = 128;
const STICKER_H = 100;

export function FloatingDiscount({ onPress, bottom }: { onPress: () => void; bottom: number }) {
  const insets = useSafeAreaInsets();
  const { width: sw, height: sh } = useWindowDimensions();
  // vị trí hiện tại (góc phải dưới) và vị trí lúc bắt đầu kéo
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const pulse = useSharedValue(1);
  const dragging = useSharedValue(false);

  React.useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.06, { duration: 700 }), withTiming(1, { duration: 700 })), -1, false);
  }, []);

  // sticker được đặt ở right:10 / bottom:`bottom`; giới hạn kéo theo kích thước màn hình (trừ tab bar + safe area)
  const minX = -(sw - STICKER_W - 20);
  const minY = -(sh - STICKER_H - bottom - insets.top - (TAB_BAR_BASE + insets.bottom) - 10);
  const clamp = (v: number, lo: number, hi: number) => {
    'worklet';
    return Math.min(hi, Math.max(lo, v));
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      sx.value = tx.value;
      sy.value = ty.value;
      dragging.value = true;
    })
    .onUpdate((e) => {
      tx.value = clamp(sx.value + e.translationX, minX, 0);
      ty.value = clamp(sy.value + e.translationY, minY, 0);
    })
    .onEnd(() => {
      dragging.value = false;
      // hít vào mép trái/phải gần nhất cho gọn
      const snapLeft = tx.value < minX / 2;
      tx.value = withSpring(snapLeft ? minX : 0, { damping: 18 });
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: dragging.value ? 1.12 : pulse.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Reanimated.View style={[styles.floatWrap, { bottom }, style]}>
        <Tap onPress={onPress} style={styles.float}>
          <LinearGradient colors={['#F0453C', '#C81E1E']} style={StyleSheet.absoluteFill} />
          <Text size={16} style={{ position: 'absolute', left: -6, top: 22, lineHeight: 20, transform: [{ rotate: '-20deg' }] }}>
            🪙
          </Text>
          <Text size={14} style={{ position: 'absolute', right: -4, top: 8, lineHeight: 18 }}>
            🪙
          </Text>
          <Text weight="bold" size={13} color="#fff" style={{ lineHeight: 15, fontStyle: 'italic' }}>
            GIẢM GIÁ
          </Text>
          <Text weight="bold" size={34} color="#fff" style={{ lineHeight: 38, fontStyle: 'italic', textShadowColor: '#7F1D1D', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 }}>
            50K
          </Text>
          <View style={styles.floatCta}>
            <Text weight="bold" size={10} color="#fff">
              ĐẶT THỢ NGAY
            </Text>
          </View>
        </Tap>
      </Reanimated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  promo: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#fff' },
  promoTile: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  promoFoot: { backgroundColor: 'rgba(255,255,255,0.75)', paddingHorizontal: 12, paddingVertical: 6 },
  logoCenter: { backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  logoTag: { backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, position: 'absolute', right: 10, top: 10 },
  trade: { flex: 1, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#fff' },
  tradeLines: { marginTop: 12, marginHorizontal: 22, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  wood: { height: 22, backgroundColor: '#D9A066' },
  articleImg: { width: 230, height: 150, borderRadius: radius.md },
  floatWrap: { position: 'absolute', right: 10, zIndex: 10, width: STICKER_W, height: STICKER_H },
  float: { width: 128, height: 100, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#7F1D1D', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  floatCta: { backgroundColor: '#7F1D1D', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginTop: 2 },
});
