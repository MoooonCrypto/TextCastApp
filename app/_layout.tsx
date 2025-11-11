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
import { usePurchaseStore } from '../src/stores/usePurchaseStore';
import { Audio } from 'expo-av';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from '../src/services/PlaybackService';

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
  const { initialize: initializePurchase } = usePurchaseStore();

  // アプリ起動時に音声設定を読み込み & オーディオモード設定 & 課金初期化 & TrackPlayer初期化
  useEffect(() => {
    loadVoiceFromStorage();
    initializePurchase(); // 課金システム初期化

    // TrackPlayerの初期化
    const setupTrackPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer({
          autoUpdateMetadata: true,
          autoHandleInterruptions: true,
        });

        await TrackPlayer.updateOptions({
          capabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
            TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
            TrackPlayer.CAPABILITY_SEEK_TO,
            TrackPlayer.CAPABILITY_STOP,
          ],
          compactCapabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          ],
          notificationCapabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
            TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
          ],
        });

        console.log('✅ TrackPlayer初期化完了');
      } catch (error) {
        console.error('❌ TrackPlayer初期化エラー:', error);
      }
    };

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

    setupTrackPlayer();
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
            <Stack.Screen name="playback-speed" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="premium-plan" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="faq" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="contact" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="about" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="privacy" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="terms" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </NavigationThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}