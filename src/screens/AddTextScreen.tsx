// src/screens/AddTextScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, createStyles } from '../constants/theme';
import { TextItem, CATEGORIES } from '../types';

interface AddTextScreenProps {
  navigation: any;
}

const AddTextScreen: React.FC<AddTextScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 文字数計算
  const titleLength = title.length;
  const contentLength = content.length;
  const titleMaxLength = 100;
  const contentMaxLength = 50000;

  // 推定読了時間計算（日本語: 約400文字/分）
  const estimatedDuration = Math.ceil(contentLength / 400 * 60);

  // 保存処理
  const handleSave = async () => {
    // バリデーション
    if (title.trim().length === 0) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }
    
    if (content.trim().length === 0) {
      Alert.alert('エラー', '本文を入力してください');
      return;
    }

    if (titleLength > titleMaxLength) {
      Alert.alert('エラー', `タイトルは${titleMaxLength}文字以内で入力してください`);
      return;
    }

    if (contentLength > contentMaxLength) {
      Alert.alert('エラー', `本文は${contentMaxLength}文字以内で入力してください`);
      return;
    }

    setIsLoading(true);

    try {
      // 新しいTextItemを作成
      const newItem: TextItem = {
        id: Date.now().toString(), // 一時的なID生成
        title: title.trim(),
        content: content.trim(),
        source: 'manual',
        category: CATEGORIES.OTHER, // 後で自動分類機能を追加
        tags: [],
        importance: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: estimatedDuration,
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: false,
      };

      // ここで実際の保存処理を実行（後でStorageServiceに置き換え）
      console.log('保存するアイテム:', newItem);

      // 成功メッセージ
      Alert.alert(
        '保存完了',
        'テキストを保存しました',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error('保存エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    if (title.length > 0 || content.length > 0) {
      Alert.alert(
        '確認',
        '入力中の内容が失われますが、よろしいですか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={createStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>新規作成</Text>
        
        <TouchableOpacity
          style={[
            styles.headerButton,
            isLoading && styles.headerButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[
            styles.saveButtonText,
            isLoading && styles.saveButtonTextDisabled,
          ]}>
            {isLoading ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* タイトル入力 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>タイトル</Text>
            <TextInput
              style={[
                styles.titleInput,
                titleLength > titleMaxLength && styles.inputError,
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="ここにタイトルを入力"
              placeholderTextColor={theme.colors.textTertiary}
              maxLength={titleMaxLength + 50} // 少し余裕を持たせてエラー表示
            />
            <Text style={[
              styles.charCount,
              titleLength > titleMaxLength && styles.charCountError,
            ]}>
              {titleLength} / {titleMaxLength}
            </Text>
          </View>

          {/* 本文入力 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>本文</Text>
            <TextInput
              style={[
                styles.contentInput,
                contentLength > contentMaxLength && styles.inputError,
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="ここに本文を入力"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={contentMaxLength + 1000} // 少し余裕を持たせてエラー表示
            />
            <View style={styles.contentMeta}>
              <Text style={[
                styles.charCount,
                contentLength > contentMaxLength && styles.charCountError,
              ]}>
                {contentLength.toLocaleString()} / {contentMaxLength.toLocaleString()}文字
              </Text>
              {contentLength > 0 && (
                <Text style={styles.duration}>
                  推定時間: {Math.floor(estimatedDuration / 60)}分{estimatedDuration % 60}秒
                </Text>
              )}
            </View>
          </View>

          {/* 入力のヒント */}
          <View style={styles.hintSection}>
            <Text style={styles.hintTitle}>💡 入力のコツ</Text>
            <Text style={styles.hintText}>
              • 記事や論文をコピペして貼り付けることもできます{'\n'}
              • タイトルは後から編集可能です{'\n'}
              • 長い文章ほど音声での聞き返しが便利です
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  
  headerButton: {
    width: theme.touchTarget.medium,
    height: theme.touchTarget.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerButtonDisabled: {
    opacity: 0.5,
  },
  
  headerTitle: {
    ...createStyles.text.h3,
    fontWeight: theme.fontWeight.semibold,
  },
  
  saveButtonText: {
    ...createStyles.text.body,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  
  saveButtonTextDisabled: {
    color: theme.colors.textTertiary,
  },
  
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
  },
  
  inputSection: {
    marginBottom: theme.spacing.xl,
  },
  
  label: {
    ...createStyles.text.caption,
    marginBottom: theme.spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  titleInput: {
    ...createStyles.text.body,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    minHeight: theme.touchTarget.medium,
  },
  
  contentInput: {
    ...createStyles.text.body,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    minHeight: 200,
    maxHeight: 400,
  },
  
  inputError: {
    borderColor: theme.colors.error,
  },
  
  charCount: {
    ...createStyles.text.small,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  
  charCountError: {
    color: theme.colors.error,
  },
  
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  
  duration: {
    ...createStyles.text.small,
    color: theme.colors.success,
  },
  
  hintSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginTop: theme.spacing.l,
  },
  
  hintTitle: {
    ...createStyles.text.body,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.s,
  },
  
  hintText: {
    ...createStyles.text.caption,
    lineHeight: 18,
  },
});

export default AddTextScreen;