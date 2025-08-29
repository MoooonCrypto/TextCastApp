// app/_layout.tsx

import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'TextCast' }} />
      <Stack.Screen name="add-material" options={{ title: '素材追加' }} />
      <Stack.Screen name="settings" options={{ title: '設定' }} />
    </Stack>
  );
}