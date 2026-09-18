import { useMemo } from 'react';
import { View, StyleSheet, Text as RNText, Platform } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import { Header, Screen } from '@/components/ui';
import { MapCanvas } from '@/components/map';

// Expo Go trên Android không có Google Maps key → dùng bản đồ vẽ tay
const useMockMap = Platform.OS === 'android' && Constants.appOwnership === 'expo';

/**
 * Khu vực làm việc – bám sát app gốc: header vàng + bản đồ thật full màn,
 * pin thợ 👷 dày ở trung tâm TP.HCM và thưa dần ra ngoại thành.
 */

// Tâm TP.HCM (Q.1) và vùng nhìn từ Củ Chi tới Cần Giuộc, Biên Hòa
const CENTER = { latitude: 10.78, longitude: 106.68 };
const REGION = { latitude: 10.8, longitude: 106.69, latitudeDelta: 0.46, longitudeDelta: 0.32 };

// Pseudo-random có seed để pin cố định giữa các lần mở
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
// Phân phối chuẩn xấp xỉ (Box–Muller)
function gauss(r: () => number) {
  const u = Math.max(r(), 1e-6);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function buildWorkers() {
  const r = rng(20260918);
  const pts: { id: string; latitude: number; longitude: number }[] = [];
  // 95 thợ quanh trung tâm (độ lệch ~4km), 30 thợ vòng ngoài (~10km)
  for (let i = 0; i < 90; i++) pts.push({ id: `c${i}`, latitude: CENTER.latitude + gauss(r) * 0.045, longitude: CENTER.longitude + gauss(r) * 0.05 });
  for (let i = 0; i < 30; i++) pts.push({ id: `o${i}`, latitude: CENTER.latitude + gauss(r) * 0.1, longitude: CENTER.longitude + gauss(r) * 0.09 });
  // Vài thợ ở các huyện/tỉnh giáp ranh như ảnh gốc
  const far: [number, number][] = [
    [10.973, 106.493], // Củ Chi
    [10.885, 106.595], // Hóc Môn
    [10.98, 106.65], // Thủ Dầu Một
    [10.9, 106.71], // Thuận An
    [10.905, 106.77], // Dĩ An
    [10.95, 106.82], // Biên Hòa
    [10.86, 106.83], // Thủ Đức xa
    [10.66, 106.6], // Bình Chánh
    [10.6, 106.67], // Cần Giuộc
    [10.68, 106.76], // Nhà Bè
    [10.72, 106.85], // Q.2/9 phía đông
    [10.64, 106.78], // Nam Sài Gòn
  ];
  far.forEach(([la, lo], i) => pts.push({ id: `f${i}`, latitude: la + (r() - 0.5) * 0.01, longitude: lo + (r() - 0.5) * 0.01 }));
  return pts;
}

export default function MapScreen() {
  const workers = useMemo(buildWorkers, []);
  return (
    <Screen>
      <Header title="Khu vực làm việc" />
      {useMockMap ? (
        <MapCanvas variant="full" style={{ flex: 1 }} />
      ) : (
      <MapView
        style={{ flex: 1 }}
        initialRegion={REGION}
        mapType="standard"
        showsPointsOfInterests={false}
        showsBuildings={false}
        showsTraffic={false}
        rotateEnabled={false}
        pitchEnabled={false}>
        {workers.map((w) => (
          <Marker key={w.id} coordinate={w} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <RNText style={styles.pin}>👷</RNText>
          </Marker>
        ))}
      </MapView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pin: { fontSize: 24, lineHeight: 28 },
});
