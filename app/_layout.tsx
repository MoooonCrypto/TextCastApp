// app/_layout.tsx - GestureHandler対応版

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useVoiceStore } from '../src/stores/useVoiceStore';
import { Audio } from 'expo-av';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { loadVoiceFromStorage } = useVoiceStore();

  // アプリ起動時に音声設定を読み込み & オーディオモード設定
  useEffect(() => {
    loadVoiceFromStorage();

    // バックグラウンドオーディオモードを設定
    const setupAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // サイレントモードでも再生
          staysActiveInBackground: true, // バックグラウンド再生を有効化
          shouldDuckAndroid: true, // 他のアプリの音量を下げる
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ バックグラウンドオーディオモードを設定しました');
      } catch (error) {
        console.error('❌ オーディオモード設定エラー:', error);
      }
    };

    setupAudioMode();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="add-material" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="edit-playlist" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="search" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="voice-selection" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="voice-test" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="ad-reward" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </NavigationThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}