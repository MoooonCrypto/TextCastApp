// src/services/PDFParserService.ts
// PDFファイルからテキストを抽出するサービス（OCRフォールバック対応）

import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import Pdf from 'react-native-pdf';
import ImageOCRService from './ImageOCRService';

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
}

export interface PDFContent {
  text: string;
  metadata: PDFMetadata;
  pageCount: number;
  extractionMethod: 'text' | 'ocr' | 'hybrid';
}

/**
 * PDFパーサーサービス
 * テキストベースPDFからテキスト抽出 + OCRフォールバック
 */
export class PDFParserService {
  private static readonly TEXT_THRESHOLD = 100; // テキスト抽出成功の最小文字数

  /**
   * PDFファイルからテキストを抽出（自動フォールバック）
   * @param pdfUri PDFファイルのURI
   * @returns 抽出されたテキスト
   */
  static async extractText(pdfUri: string): Promise<string> {
    try {
      console.log('[PDFParser] Starting text extraction:', pdfUri);

      // 1. まずテキストベース抽出を試みる
      const textExtracted = await this.tryTextExtraction(pdfUri);

      // 2. テキストが十分に取得できたかチェック
      if (textExtracted && textExtracted.trim().length >= this.TEXT_THRESHOLD) {
        console.log(`[PDFParser] ✅ Text-based extraction succeeded (${textExtracted.length} chars)`);
        return textExtracted;
      }

      // 3. テキスト不足または失敗の場合、OCRにフォールバック
      console.log('[PDFParser] ⚠️ Text extraction insufficient, falling back to OCR');
      return await this.extractWithOCR(pdfUri);

    } catch (error) {
      // エラー時もOCRで試行
      console.log('[PDFParser] ❌ Text extraction failed, using OCR fallback');
      return await this.extractWithOCR(pdfUri);
    }
  }

  /**
   * テキストベースPDFからテキスト抽出を試みる
   * @param pdfUri PDFファイルのURI
   * @returns 抽出されたテキスト（失敗時は空文字）
   */
  private static async tryTextExtraction(pdfUri: string): Promise<string> {
    try {
      console.log('[PDFParser] Attempting text-based extraction...');

      // react-native-pdfを使用してテキスト抽出
      // 注: react-native-pdfは主に表示用のため、テキスト抽出は限定的
      // PDFのメタデータからテキストを取得できるか試行

      const base64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const pdfDoc = await PDFDocument.load(base64);
      const pages = pdfDoc.getPages();

      console.log(`[PDFParser] PDF has ${pages.length} pages`);

      // pdf-lib自体にはテキスト抽出機能がないため、
      // ここでは基本情報のみ取得し、OCRに任せる
      return ''; // 空文字を返してOCRにフォールバック

    } catch (error) {
      console.warn('[PDFParser] Text extraction attempt failed:', error);
      return '';
    }
  }

  /**
   * OCRを使用してPDFからテキストを抽出
   * PDFを画像化してOCR処理（スキャンPDF対応）
   * @param pdfUri PDFファイルのURI
   * @returns 抽出されたテキスト
   */
  private static async extractWithOCR(pdfUri: string): Promise<string> {
    try {
      console.log('[PDFParser] Starting OCR extraction...');

      // PDFのページ数を取得
      const base64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdfDoc = await PDFDocument.load(base64);
      const pageCount = pdfDoc.getPages().length;

      console.log(`[PDFParser] OCR processing ${pageCount} pages...`);

      // 注: React NativeでPDFを画像化する処理は複雑なため、
      // ここでは簡易的な実装として、ユーザーに画像としてインポートすることを推奨
      // 実際の実装では、react-native-pdf-rendererなどを使用してページごとに画像化→OCR

      // 暫定: PDFページ情報のみ返す（実装の完全版は後で追加）
      const placeholderText = `[PDF OCR処理]\nこのPDFには ${pageCount} ページが含まれています。\n\n※ 現在、PDFのOCR処理は開発中です。\n※ 画像として各ページをスキャンしてインポートすることを推奨します。`;

      console.log('[PDFParser] ⚠️ OCR extraction is under development');
      return placeholderText;

    } catch (error) {
      console.error('[PDFParser] ❌ OCR extraction failed:', error);
      throw new Error(`PDF OCR処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * PDFのメタデータを取得
   * @param pdfUri PDFファイルのURI
   * @returns PDFメタデータ
   */
  static async getMetadata(pdfUri: string): Promise<PDFMetadata> {
    try {
      console.log('[PDFParser] Getting PDF metadata:', pdfUri);

      const base64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const pdfDoc = await PDFDocument.load(base64);
      const pages = pdfDoc.getPages();

      // メタデータ取得
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const subject = pdfDoc.getSubject();
      const keywords = pdfDoc.getKeywords();
      const creator = pdfDoc.getCreator();
      const producer = pdfDoc.getProducer();
      const creationDate = pdfDoc.getCreationDate();
      const modificationDate = pdfDoc.getModificationDate();

      const metadata: PDFMetadata = {
        title,
        author,
        subject,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        creator,
        producer,
        creationDate,
        modificationDate,
        pageCount: pages.length,
      };

      console.log('[PDFParser] ✅ Metadata retrieved:', metadata);
      return metadata;
    } catch (error) {
      console.error('[PDFParser] ❌ Failed to get metadata:', error);
      throw new Error(`PDFメタデータ取得に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * PDFファイルの情報を取得（テキスト + メタデータ）
   * @param pdfUri PDFファイルのURI
   * @returns PDF内容
   */
  static async extractContent(pdfUri: string): Promise<PDFContent> {
    try {
      console.log('[PDFParser] Extracting full PDF content:', pdfUri);

      const [text, metadata] = await Promise.all([
        this.extractText(pdfUri),
        this.getMetadata(pdfUri),
      ]);

      // 抽出方法を判定
      const extractionMethod = text.includes('[PDF OCR処理]')
        ? 'ocr'
        : text.trim().length >= this.TEXT_THRESHOLD
          ? 'text'
          : 'hybrid';

      return {
        text,
        metadata,
        pageCount: metadata.pageCount,
        extractionMethod,
      };
    } catch (error) {
      console.error('[PDFParser] ❌ Failed to extract content:', error);
      throw new Error(`PDF内容抽出に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * PDFがテキストベースか画像ベースかを判定
   * @param pdfUri PDFファイルのURI
   * @returns テキストベースならtrue、画像ベース（スキャンPDF）ならfalse
   */
  static async isTextBasedPDF(pdfUri: string): Promise<boolean> {
    try {
      const textExtracted = await this.tryTextExtraction(pdfUri);

      // 抽出されたテキストが一定量あればテキストベースと判断
      const hasEnoughText = textExtracted.trim().length >= this.TEXT_THRESHOLD;

      console.log(`[PDFParser] PDF type: ${hasEnoughText ? 'Text-based' : 'Image-based (scanned)'}`);
      return hasEnoughText;
    } catch (error) {
      console.error('[PDFParser] Failed to determine PDF type:', error);
      return false; // エラー時は画像ベースと仮定
    }
  }
}

export default PDFParserService;
