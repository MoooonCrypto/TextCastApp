// index.js
// react-native-track-playerのサービス登録

import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';

import App from './App';
import { PlaybackService } from './src/services/PlaybackService';

// TrackPlayerのサービスを登録
TrackPlayer.registerPlaybackService(() => PlaybackService);

// アプリのルートコンポーネントを登録
registerRootComponent(App);
