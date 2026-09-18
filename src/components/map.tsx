import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './ui';
import { useTheme } from '@/theme';

type Label = [string, number, number, ('district' | 'poi' | 'city')?];

/** Bản đồ giả lập kiểu Google Maps: nền xám nhạt, sông xanh, mảng xanh công viên, đường trắng, pin thợ 👷 */
const HOME_PINS: [number, number][] = [
  [8, 14], [22, 8], [38, 18], [54, 10], [70, 20], [86, 12], [14, 34], [30, 42], [48, 36], [64, 46], [82, 38], [10, 60], [26, 70], [44, 62], [60, 74], [78, 64], [92, 72], [20, 86], [50, 88], [72, 90],
];
const HOME_LABELS: Label[] = [['Sân bay Quốc tế\nTân Sơn Nhất', 30, 4, 'poi'], ['TÂN BÌNH', 14, 30], ['PHÚ NHUẬN', 48, 28], ['TÂN PHÚ', 10, 56], ['Tp.Hồ Chí Minh', 52, 60, 'city'], ['BÌNH THẠNH', 66, 40], ['QUẬN 7', 62, 84]];

const FULL_LABELS: Label[] = [
  ['QUẬN 12', 4, 24], ['GÒ VẤP', 34, 24], ['TL15', 60, 24, 'poi'], ['THỦ ĐỨC', 78, 27],
  ['Sân bay Quốc tế\nTân Sơn Nhất', 14, 33, 'poi'], ['PHÚ NHUẬN', 42, 35], ['BÌNH THẠNH', 66, 37],
  ['TÂN BÌNH', 4, 43], ['QUẬN 3', 40, 46], ['QUẬN 1', 58, 49], ['QUẬN 2', 82, 47],
  ['TÂN PHÚ', 6, 52], ['QUẬN 10', 28, 55], ['Tp.Hồ Chí Minh', 50, 58, 'city'],
  ['BÌNH TÂN', 4, 62], ['QUẬN 5', 36, 65], ['QUẬN 4', 62, 65],
  ['QUẬN 6', 14, 72], ['QUẬN 8', 32, 78], ['QUẬN 7', 62, 76],
  ['BÌNH CHÁNH', 8, 82], ['NHÀ BÈ', 64, 88],
];

/** Sinh pin theo lưới so le, bỏ pin nằm trong vùng header (y < 21%), gần nhãn, hoặc vùng chú thích góc trái dưới */
function buildFullPins(labels: Label[]): [number, number][] {
  const out: [number, number][] = [];
  const rows = [23, 30, 37, 44, 51, 58, 65, 72, 79, 86, 92];
  rows.forEach((y, r) => {
    const xs = r % 2 === 0 ? [4, 18, 32, 46, 60, 74, 88] : [11, 25, 39, 53, 67, 81, 94];
    xs.forEach((x0) => {
      // lệch nhẹ cho tự nhiên
      const x = x0 + ((r * 7 + x0) % 5) - 2;
      const nearLabel = labels.some(([l, lx, ly, kind]) => {
        const w = kind === 'city' ? 30 : kind === 'poi' ? 22 : l.length * 1.6 + 2;
        return x > lx - 4 && x < lx + w && y > ly - 3.5 && y < ly + 4.5;
      });
      const inLegend = x < 52 && y > 84;
      if (!nearLabel && !inLegend) out.push([x, y]);
    });
  });
  return out;
}
const FULL_PINS = buildFullPins(FULL_LABELS);

