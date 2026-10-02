import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useStore } from '@/store';

export default function Index() {
  const ready = useStore((s) => s.ready);
  const loggedIn = useStore((s) => s.loggedIn);
  const restore = useStore((s) => s.restore);

  useEffect(() => {
    if (!ready) void restore();
  }, [ready, restore]);

  if (!ready) return null;
  return <Redirect href={loggedIn ? '/(tabs)' : '/login'} />;
}
