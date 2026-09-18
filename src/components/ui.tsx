import React from 'react';
import {
  Text as RNText,
  View,
  Pressable,
  StyleSheet,
  type TextProps,
  type ViewProps,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Star } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, font, radius, space, shadow } from '@/theme';

/* ---------- Text ---------- */
type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type Tone = 'text' | 'sub' | 'mute' | 'primary' | 'onPrimary' | 'white';
export function Text({
  weight = 'regular',
  size = 14,
  tone = 'text',
  color,
  style,
  ...rest
}: TextProps & { weight?: Weight; size?: number; tone?: Tone; color?: string }) {
  const t = useTheme();
  const map: Record<Tone, string> = {
    text: t.text,
    sub: t.textSub,
    mute: t.textMute,
    primary: t.primaryText,
    onPrimary: t.onPrimary,
    white: '#fff',
  };
  return (
    <RNText
      {...rest}
      style={[{ fontFamily: font[weight], fontSize: size, color: color ?? map[tone], lineHeight: size * 1.4 }, style]}
    />
  );
}

/* ---------- Pressable with scale ---------- */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function Tap({
  children,
  style,
  onPress,
  haptic = true,
  scale = true,
  pressedStyle,
  ...rest
}: PressableProps & {
  /** rung nhẹ khi bấm */
  haptic?: boolean | 'selection';
  /** hiệu ứng co nhẹ khi nhấn giữ; tắt cho các dòng list dài */
  scale?: boolean;
  style?: StyleProp<ViewStyle>;
  /** style thêm khi đang nhấn (vd đổi nền) */
  pressedStyle?: StyleProp<ViewStyle>;
}) {
  const s = useSharedValue(1);
  const [pressed, setPressed] = React.useState(false);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={() => {
        if (scale) s.value = withSpring(0.96, { damping: 15 });
        if (pressedStyle) setPressed(true);
      }}
      onPressOut={() => {
        if (scale) s.value = withSpring(1, { damping: 15 });
        if (pressedStyle) setPressed(false);
      }}
      onPress={(e) => {
        if (haptic === 'selection') Haptics.selectionAsync().catch(() => {});
        else if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
      style={[a, style, pressed && pressedStyle]}>
      {children}
    </AnimatedPressable>
  );
}

/* ---------- Button ---------- */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const h = size === 'lg' ? 54 : size === 'md' ? 44 : 36;
  const bg =
    variant === 'primary' ? t.primary : variant === 'secondary' ? t.primarySoft : variant === 'dark' ? t.text : 'transparent';
  const fg = variant === 'primary' ? t.onPrimary : variant === 'secondary' ? t.primaryText : variant === 'dark' ? t.bg : t.primaryText;
  return (
    <Tap
      onPress={disabled || loading ? undefined : onPress}
      style={[
        {
          height: h,
          borderRadius: radius.md,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 20,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' && !disabled && shadow.float,
        style,
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <Text weight="bold" size={size === 'lg' ? 16 : 14} color={fg}>
        {title}
      </Text>
    </Tap>
  );
}

/* ---------- Card ---------- */
export function Card({ style, children, ...rest }: ViewProps) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[{ backgroundColor: t.card, borderRadius: radius.lg, padding: space.lg }, !t.isDark && shadow.card, style]}>
      {children}
    </View>
  );
}

/* ---------- Screen wrappers ---------- */
export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ flex: 1, backgroundColor: t.bg }, style]}>{children}</View>;
}

export function Header({
  title,
  right,
  onBack,
  plain,
}: {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  plain?: boolean;
}) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={plain ? [t.bg, t.bg] : [t.headerTop, t.headerBottom]}
      style={{ paddingTop: insets.top + 6, paddingBottom: 14, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Tap
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')))}
        style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)' }}>
        <ChevronLeft size={22} color={t.text} />
      </Tap>
      <Text weight="bold" size={18} style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </LinearGradient>
  );
}

/* ---------- Misc ---------- */
export function Avatar({ uri, size = 44, style }: { uri: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return <Image source={{ uri }} style={[{ width: size, height: size, borderRadius: size / 2 }, style as any]} transition={200} />;
}

export function Rating({ value, size = 12, count }: { value: number; size?: number; count?: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Star size={size} color="#F59E0B" fill="#F59E0B" />
      <Text weight="semibold" size={size}>
        {value.toFixed(1)}
      </Text>
      {count !== undefined && (
        <Text size={size} tone="mute">
          ({count.toLocaleString('vi-VN')})
        </Text>
      )}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const c = color ?? t.primary;
  return (
    <Tap
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 14,
          height: 36,
          borderRadius: radius.full,
          backgroundColor: active ? c : t.card,
          borderWidth: 1,
          borderColor: active ? c : t.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Text weight="semibold" size={13} color={active ? t.onPrimary : t.textSub}>
        {label}
      </Text>
    </Tap>
  );
}

export function Badge({ label, color, soft, style }: { label: string; color: string; soft: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: soft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' }, style]}>
      <Text weight="semibold" size={11} color={color}>
        {label}
      </Text>
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text weight="bold" size={17}>
        {title}
      </Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text weight="medium" size={13} tone="primary">
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ height: 1, backgroundColor: t.border }, style]} />;
}

export function Row({ style, children, ...rest }: ViewProps) {
  return (
    <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    marginBottom: 12,
  },
});

export type { TextStyle };