export function MapCanvas({ variant, style }: { variant: 'home' | 'full'; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const full = variant === 'full';
  const pins = full ? FULL_PINS : HOME_PINS;
  const labels = full ? FULL_LABELS : HOME_LABELS;
  const bg = t.isDark ? '#1a1f2b' : '#F1F3EF';
  const road = t.isDark ? '#2a3140' : '#FFFFFF';
  const roadMajor = t.isDark ? '#3a4356' : '#FDE68A';
  const water = t.isDark ? '#1c2a3d' : '#BFDBF7';
  const park = t.isDark ? '#1f2d24' : '#D5EBD0';
  const labelColor = t.isDark ? '#8b93a3' : '#6B7280';

  return (
    <View style={[{ backgroundColor: bg, overflow: 'hidden' }, style]}>
      {/* sông Sài Gòn uốn lượn bên phải */}
      <View style={{ position: 'absolute', right: -60, top: -20, width: 150, height: 300, borderRadius: 80, backgroundColor: water, transform: [{ rotate: '22deg' }] }} />
      <View style={{ position: 'absolute', right: 20, bottom: -80, width: 130, height: 320, borderRadius: 70, backgroundColor: water, transform: [{ rotate: '-30deg' }] }} />
      {full && <View style={{ position: 'absolute', right: -30, top: '5%', width: 120, height: 80, borderRadius: 40, backgroundColor: water, transform: [{ rotate: '60deg' }] }} />}
      {/* công viên / sân bay */}
      <View style={{ position: 'absolute', left: '22%', top: full ? '18%' : '2%', width: '30%', height: full ? '10%' : '22%', borderRadius: 14, backgroundColor: park }} />
      <View style={{ position: 'absolute', left: '4%', bottom: '6%', width: '20%', height: '14%', borderRadius: 14, backgroundColor: park }} />
      {full && <View style={{ position: 'absolute', left: '55%', top: '40%', width: '14%', height: '8%', borderRadius: 10, backgroundColor: park }} />}
      {/* đường nhánh */}
      {(full ? [6, 14, 22, 30, 38, 46, 54, 62, 70, 78, 86, 94] : [18, 40, 62, 84]).map((y) => (
        <View key={`h${y}`} style={{ position: 'absolute', left: -20, right: -20, top: `${y}%`, height: 4, backgroundColor: road, transform: [{ rotate: '-6deg' }] }} />
      ))}
      {(full ? [8, 18, 28, 38, 48, 58, 68, 78, 88] : [15, 35, 55, 75]).map((x) => (
        <View key={`v${x}`} style={{ position: 'absolute', top: -20, bottom: -20, left: `${x}%`, width: 4, backgroundColor: road, transform: [{ rotate: '8deg' }] }} />
      ))}
      {/* đường lớn màu vàng nhạt */}
      <View style={{ position: 'absolute', left: -20, right: -20, top: full ? '52%' : '48%', height: 7, backgroundColor: roadMajor, transform: [{ rotate: '-12deg' }] }} />
      <View style={{ position: 'absolute', top: -20, bottom: -20, left: full ? '46%' : '44%', width: 7, backgroundColor: roadMajor, transform: [{ rotate: '14deg' }] }} />
      {/* nhãn */}
      {labels.map(([l, x, y, kind]) => (
        <View key={l} style={{ position: 'absolute', left: `${x}%`, top: `${y}%` }}>
          {kind === 'poi' && l === 'TL15' ? (
            <View style={{ backgroundColor: '#16A34A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text weight="bold" size={10} color="#fff">
                TL15
              </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: t.isDark ? 'rgba(26,31,43,0.7)' : 'rgba(241,243,239,0.75)', paddingHorizontal: 3, borderRadius: 3 }}>
              <Text weight="semibold" size={kind === 'city' ? 15 : kind === 'poi' ? 10 : 10.5} color={kind === 'city' ? (t.isDark ? '#c9cfda' : '#4B5563') : labelColor} style={{ lineHeight: kind === 'city' ? 18 : 13, letterSpacing: kind === 'district' || !kind ? 0.6 : 0 }}>
                {kind === 'poi' && l.startsWith('Sân bay') ? `✈️ ${l}` : l}
              </Text>
            </View>
          )}
        </View>
      ))}
      {/* pin thợ */}
      {pins.map(([x, y], i) => (
        <View key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%` }}>
          <Text size={full ? 20 : 16} style={{ lineHeight: full ? 24 : 20 }}>
            👷
          </Text>
        </View>
      ))}
    </View>
  );
}

export const mapStyles = StyleSheet.create({});
