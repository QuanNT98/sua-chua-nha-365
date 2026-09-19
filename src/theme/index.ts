import { useColorScheme } from 'react-native';

// Tông màu theo app Thợ Việt gốc: vàng chủ đạo, giá màu xanh lá, card trắng
export const palette = {
  yellow: '#F7B500',
  yellowDeep: '#E5A100',
  yellowLight: '#FFD54F',
  yellowSoft: '#FFF6D6',
  yellowPale: '#FFFBEE',
  green: '#2EA043',
  greenSoft: '#E6F6EA',
  red: '#E5484D',
  redSoft: '#FDECEC',
  white: '#FFFFFF',
  ink: '#2B2F36',
};

export const light = {
  bg: '#F6F6F8',
  card: '#FFFFFF',
  cardAlt: '#F3F4F6',
  text: '#2B2F36',
  textSub: '#7A8088',
  textMute: '#A7ADB5',
  border: '#ECEDF0',
  primary: palette.yellow,
  primaryText: '#D99A00',
  primarySoft: palette.yellowSoft,
  onPrimary: '#3B2F00',
  headerTop: '#FFD54F',
  headerBottom: '#F6F6F8',
  price: palette.green,
  tabBar: '#FFFFFF',
};

export const dark: typeof light = {
  bg: '#12141A',
  card: '#1C1F27',
  cardAlt: '#242833',
  text: '#F1F2F4',
  textSub: '#A9AEB7',
  textMute: '#6F7580',
  border: '#2A2E39',
  primary: palette.yellow,
  primaryText: '#FFC933',
  primarySoft: '#3A3010',
  onPrimary: '#3B2F00',
  headerTop: '#4A3B05',
  headerBottom: '#12141A',
  price: '#4CC96A',
  tabBar: '#181B22',
};

export type Theme = typeof light;

export function useTheme(): Theme & { isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return { ...(isDark ? dark : light), isDark };
}

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, full: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
/** Chiều cao tab bar chưa tính safe area dưới (icon 26 + label 12 + padding) */
export const TAB_BAR_BASE = 64;

export const font = {
  regular: 'Quicksand_400Regular',
  medium: 'Quicksand_500Medium',
  semibold: 'Quicksand_600SemiBold',
  bold: 'Quicksand_700Bold',
  extrabold: 'Quicksand_700Bold',
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  float: {
    shadowColor: '#F7B500',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export const formatVND = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
export const formatRange = (min: number, max?: number) => (max && max !== min ? `${formatVND(min)} - ${formatVND(max)}` : formatVND(min));
