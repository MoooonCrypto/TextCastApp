// src/services/EPUBParserService.ts
// EPUBファイルからテキストを抽出するサービス

import * as FileSystem from 'expo-file-system';
import ePub from 'epubjs';

export interface EPUBMetadata {
  title?: string;
  creator?: string;
  description?: string;
  publisher?: string;
  pubdate?: string;
  language?: string;
}

export interface EPUBChapter {
  title: string;
  content: string;
  index: number;
}

export interface EPUBContent {
  text: string;
  metadata: EPUBMetadata;
  chapters: EPUBChapter[];
}

/**
 * EPUBパーサーサービス
 * 電子書籍（EPUB形式）からテキストを抽出
 */
export class EPUBParserService {
  /**
   * EPUBファイルからテキストを抽出
   * @param epubUri EPUBファイルのURI
   * @returns 抽出されたテキスト
   */
  static async extractText(epubUri: string): Promise<string> {
    try {
      console.log('[EPUBParser] Starting text extraction:', epubUri);

      // EPUBファイルを読み込み
      const base64 = await FileSystem.readAsStringAsync(epubUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Base64をArrayBufferに変換
      const arrayBuffer = this.base64ToArrayBuffer(base64);

      // epubjsでEPUBを開く
      const book = ePub(arrayBuffer);

      // メタデータとコンテンツを読み込み
      const metadata = await book.loaded.metadata;
      const spine = await book.loaded.spine;

      console.log(`[EPUBParser] EPUB has ${spine.spineItems.length} sections`);

      // 各セクションからテキストを抽出
      const textBlocks: string[] = [];

      for (let i = 0; i < spine.spineItems.length; i++) {
        const item = spine.spineItems[i];
        console.log(`[EPUBParser] Processing section ${i + 1}/${spine.spineItems.length}`);

        try {
          // セクションを読み込み
          const section = await item.load(book.load.bind(book));

          // HTMLからテキストを抽出
          const html = await section.output('text');
          const plainText = this.stripHTML(html);

          if (plainText.trim().length > 0) {
            textBlocks.push(plainText);
          }
        } catch (error) {
          console.warn(`[EPUBParser] Failed to load section ${i + 1}:`, error);
          // スキップして続行
        }
      }

      // 全テキストを結合
      const fullText = textBlocks.join('\n\n---\n\n');

      console.log(`[EPUBParser] ✅ Extracted ${fullText.length} characters from ${textBlocks.length} sections`);

      // クリーンアップ
      book.destroy();

      return fullText;
    } catch (error) {
      console.error('[EPUBParser] ❌ Failed to extract text:', error);
      throw new Error(`EPUB解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * EPUBのメタデータを取得
   * @param epubUri EPUBファイルのURI
   * @returns EPUBメタデータ
   */
  static async getMetadata(epubUri: string): Promise<EPUBMetadata> {
    try {
      console.log('[EPUBParser] Getting EPUB metadata:', epubUri);

      const base64 = await FileSystem.readAsStringAsync(epubUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = this.base64ToArrayBuffer(base64);
      const book = ePub(arrayBuffer);
      const metadata = await book.loaded.metadata;

      const epubMetadata: EPUBMetadata = {
        title: metadata.title,
        creator: metadata.creator,
        description: metadata.description,
        publisher: metadata.publisher,
        pubdate: metadata.pubdate,
        language: metadata.language,
      };

      console.log('[EPUBParser] ✅ Metadata retrieved:', epubMetadata);

      book.destroy();

      return epubMetadata;
    } catch (error) {
      console.error('[EPUBParser] ❌ Failed to get metadata:', error);
      throw new Error(`EPUBメタデータ取得に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * EPUBファイルの全内容を取得（テキスト + メタデータ + 章構成）
   * @param epubUri EPUBファイルのURI
   * @returns EPUB内容
   */
  static async extractContent(epubUri: string): Promise<EPUBContent> {
    try {
      console.log('[EPUBParser] Extracting full EPUB content:', epubUri);

      const base64 = await FileSystem.readAsStringAsync(epubUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = this.base64ToArrayBuffer(base64);
      const book = ePub(arrayBuffer);

      // メタデータ取得
      const metadata = await book.loaded.metadata;
      const spine = await book.loaded.spine;

      // 章ごとにテキスト抽出
      const chapters: EPUBChapter[] = [];
      const textBlocks: string[] = [];

      for (let i = 0; i < spine.spineItems.length; i++) {
        const item = spine.spineItems[i];

        try {
          const section = await item.load(book.load.bind(book));
          const html = await section.output('text');
          const plainText = this.stripHTML(html);

          if (plainText.trim().length > 0) {
            chapters.push({
              title: `Chapter ${i + 1}`,
              content: plainText,
              index: i,
            });
            textBlocks.push(plainText);
          }
        } catch (error) {
          console.warn(`[EPUBParser] Failed to load chapter ${i + 1}:`, error);
        }
      }

      const fullText = textBlocks.join('\n\n---\n\n');

      const epubMetadata: EPUBMetadata = {
        title: metadata.title,
        creator: metadata.creator,
        description: metadata.description,
        publisher: metadata.publisher,
        pubdate: metadata.pubdate,
        language: metadata.language,
      };

      console.log(`[EPUBParser] ✅ Extracted ${chapters.length} chapters, ${fullText.length} characters`);

      book.destroy();

      return {
        text: fullText,
        metadata: epubMetadata,
        chapters,
      };
    } catch (error) {
      console.error('[EPUBParser] ❌ Failed to extract content:', error);
      throw new Error(`EPUB内容抽出に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * Base64文字列をArrayBufferに変換
   * @param base64 Base64文字列
   * @returns ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * HTMLタグを除去してプレーンテキストを取得
   * @param html HTML文字列
   * @returns プレーンテキスト
   */
  private static stripHTML(html: string): string {
    // 簡易的なHTMLタグ除去
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '') // <style>タグを削除
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // <script>タグを削除
      .replace(/<[^>]+>/g, ' ') // HTMLタグを空白に置換
      .replace(/&nbsp;/g, ' ') // &nbsp;を空白に
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // 連続空白を1つに
      .trim();
  }
}

export default EPUBParserService;
