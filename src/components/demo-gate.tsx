import React from 'react';
import { View } from 'react-native';
import { Lock, Phone } from 'lucide-react-native';
import { Text } from './ui';
import { useTheme } from '@/theme';

/** Bản demo tự khoá sau ngày này. Đổi ngày rồi `eas update` để gia hạn; đặt về quá khứ để thu hồi. */
export const DEMO_EXPIRES = new Date('2026-10-18T23:59:59+07:00');

export function DemoGate({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  if (Date.now() <= DEMO_EXPIRES.getTime()) return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 }}>
      <View style={{ width: 84, height: 84, borderRadius: 28, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Lock size={36} color={t.primaryText} />
      </View>
      <Text weight="bold" size={20} style={{ textAlign: 'center' }}>
        Bản demo đã hết hạn
      </Text>
      <Text size={14} tone="sub" style={{ textAlign: 'center', lineHeight: 22 }}>
        Vui lòng liên hệ đơn vị phát triển để gia hạn hoặc nhận bản chính thức.
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <Phone size={14} color={t.textMute} />
        <Text size={13} tone="mute">
          Sửa chữa nhà 365 Demo · v1.0
        </Text>
      </View>
    </View>
  );
}
