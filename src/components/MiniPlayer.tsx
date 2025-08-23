import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface MiniPlayerProps {
  isVisible: boolean;
  currentTrack: {
    title: string;
    category: string;
    currentTime: string;
    totalTime: string;
  } | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  isVisible,
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onPress,
}) => {
  const translateY = React.useRef(new Animated.Value(100)).current;

  React.useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (!currentTrack) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={onPress}
        activeOpacity={0.95}
      >
        <View style={styles.content}>
          {/* 再生情報 */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.trackCategory} numberOfLines={1}>
              {currentTrack.category}
            </Text>
          </View>

          {/* コントロールボタン */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onPrevious}
            >
              <Text style={styles.controlIcon}>⏮</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={onPlayPause}
            >
              <Text style={styles.playIcon}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={onNext}
            >
              <Text style={styles.controlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* プログレスバー */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.timeText}>
            {currentTrack.currentTime} / {currentTrack.totalTime}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  touchableArea: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trackInfo: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  trackCategory: {
    fontSize: 12,
    color: '#999999',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  playButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  controlIcon: {
    fontSize: 20,
    color: '#666666',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
    marginRight: 8,
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
  timeText: {
    fontSize: 11,
    color: '#999999',
    minWidth: 60,
    textAlign: 'right',
  },
});

export default MiniPlayer;