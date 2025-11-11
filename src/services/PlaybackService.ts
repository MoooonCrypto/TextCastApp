// src/services/PlaybackService.ts
// react-native-track-player のバックグラウンドサービス

import TrackPlayer, { Event } from 'react-native-track-player';

export async function PlaybackService() {
  // リモートコントロールイベントのハンドリング
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });

  // 曲が終わったときの処理（自動で次へ）
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    console.log('[TrackPlayer] Queue ended');
    // オプション: リピート機能があればここで処理
  });

  // その他のイベント
  TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
    console.error('[TrackPlayer] Playback Error:', event);
  });
}
