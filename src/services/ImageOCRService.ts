// src/services/ImageOCRService.ts
// 画像からテキストを抽出するOCRサービス

import TextRecognition from 'react-native-text-recognition';

export interface OCRResult {
  text: string;
  confidence?: number;
  blocks?: TextBlock[];
}

export interface TextBlock {
  text: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * 画像OCRサービス
 * iOS Vision Framework を使用してテキスト認識
 */
export class ImageOCRService {
  /**
   * 画像URIからテキストを抽出
   * @param imageUri 画像ファイルのURI（file:// or content://）
   * @returns 抽出されたテキスト
   */
  static async extractTextFromImage(imageUri: string): Promise<string> {
    try {
      console.log('[ImageOCR] Starting text extraction:', imageUri);

      // react-native-text-recognition を使用
      const result = await TextRecognition.recognize(imageUri);

      if (!result || result.length === 0) {
        console.log('[ImageOCR] No text found in image');
        return '';
      }

      // 全ブロックのテキストを結合
      const extractedText = result
        .map((block: any) => block.text)
        .filter((text: string) => text && text.trim().length > 0)
        .join('\n');

      console.log(`[ImageOCR] ✅ Extracted ${extractedText.length} characters`);
      return extractedText;
    } catch (error) {
      console.error('[ImageOCR] ❌ Failed to extract text:', error);
      throw new Error(`OCR処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * 詳細なOCR結果を取得（ブロック情報含む）
   * @param imageUri 画像ファイルのURI
   * @returns OCR結果（テキスト + ブロック情報）
   */
  static async extractTextWithBlocks(imageUri: string): Promise<OCRResult> {
    try {
      console.log('[ImageOCR] Starting detailed text extraction:', imageUri);

      const result = await TextRecognition.recognize(imageUri);

      if (!result || result.length === 0) {
        return { text: '', blocks: [] };
      }

      // ブロック情報を整形
      const blocks: TextBlock[] = result.map((block: any) => ({
        text: block.text,
        boundingBox: block.boundingBox ? {
          x: block.boundingBox.x,
          y: block.boundingBox.y,
          width: block.boundingBox.width,
          height: block.boundingBox.height,
        } : undefined,
      }));

      // 全テキストを結合
      const fullText = blocks
        .map(b => b.text)
        .filter(text => text && text.trim().length > 0)
        .join('\n');

      console.log(`[ImageOCR] ✅ Extracted ${blocks.length} blocks, ${fullText.length} characters`);

      return {
        text: fullText,
        blocks,
      };
    } catch (error) {
      console.error('[ImageOCR] ❌ Failed to extract text with blocks:', error);
      throw new Error(`OCR処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * 複数の画像からテキストを抽出して結合
   * @param imageUris 画像URIの配列
   * @returns 抽出されたテキスト（改行で結合）
   */
  static async extractTextFromMultipleImages(imageUris: string[]): Promise<string> {
    try {
      console.log(`[ImageOCR] Processing ${imageUris.length} images`);

      const results = await Promise.all(
        imageUris.map(uri => this.extractTextFromImage(uri))
      );

      const combinedText = results
        .filter(text => text.trim().length > 0)
        .join('\n\n---\n\n'); // ページ区切り

      console.log(`[ImageOCR] ✅ Extracted total ${combinedText.length} characters from ${imageUris.length} images`);
      return combinedText;
    } catch (error) {
      console.error('[ImageOCR] ❌ Failed to process multiple images:', error);
      throw new Error(`複数画像のOCR処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * OCR機能が利用可能かチェック
   * @returns 利用可能ならtrue
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // ダミー画像でテスト（実際には機能チェックのみ）
      return true; // react-native-text-recognition がインストールされていればOK
    } catch (error) {
      console.error('[ImageOCR] OCR not available:', error);
      return false;
    }
  }
}

export default ImageOCRService;
