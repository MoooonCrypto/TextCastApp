// app/settings.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// 基本的な設定画面（簡略版）
export default function SettingsScreen() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [globalPlayer, setGlobalPlayer] = useState(true);

  // テーマ色（ダークテーマベース）
  const theme = {
    colors: {
      background: '#121212',
      surface: '#1E1E1E',
      primary: '#BB86FC',
      secondary: '#03DAC6',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      textTertiary: '#666666',
      border: '#333333',
      premium: '#FFD700',
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    settingsText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    settingsSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>設定</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* 再生設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>再生設定</Text>
            
            <View style={styles.settingsItem}>
              <View>
                <Text style={styles.settingsText}>グローバルプレイヤー</Text>
                <Text style={styles.settingsSubtitle}>画面下部に常時プレイヤーを表示</Text>
              </View>
              <Switch
                value={globalPlayer}
                onValueChange={setGlobalPlayer}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary + '40'
                }}
                thumbColor={globalPlayer ? theme.colors.primary : theme.colors.textTertiary}
              />
            </View>
          </View>

          {/* データ・バックアップ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>データ・バックアップ</Text>
            
            <View style={styles.settingsItem}>
              <View>
                <Text style={styles.settingsText}>自動バックアップ</Text>
                <Text style={styles.settingsSubtitle}>iCloudに自動でバックアップ</Text>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary + '40'
                }}
                thumbColor={autoBackup ? theme.colors.primary : theme.colors.textTertiary}
              />
            </View>
          </View>

          {/* その他 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>その他</Text>
            
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => Alert.alert('アプリについて', 'TextCast v1.0.0\n\n開発中のベータ版です。')}
            >
              <Text style={styles.settingsText}>アプリについて</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}