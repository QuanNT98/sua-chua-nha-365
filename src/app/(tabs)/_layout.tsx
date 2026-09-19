import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, History, PenSquare, CircleUserRound } from 'lucide-react-native';
import { useTheme, font, TAB_BAR_BASE } from '@/theme';

export default function TabLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primaryText,
        tabBarInactiveTintColor: t.textMute,
        tabBarLabelStyle: { fontFamily: font.bold, fontSize: 12, marginTop: 2 },
        tabBarStyle: { backgroundColor: t.tabBar, borderTopColor: t.border, height: TAB_BAR_BASE + insets.bottom, paddingTop: 8 },
        sceneStyle: { backgroundColor: t.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', tabBarIcon: ({ color, focused }) => <Home size={26} color={color} strokeWidth={focused ? 2.4 : 2} fill={focused ? color : 'transparent'} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Lịch sử', tabBarIcon: ({ color, focused }) => <History size={26} color={color} strokeWidth={focused ? 2.4 : 2} /> }} />
      <Tabs.Screen name="feedback" options={{ title: 'Góp ý', tabBarIcon: ({ color, focused }) => <PenSquare size={26} color={color} strokeWidth={focused ? 2.4 : 2} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Tài khoản', tabBarIcon: ({ color, focused }) => <CircleUserRound size={26} color={color} strokeWidth={focused ? 2.4 : 2} /> }} />
    </Tabs>
  );
}
