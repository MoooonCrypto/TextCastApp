// src/screens/ImportScreen.tsx
// マルチフォーマットインポート画面

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import ImageOCRService from '../services/ImageOCRService';
import PDFParserService from '../services/PDFParserService';
import EPUBParserService from '../services/EPUBParserService';
import { StorageService } from '../services/StorageService';

export default function ImportScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  /**
   * カメラで撮影してOCR
   */
  const handleCameraCapture = async () => {
    try {
      // カメラ権限チェック
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限エラー', 'カメラへのアクセスが許可されていません');
        return;
      }

      // 画像撮影
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (result.canceled) {
        return;
      }

      setIsLoading(true);
      setLoadingMessage('画像からテキストを抽出中...');

      // OCR処理
      const text = await ImageOCRService.extractTextFromImage(result.assets[0].uri);

      if (!text || text.trim().length === 0) {
        Alert.alert('エラー', 'テキストが検出されませんでした');
        setIsLoading(false);
        return;
      }

      // TextItemとして保存
      await StorageService.addItem({
        title: '撮影画像',
        content: text,
        source: 'camera',
        category: '個人',
        isFavorite: false,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      });

      setIsLoading(false);
      Alert.alert('成功', `${text.length}文字のテキストをインポートしました`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('[Import] Camera capture failed:', error);
      Alert.alert('エラー', 'カメラ撮影に失敗しました');
    }
  };

  /**
   * ギャラリーから画像を選択してOCR
   */
  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        return;
      }

      setIsLoading(true);
      setLoadingMessage('画像からテキストを抽出中...');

      const text = await ImageOCRService.extractTextFromImage(result.assets[0].uri);

      if (!text || text.trim().length === 0) {
        Alert.alert('エラー', 'テキストが検出されませんでした');
        setIsLoading(false);
        return;
      }

      await StorageService.addItem({
        title: result.assets[0].fileName || '画像ファイル',
        content: text,
        source: 'image',
        fileName: result.assets[0].fileName,
        fileType: 'image',
        category: '個人',
        isFavorite: false,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      });

      setIsLoading(false);
      Alert.alert('成功', `${text.length}文字のテキストをインポートしました`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('[Import] Image pick failed:', error);
      Alert.alert('エラー', '画像の読み込みに失敗しました');
    }
  };

  /**
   * PDFファイルをインポート
   */
  const handlePDFPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setIsLoading(true);
      setLoadingMessage('PDFからテキストを抽出中...');

      const content = await PDFParserService.extractContent(result.assets[0].uri);

      if (!content.text || content.text.trim().length === 0) {
        Alert.alert('エラー', 'テキストが抽出できませんでした');
        setIsLoading(false);
        return;
      }

      await StorageService.addItem({
        title: content.metadata.title || result.assets[0].name || 'PDFファイル',
        content: content.text,
        source: 'file',
        fileName: result.assets[0].name,
        fileType: 'pdf',
        category: '個人',
        isFavorite: false,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      });

      setIsLoading(false);
      Alert.alert(
        '成功',
        `${content.pageCount}ページ、${content.text.length}文字のテキストをインポートしました`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      console.error('[Import] PDF pick failed:', error);
      Alert.alert('エラー', 'PDFの読み込みに失敗しました');
    }
  };

  /**
   * EPUBファイルをインポート
   */
  const handleEPUBPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // EPUBはapplication/epub+zipだが、互換性のため*/*を使用
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // EPUBファイルかチェック
      if (!result.assets[0].name?.endsWith('.epub')) {
        Alert.alert('エラー', 'EPUBファイルを選択してください');
        return;
      }

      setIsLoading(true);
      setLoadingMessage('EPUBからテキストを抽出中...');

      const content = await EPUBParserService.extractContent(result.assets[0].uri);

      if (!content.text || content.text.trim().length === 0) {
        Alert.alert('エラー', 'テキストが抽出できませんでした');
        setIsLoading(false);
        return;
      }

      await StorageService.addItem({
        title: content.metadata.title || result.assets[0].name || 'EPUB書籍',
        content: content.text,
        source: 'file',
        fileName: result.assets[0].name,
        fileType: 'epub',
        category: '個人',
        isFavorite: false,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      });

      setIsLoading(false);
      Alert.alert(
        '成功',
        `${content.chapters.length}章、${content.text.length}文字のテキストをインポートしました`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      console.error('[Import] EPUB pick failed:', error);
      Alert.alert('エラー', 'EPUBの読み込みに失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>インポート</Text>
        <Text style={styles.subtitle}>
          画像やドキュメントからテキストを読み込みます
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 画像から読み込み</Text>

          <TouchableOpacity style={styles.button} onPress={handleCameraCapture}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.buttonText}>カメラで撮影</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleImagePick}>
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.buttonText}>ギャラリーから選択</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 ドキュメントから読み込み</Text>

          <TouchableOpacity style={styles.button} onPress={handlePDFPick}>
            <Ionicons name="document-text" size={24} color="#fff" />
            <Text style={styles.buttonText}>PDFファイル</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleEPUBPick}>
            <Ionicons name="book" size={24} color="#fff" />
            <Text style={styles.buttonText}>EPUB電子書籍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ 画像やPDFからは自動的にテキストを抽出します（OCR）
          </Text>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
});
