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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { StorageService } from '../services/StorageService';
import { PlanService } from '../services/PlanService';
import { validateTextItem } from '../utils/validation';
import { CATEGORIES } from '../types';
import { usePlayerStore } from '../stores/usePlayerStore';
import { extractTextFromURL, extractTextFromHTML, isValidURL } from '../utils/urlParser';

type InputMethod = 'selection' | 'manual' | 'file' | 'url';

const AddMaterialScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { refreshPlaylist } = usePlayerStore();
  const styles = createStyles(theme);

  const [inputMethod, setInputMethod] = useState<InputMethod>('selection');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('プログラミング');
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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

  // 入力方法選択ハンドラー
  const handleSelectInputMethod = async (method: InputMethod) => {
    setInputMethod(method);

    // 手動入力の場合はそのまま入力画面へ
    if (method === 'manual') {
      return;
    }

    // ファイル選択の場合
    if (method === 'file') {
      await handlePickFile();
      return;
    }

    // URL入力の場合
    if (method === 'url') {
      // URL入力画面に遷移するだけ
      return;
    }

    // その他の方法は今後実装
    Alert.alert('準備中', 'この機能は現在開発中です');
    setInputMethod('selection');
  };

  // ファイル選択処理
  const handlePickFile = async () => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',
          'text/markdown',
          'text/html',
          'text/csv',
          'text/tab-separated-values',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('ファイル選択がキャンセルされました');
        setInputMethod('selection');
        return;
      }

      const file = result.assets[0];
      console.log('選択されたファイル:', file.name);

      // ファイルサイズチェック (10MB制限)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size && file.size > maxSize) {
        Alert.alert('エラー', 'ファイルサイズが大きすぎます（最大10MB）');
        setInputMethod('selection');
        return;
      }

      // ファイルを読み込み
      const response = await fetch(file.uri);
      const text = await response.text();

      // ファイル拡張子を確認
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileName = file.name.replace(/\.(txt|md|html|htm|docx|csv|tsv)$/i, '');

      // .docxファイルの場合
      if (fileExtension === 'docx') {
        try {
          // Base64で読み込み
          const base64Content = await FileSystem.readAsStringAsync(file.uri, {
            encoding: 'base64',
          });

          // Base64をArrayBufferに変換
          const binaryString = atob(base64Content);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const arrayBuffer = bytes.buffer;

          // mammothでテキスト抽出
          const result = await mammoth.extractRawText({ arrayBuffer });
          const extractedText = result.value.trim();

          if (!extractedText || extractedText.length < 10) {
            Alert.alert('エラー', 'Word文書からテキストを抽出できませんでした');
            setInputMethod('selection');
            return;
          }

          setTitle(fileName);
          setContent(extractedText);

          console.log('✅ Word文書読み込み完了:', fileName, extractedText.length, '文字');
        } catch (error) {
          console.error('❌ Word文書解析エラー:', error);
          Alert.alert('エラー', 'Word文書の解析に失敗しました');
          setInputMethod('selection');
          return;
        }
      }
      // CSV/TSVファイルの場合
      else if (fileExtension === 'csv' || fileExtension === 'tsv') {
        try {
          const delimiter = fileExtension === 'tsv' ? '\t' : ',';

          // PapaParseでCSV/TSVをパース
          const parsed = Papa.parse(text, {
            delimiter,
            header: true,
            skipEmptyLines: true,
          });

          if (parsed.errors.length > 0) {
            console.warn('CSV/TSVパース警告:', parsed.errors);
          }

          if (!parsed.data || parsed.data.length === 0) {
            Alert.alert('エラー', 'CSV/TSVファイルからデータを読み込めませんでした');
            setInputMethod('selection');
            return;
          }

          // データを整形してテキスト化
          let formattedText = '';
          parsed.data.forEach((row: any, index: number) => {
            formattedText += `--- エントリ ${index + 1} ---\n`;
            Object.entries(row).forEach(([key, value]) => {
              if (value) {
                formattedText += `${key}: ${value}\n`;
              }
            });
            formattedText += '\n';
          });

          setTitle(fileName);
          setContent(formattedText.trim());

          console.log('✅ CSV/TSV読み込み完了:', fileName, parsed.data.length, '行');
        } catch (error) {
          console.error('❌ CSV/TSV解析エラー:', error);
          Alert.alert('エラー', 'CSV/TSVファイルの解析に失敗しました');
          setInputMethod('selection');
          return;
        }
      }
      // HTMLファイルの場合はパース処理
      else if (fileExtension === 'html' || fileExtension === 'htm') {
        try {
          const extracted = extractTextFromHTML(text, fileName);
          setTitle(extracted.title);
          setContent(extracted.content);
        } catch (error) {
          console.error('❌ HTML解析エラー:', error);
          Alert.alert('エラー', 'HTMLファイルの解析に失敗しました');
          setInputMethod('selection');
          return;
        }
      } else {
        // テキスト/Markdownファイルはそのまま
        setTitle(fileName);
        setContent(text);
      }

      // 手動入力画面に遷移
      setInputMethod('manual');

      console.log('✅ ファイル読み込み完了:', fileName);
    } catch (error) {
      console.error('❌ ファイル選択エラー:', error);
      Alert.alert('エラー', 'ファイルの読み込みに失敗しました');
      setInputMethod('selection');
    } finally {
      setIsLoading(false);
    }
  };

  // URL読み込み処理
  const handleLoadURL = async () => {
    if (!urlInput.trim()) {
      Alert.alert('エラー', 'URLを入力してください');
      return;
    }

    if (!isValidURL(urlInput)) {
      Alert.alert('エラー', '有効なURLを入力してください');
      return;
    }

    try {
      setIsLoading(true);

      const result = await extractTextFromURL(urlInput);

      // タイトルと本文を設定
      setTitle(result.title);
      setContent(result.content);

      // 手動入力画面に遷移
      setInputMethod('manual');

      console.log('✅ URL読み込み完了:', result.title);
    } catch (error) {
      console.error('❌ URL読み込みエラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'URLの読み込みに失敗しました';
      Alert.alert('エラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // クリップボードから貼り付け
  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        // 既に内容がある場合は追記するか確認
        if (content.trim()) {
          Alert.alert('確認', '現在の内容に追記しますか？', [
            { text: 'キャンセル', style: 'cancel' },
            { text: '置き換え', onPress: () => setContent(text) },
            { text: '追記', onPress: () => setContent(content + '\n\n' + text) },
          ]);
        } else {
          setContent(text);
        }
      } else {
        Alert.alert('エラー', 'クリップボードにテキストがありません');
      }
    } catch (error) {
      console.error('クリップボード読み取りエラー:', error);
      Alert.alert('エラー', 'クリップボードの読み取りに失敗しました');
    }
  };

  // 入力方法選択画面に戻る
  const handleBackToSelection = () => {
    if (title.trim() || content.trim() || urlInput.trim()) {
      Alert.alert('確認', '入力内容が失われますが、よろしいですか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '破棄',
          style: 'destructive',
          onPress: () => {
            setTitle('');
            setContent('');
            setUrlInput('');
            setInputMethod('selection');
          },
        },
      ]);
    } else {
      setInputMethod('selection');
    }
  };

  // 入力方法選択画面をレンダリング
  const renderSelectionScreen = () => (
    <>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>新規作成</Text>

        <View style={styles.headerButton} />
      </View>

      {/* 入力方法選択ボタン */}
      <ScrollView style={styles.content} contentContainerStyle={styles.selectionContainer}>
        <Text style={styles.selectionTitle}>入力方法を選択してください</Text>

        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => handleSelectInputMethod('manual')}
          activeOpacity={0.7}
        >
          <View style={styles.selectionButtonIcon}>
            <Ionicons name="create-outline" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.selectionButtonContent}>
            <Text style={styles.selectionButtonTitle}>手動入力</Text>
            <Text style={styles.selectionButtonDescription}>テキストを直接入力</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => handleSelectInputMethod('url')}
          activeOpacity={0.7}
        >
          <View style={styles.selectionButtonIcon}>
            <Ionicons name="link-outline" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.selectionButtonContent}>
            <Text style={styles.selectionButtonTitle}>URL読み込み</Text>
            <Text style={styles.selectionButtonDescription}>Webページからテキスト抽出</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => handleSelectInputMethod('file')}
          activeOpacity={0.7}
        >
          <View style={styles.selectionButtonIcon}>
            <Ionicons name="document-text-outline" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.selectionButtonContent}>
            <Text style={styles.selectionButtonTitle}>ファイル選択</Text>
            <Text style={styles.selectionButtonDescription}>
              .txt, .md, .html, .docx, .csv, .tsv
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

      </ScrollView>
    </>
  );

  // 手動入力画面をレンダリング
  const renderManualInputScreen = () => (
    <>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackToSelection}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>手動入力</Text>

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
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>本文（最大100,000文字）</Text>
            <TouchableOpacity
              style={styles.pasteButton}
              onPress={handlePasteFromClipboard}
              activeOpacity={0.7}
            >
              <Ionicons name="clipboard-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.pasteButtonText}>貼り付け</Text>
            </TouchableOpacity>
          </View>
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
    </>
  );

  // URL入力画面をレンダリング
  const renderURLInputScreen = () => (
    <>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackToSelection}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>URL読み込み</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>URL</Text>
          <TextInput
            style={[styles.textInput, styles.urlInput]}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="https://example.com/article"
            placeholderTextColor={theme.colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <TouchableOpacity
          style={[styles.loadButton, isLoading && styles.loadButtonDisabled]}
          onPress={handleLoadURL}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color={theme.colors.background} />
              <Text style={styles.loadButtonText}>読み込む</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            WebページのURLを入力すると、自動的にタイトルと本文を抽出します。
          </Text>
        </View>
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {inputMethod === 'selection' && renderSelectionScreen()}
      {inputMethod === 'manual' && renderManualInputScreen()}
      {inputMethod === 'url' && renderURLInputScreen()}
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

    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },

    inputLabel: {
      fontSize: theme.fontSize.s,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.textSecondary,
    },

    pasteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.s,
      backgroundColor: `${theme.colors.primary}15`,
      gap: 4,
    },

    pasteButtonText: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.primary,
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

    // 入力方法選択画面のスタイル
    selectionContainer: {
      paddingTop: theme.spacing.xl,
    },

    selectionTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },

    selectionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 72,
    },

    selectionButtonIcon: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.m,
    },

    selectionButtonContent: {
      flex: 1,
    },

    selectionButtonTitle: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: 4,
    },

    selectionButtonDescription: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
    },

    // URL入力画面のスタイル
    urlInput: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    loadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.m,
      paddingVertical: theme.spacing.m,
      marginHorizontal: theme.spacing.m,
      marginBottom: theme.spacing.m,
      gap: theme.spacing.s,
    },

    loadButtonDisabled: {
      opacity: 0.5,
    },

    loadButtonText: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
  });

export default AddMaterialScreen;
