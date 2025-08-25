// src/screens/FullScreenPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
// Sliderのインポートを一時的にコメントアウト（後で代替実装）
// import { Slider } from '@react-native-community/slider';

interface FullScreenPlayerProps {
  visible: boolean;
  onClose: () => void;
  currentTrack: {
    id: string;
    title: string;
    category: string;
    currentTime: string;
    totalTime: string;
    content?: string;
  } | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  visible,
  onClose,
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  playbackSpeed = 1.0,
  onSpeedChange,
}) => {
  const [currentPosition, setCurrentPosition] = useState(30); // デフォルト30%に設定
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [shuffleMode, setShuffleMode] = useState(false);
  
  // アニメーション用
  const slideAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const progressBarWidth = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      // スライドアップアニメーション
      Animated.spring(slideAnimation, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      // スライドダウンアニメーション
      Animated.timing(slideAnimation, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // プログレスバーのタッチハンドラ
  const handleProgressBarPress = (event: {
    nativeEvent: { locationX: number }
  }) => {
    if (progressBarWidth.current) {
      const { locationX } = event.nativeEvent;
      const percentage = (locationX / progressBarWidth.current) * 100;
      setCurrentPosition(Math.min(100, Math.max(0, percentage)));
    }
  };

  // プログレスバーの幅を測定
  const onProgressBarLayout = (event: {
    nativeEvent: { layout: { width: number } }
  }) => {
    progressBarWidth.current = event.nativeEvent.layout.width;
  };

  if (!currentTrack) return null;

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const handleRepeatToggle = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'off': return '🔁';
      case 'one': return '🔂';
      case 'all': return '🔁';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      transparent={true}
    >
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateY: slideAnimation }],
          },
        ]}
      >
        <SafeAreaView style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>⌄</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.categoryText}>{currentTrack.category}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* コンテンツエリア */}
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          <View style={styles.trackInfoContainer}>
            <Text style={styles.trackTitle}>{currentTrack.title}</Text>
            {currentTrack.content && (
              <Text style={styles.trackContent} numberOfLines={10}>
                {currentTrack.content}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* プレーヤーコントロール */}
        <View style={styles.playerControls}>
          {/* プログレスバー */}
          <View style={styles.progressContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleProgressBarPress}
              onLayout={onProgressBarLayout}
              style={styles.progressTouchArea}
            >
              <View style={styles.progressBarBackground}>
                <Animated.View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${currentPosition}%` }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressThumb,
                    { left: `${currentPosition}%` }
                  ]} 
                />
              </View>
            </TouchableOpacity>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{currentTrack.currentTime}</Text>
              <Text style={styles.timeText}>{currentTrack.totalTime}</Text>
            </View>
          </View>

          {/* メインコントロール */}
          <View style={styles.mainControls}>
            <TouchableOpacity 
              onPress={() => setShuffleMode(!shuffleMode)}
              style={[styles.sideControl, shuffleMode && styles.activeControl]}
            >
              <Text style={[styles.sideControlIcon, shuffleMode && styles.activeControlIcon]}>
                🔀
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onPrevious} style={styles.mainControl}>
              <Text style={styles.mainControlIcon}>⏮</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
              <Text style={styles.playIcon}>
                {isPlaying ? '⏸' : '▶️'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNext} style={styles.mainControl}>
              <Text style={styles.mainControlIcon}>⏭</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleRepeatToggle}
              style={[styles.sideControl, repeatMode !== 'off' && styles.activeControl]}
            >
              <Text style={[styles.sideControlIcon, repeatMode !== 'off' && styles.activeControlIcon]}>
                {getRepeatIcon()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 再生速度 */}
          <TouchableOpacity 
            style={styles.speedControl}
            onPress={() => setShowSpeedModal(true)}
          >
            <Text style={styles.speedLabel}>速度</Text>
            <Text style={styles.speedValue}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          {/* ブックマーク */}
          <View style={styles.bookmarksSection}>
            <Text style={styles.bookmarksTitle}>📑 章立て・ブックマーク</Text>
            <View style={styles.bookmarksList}>
              <TouchableOpacity style={styles.bookmarkItem}>
                <Text style={styles.bookmarkText}>• はじめに</Text>
                <Text style={styles.bookmarkTime}>0:00</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkItem}>
                <Text style={styles.bookmarkText}>• 手法</Text>
                <Text style={styles.bookmarkTime}>3:15</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkItem}>
                <Text style={styles.bookmarkText}>• 結果 ⭐</Text>
                <Text style={styles.bookmarkTime}>8:42</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkItem}>
                <Text style={styles.bookmarkText}>• 考察</Text>
                <Text style={styles.bookmarkTime}>12:18</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 速度選択モーダル */}
        <Modal
          visible={showSpeedModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSpeedModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSpeedModal(false)}
          >
            <View style={styles.speedModal}>
              <Text style={styles.speedModalTitle}>再生速度</Text>
              {speeds.map(speed => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedOption,
                    speed === playbackSpeed && styles.speedOptionActive
                  ]}
                  onPress={() => {
                    onSpeedChange(speed);
                    setShowSpeedModal(false);
                  }}
                >
                  <Text style={[
                    styles.speedOptionText,
                    speed === playbackSpeed && styles.speedOptionTextActive
                  ]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#333333',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333333',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trackInfoContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  trackContent: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
  },
  playerControls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTouchArea: {
    paddingVertical: 15,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    top: -6,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999999',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sideControl: {
    padding: 12,
  },
  activeControl: {
    backgroundColor: '#E8F4FF',
    borderRadius: 20,
  },
  sideControlIcon: {
    fontSize: 20,
    color: '#666666',
  },
  activeControlIcon: {
    color: '#007AFF',
  },
  mainControl: {
    padding: 12,
    marginHorizontal: 8,
  },
  mainControlIcon: {
    fontSize: 28,
    color: '#333333',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  speedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 20,
  },
  speedLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  speedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  bookmarksSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
  },
  bookmarksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  bookmarksList: {
    gap: 8,
  },
  bookmarkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  bookmarkText: {
    fontSize: 14,
    color: '#333333',
  },
  bookmarkTime: {
    fontSize: 14,
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: 200,
  },
  speedModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  speedOption: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  speedOptionActive: {
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
  },
  speedOptionText: {
    fontSize: 16,
    color: '#666666',
  },
  speedOptionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
})

export default FullScreenPlayer;