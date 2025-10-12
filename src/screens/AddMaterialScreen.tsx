// src/screens/AddMaterialScreen.tsx - DB連携版

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { StorageService } from '../services/StorageService';
import { PlanService } from '../services/PlanService';
import { validateTextItem } from '../utils/validation';
import { CATEGORIES } from '../types';
import { usePlayerStore } from '../stores/usePlayerStore';

type InputMethod = 'manual';

const AddMaterialScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { refreshPlaylist } = usePlayerStore();
  const styles = createStyles(theme);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('プログラミング');
  const [isLoading, setIsLoading] = useState(false);

  // カテゴリ一覧（トップ画面と統一）
  const categories = Object.values(CATEGORIES);

  // 保存処理
  const handleSave = async () => {
    // バリデーション
    const validation = validateTextItem(title, content);
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.error);
      return;
    }

    // 容量制限チェック
    const canAdd = await PlanService.canAddNewItem();
    if (!canAdd.canAdd) {
      Alert.alert('保存上限', canAdd.reason);
      return;
    }

    try {
      setIsLoading(true);

      // 推定再生時間を計算（文字数から）
      const baseCharactersPerSecond = 8;
      const estimatedDuration = Math.ceil(content.length / baseCharactersPerSecond);

      // DBに保存
      const newItem = await StorageService.addItem({
        title: title.trim(),
        content: content.trim(),
        source: 'manual',
        category,
        isFavorite: false,
        duration: estimatedDuration,
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      });

      console.log('✅ アイテム保存成功:', newItem.id);

      // プレイリストを更新
      await refreshPlaylist();

      // 保存完了後、即座に画面を閉じる
      router.back();
    } catch (error) {
      console.error('❌ 保存エラー:', error);
      Alert.alert('エラー', '保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // キャンセル
  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert('確認', '入力内容が失われますが、よろしいですか？', [
        { text: 'キャンセル', style: 'cancel' },
        { text: '破棄', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>新規作成</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* タイトル入力 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>タイトル（最大50文字）</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="タイトルを入力..."
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={50}
          />
          <Text style={styles.charCount}>{title.length}/50</Text>
        </View>

        {/* 本文入力 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>本文（最大100,000文字）</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="本文を入力..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            maxLength={100000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {content.length.toLocaleString()}/100,000
          </Text>
        </View>

        {/* カテゴリ選択 */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>カテゴリ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 推定再生時間表示 */}
        {content.length > 0 && (
          <View style={styles.infoContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              推定再生時間: 約{Math.ceil(content.length / 8)}秒
            </Text>
          </View>
        )}
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

    headerButton: {
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

    saveButtonText: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.primary,
    },

    content: {
      flex: 1,
      padding: theme.spacing.m,
    },

    inputContainer: {
      marginBottom: theme.spacing.m,
    },

    inputLabel: {
      fontSize: theme.fontSize.s,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.s,
    },

    textInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.m,
      padding: theme.spacing.m,
      color: theme.colors.text,
      fontSize: theme.fontSize.m,
    },

    textArea: {
      height: 150,
      textAlignVertical: 'top',
    },

    charCount: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
      textAlign: 'right',
      marginTop: theme.spacing.xs,
    },

    selectorContainer: {
      marginBottom: theme.spacing.m,
    },

    selectorLabel: {
      fontSize: theme.fontSize.s,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.s,
    },

    categoryRow: {
      flexDirection: 'row',
      gap: theme.spacing.s,
    },

    categoryButton: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.borderRadius.l,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },

    categoryButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },

    categoryText: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
    },

    categoryTextSelected: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.semibold,
    },

    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.m,
      gap: theme.spacing.s,
    },

    infoText: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
    },
  });

export default AddMaterialScreen;
