// src/screens/AddMaterialScreen.tsx

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TextItem } from '../../src/types';

interface AddMaterialScreenProps {
  onMaterialAdded?: (material: Partial<TextItem>) => void;
}

type InputMethod = 'manual' | 'url';

const AddMaterialScreen: React.FC<AddMaterialScreenProps> = ({
  onMaterialAdded
}) => {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod>('manual');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('個人');
  const [importance, setImportance] = useState<1 | 2 | 3>(2);
  const [isLoading, setIsLoading] = useState(false);

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
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
    }
  };

  const categories = ['個人', 'ビジネス', '学習', 'ニュース', 'エンタメ', 'その他'];
  const importanceLevels = [
    { value: 1, label: '低', color: theme.colors.textTertiary },
    { value: 2, label: '中', color: theme.colors.warning },
    { value: 3, label: '高', color: theme.colors.error },
  ];

  // ファイル選択処理（将来実装予定）
  const handleFilePicker = async () => {
    Alert.alert('機能予定', 'ファイル選択機能は今後実装予定です。');
  };

  // カメラ撮影処理（将来実装予定）
  const handleCameraCapture = async () => {
    Alert.alert('機能予定', 'カメラ撮影機能は今後実装予定です。');
  };

  // URL解析処理
  const handleUrlAnalysis = async () => {
    if (!url.trim()) {
      Alert.alert('入力エラー', 'URLを入力してください。');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: URL解析処理を実装
      Alert.alert('URL解析', `${url} の解析機能は今後実装予定です。`);
    } catch (error) {
      Alert.alert('エラー', 'URL解析に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('入力エラー', 'タイトルを入力してください。');
      return;
    }

    if (selectedMethod === 'manual' && !content.trim()) {
      Alert.alert('入力エラー', 'テキスト内容を入力してください。');
      return;
    }

    if (selectedMethod === 'url' && !url.trim()) {
      Alert.alert('入力エラー', 'URLを入力してください。');
      return;
    }

    try {
      setIsLoading(true);

      const newMaterial: Partial<TextItem> = {
        id: Date.now().toString(),
        title: title.trim(),
        content: selectedMethod === 'manual' ? content.trim() : '',
        source: selectedMethod,
        sourceUrl: selectedMethod === 'url' ? url.trim() : undefined,
        category,
        importance,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: false,
      };

      // TODO: AsyncStorageへの保存処理を実装
      console.log('New material:', newMaterial);

      if (onMaterialAdded) {
        onMaterialAdded(newMaterial);
      }

      Alert.alert('保存完了', '新しい素材を追加しました。', [
        { 
          text: 'OK', 
          onPress: () => router.back()
        }
      ]);

    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // 入力方法選択ボタンの描画
  const renderMethodButton = (method: InputMethod, icon: string, label: string) => (
    <TouchableOpacity
      key={method}
      style={[
        styles.methodButton,
        selectedMethod === method && styles.methodButtonSelected
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={selectedMethod === method ? theme.colors.primary : theme.colors.textSecondary}
      />
      <Text style={[
        styles.methodLabel,
        selectedMethod === method && styles.methodLabelSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // カテゴリ選択の描画
  const renderCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>カテゴリ</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonSelected
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.categoryTextSelected
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // 重要度選択の描画
  const renderImportanceSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>重要度</Text>
      <View style={styles.importanceRow}>
        {importanceLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.importanceButton,
              importance === level.value && styles.importanceButtonSelected
            ]}
            onPress={() => setImportance(level.value as 1 | 2 | 3)}
          >
            <View
              style={[
                styles.importanceDot,
                { backgroundColor: level.color }
              ]}
            />
            <Text style={[
              styles.importanceText,
              importance === level.value && styles.importanceTextSelected
            ]}>
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
    },
    headerButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    methodContainer: {
      marginBottom: 24,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    methodRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    methodButton: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      minWidth: 70,
    },
    methodButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },
    methodLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    methodLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      color: theme.colors.text,
      fontSize: 16,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    selectorContainer: {
      marginBottom: 20,
    },
    selectorLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    categoryRow: {
      flexDirection: 'row',
      gap: 8,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    categoryButtonSelected: {
      borderColor: theme.colors.secondary,
      backgroundColor: theme.colors.secondary + '20',
    },
    categoryText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    categoryTextSelected: {
      color: theme.colors.secondary,
      fontWeight: '600',
    },
    importanceRow: {
      flexDirection: 'row',
      gap: 16,
    },
    importanceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    importanceButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },
    importanceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    importanceText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    importanceTextSelected: {
      color: theme.colors.text,
      fontWeight: '600',
    },
    actionButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    actionButtonText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 8,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.textTertiary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>新しい素材を追加</Text>
        
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* 入力方法選択 */}
        <View style={styles.methodContainer}>
          <Text style={styles.methodTitle}>入力方法を選択</Text>
          <View style={styles.methodRow}>
            {renderMethodButton('manual', 'document-text-outline', 'テキスト')}
            {renderMethodButton('url', 'link-outline', 'URL')}
          </View>
        </View>

        {/* タイトル入力 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>タイトル *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="タイトルを入力してください"
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={100}
          />
        </View>

        {/* 入力方法別のコンテンツ */}
        {selectedMethod === 'manual' && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>テキスト内容 *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="読み上げたいテキストを入力してください"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              maxLength={50000}
            />
          </View>
        )}

        {selectedMethod === 'url' && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL *</Text>
              <TextInput
                style={styles.textInput}
                value={url}
                onChangeText={setUrl}
                placeholder="https://example.com"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUrlAnalysis}
              disabled={isLoading || !url.trim()}
            >
              <Ionicons name="download-outline" size={24} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>URLを解析してテキストを取得</Text>
            </TouchableOpacity>
          </>
        )}

        {/* カテゴリ選択 */}
        {renderCategorySelector()}

        {/* 重要度選択 */}
        {renderImportanceSelector()}

        {/* 保存ボタン */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isLoading && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddMaterialScreen;