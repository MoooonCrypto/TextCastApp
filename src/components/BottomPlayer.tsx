import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePlayerStore } from '../stores/usePlayerStore';

const { width: screenWidth } = Dimensions.get('window');

const BottomPlayer: React.FC = () => {
  const { theme } = useTheme();
  const {
    currentItemId,
    isPlaying,
    isLoading,
    currentPosition,
    duration,
    playbackRate,
    pause,
    resume,
    seek,
    skipForward,
    skipBackward,
    setPlaybackRate,
    getCurrentItem,
    getProgressPercentage,
  } = usePlayerStore();

  const progressRef = useRef<View>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const currentItem = getCurrentItem();
  const styles = createStyles(theme);

  const handlePlayPause = async () => {
    if (isLoading) return;

    if (!currentItem) {
      return;
    }

    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  };

  const handleProgressPress = (event: any) => {
    if (!progressRef.current || duration === 0 || !currentItem) return;

    progressRef.current.measure((x, y, width, height, pageX, pageY) => {
      const touchX = event.nativeEvent.pageX - pageX;
      const percentage = Math.max(0, Math.min(1, touchX / width));
      const newPosition = percentage * duration;
      seek(newPosition);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          console.log('[DRAG] Started');
          setIsDragging(true);
        },
        onPanResponderMove: (evt, gestureState) => {
          if (!progressRef.current || duration === 0 || !currentItem) return;

          progressRef.current.measure((x, y, width, height, pageX, pageY) => {
            const touchX = evt.nativeEvent.pageX - pageX;
            const percentage = Math.max(0, Math.min(1, touchX / width));
            const newDragPos = percentage * duration;
            console.log(`[DRAG] Moving to ${newDragPos.toFixed(1)}s (${(percentage * 100).toFixed(1)}%)`);
            setDragPosition(newDragPos);
          });
        },
        onPanResponderRelease: (evt, gestureState) => {
          console.log('[DRAG] Released');
          if (!progressRef.current || duration === 0 || !currentItem) {
            console.log('[DRAG] Invalid state on release');
            setIsDragging(false);
            return;
          }

          progressRef.current.measure((x, y, width, height, pageX, pageY) => {
            const touchX = evt.nativeEvent.pageX - pageX;
            const percentage = Math.max(0, Math.min(1, touchX / width));
            const newPosition = percentage * duration;

            console.log(`[DRAG] Seeking to ${newPosition.toFixed(1)}s`);

            // ドラッグ状態を解除してからseek
            setIsDragging(false);
            seek(newPosition);
          });
        },
      }),
    [duration, currentItem, seek]
  );

  const handleSpeedPress = async () => {
    if (!currentItem) return;

    const speeds = [0.5, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    await setPlaybackRate(speeds[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const gradientColors = theme.colors.background === '#ffffff'
    ? ['rgba(248,249,250,0.98)', 'rgba(233,236,239,0.95)']
    : ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.85)'];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      {/* プログレスバー */}
      <View style={styles.progressContainer}>
        <View
          ref={progressRef}
          style={styles.progressBarContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles.progressBackground} />
          <View
            style={[
              styles.progressFill,
              {
                width: isDragging
                  ? `${(dragPosition / duration) * 100}%`
                  : `${currentItem ? getProgressPercentage() : 0}%`
              }
            ]}
          />
          {currentItem && (
            <View
              style={[
                styles.progressThumb,
                {
                  left: isDragging
                    ? `${(dragPosition / duration) * 100}%`
                    : `${getProgressPercentage()}%`
                }
              ]}
            />
          )}
        </View>
      </View>

      {/* メインコンテンツ */}
      <View style={styles.mainContent}>
        {/* 楽曲情報 */}
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentItem ? currentItem.title : 'タップして再生'}
          </Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {currentItem ? formatTime(currentPosition) : '--:--'}
            </Text>
            <Text style={styles.timeText}>
              {currentItem ? formatTime(duration) : '--:--'}
            </Text>
          </View>
        </View>

        {/* コントロールボタン */}
        <View style={styles.controls}>
          {/* 10秒戻る */}
          <Pressable
            style={[styles.controlButton, styles.skipButton]}
            onPress={() => skipBackward(10)}
            disabled={!currentItem}
          >
            <Ionicons
              name="play-back"
              size={14}
              color={currentItem ? theme.colors.text : theme.colors.textTertiary}
            />
            <Text style={[styles.skipText, !currentItem && styles.disabledText]}>10</Text>
          </Pressable>

          {/* 再生/一時停止 */}
          <Pressable
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayPause}
            disabled={isLoading || !currentItem}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color={theme.colors.background}
              />
            )}
          </Pressable>

          {/* 10秒進む */}
          <Pressable
            style={[styles.controlButton, styles.skipButton]}
            onPress={() => skipForward(10)}
            disabled={!currentItem}
          >
            <Ionicons
              name="play-forward"
              size={14}
              color={currentItem ? theme.colors.text : theme.colors.textTertiary}
            />
            <Text style={[styles.skipText, !currentItem && styles.disabledText]}>10</Text>
          </Pressable>

          {/* 速度調整 */}
          <Pressable
            style={[styles.controlButton, styles.speedButton]}
            onPress={handleSpeedPress}
            disabled={!currentItem}
          >
            <Text style={[styles.speedText, !currentItem && styles.disabledText]}>
              {currentItem ? `${playbackRate}x` : '1x'}
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },

  progressContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },

  progressBarContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 10,
  },

  progressBackground: {
    height: 4,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: 2,
  },

  progressFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: theme.colors.progress,
    borderRadius: 2,
  },

  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 7,
    marginLeft: -7,
    marginTop: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  mainContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  trackInfo: {
    marginBottom: 8,
  },

  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 3,
    textAlign: 'center',
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },

  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  skipButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'relative',
  },

  skipText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.text,
    bottom: 1,
  },

  speedButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSecondary,
  },

  speedText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.text,
  },

  disabledText: {
    color: theme.colors.textTertiary,
  },
});

export default BottomPlayer;