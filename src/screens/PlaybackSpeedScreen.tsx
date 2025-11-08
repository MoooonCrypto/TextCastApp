// src/screens/PlaybackSpeedScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePlayerStore } from '../stores/usePlayerStore';

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x (標準)' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2.0, label: '2.0x' },
  { value: 2.5, label: '2.5x' },
  { value: 3.0, label: '3.0x' },
];

const PlaybackSpeedScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);
  const { playbackRate, setPlaybackRate } = usePlayerStore();

  const handleClose = () => {
    router.back();
  };

  const handleSpeedSelect = async (speed: number) => {
    await setPlaybackRate(speed);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>再生速度</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          {SPEED_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <TouchableOpacity
                style={styles.speedItem}
                onPress={() => handleSpeedSelect(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.speedLabel,
                    playbackRate === option.value && styles.speedLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {playbackRate === option.value && (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
              {index < SPEED_OPTIONS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 再生速度は再生中にも変更できます。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      height: 56,
    },

    closeButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },

    headerTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },

    headerSpacer: {
      width: 44,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },

    section: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      borderRadius: theme.borderRadius.l,
      overflow: 'hidden',
    },

    speedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      minHeight: 56,
    },

    speedLabel: {
      fontSize: theme.fontSize.m,
      color: theme.colors.text,
      fontWeight: theme.fontWeight.medium,
    },

    speedLabelSelected: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.bold,
    },

    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginLeft: theme.spacing.m,
    },

    infoContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.m,
    },

    infoText: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

export default PlaybackSpeedScreen;
