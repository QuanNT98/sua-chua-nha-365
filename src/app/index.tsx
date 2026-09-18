import { Redirect } from 'expo-router';
import { useStore } from '@/store';

export default function Index() {
  const loggedIn = useStore((s) => s.loggedIn);
  return <Redirect href={loggedIn ? '/(tabs)' : '/login'} />;
}
