// src/types/index.ts - 完全修正版

export interface TextItem {
  id: string;              // UUID
  title: string;           // タイトル（最大100文字）
  content: string;         // 本文（最大50,000文字）
  source: 'manual' | 'file' | 'url' | 'camera'; // 入力方法
  sourceUrl?: string;      // 元URL（URLから取得の場合）
  fileName?: string;       // ファイル名（ファイルから取得の場合）
  fileType?: string;       // ファイル種別（pdf, docx, etc.）
  category: string;        // 自動分類カテゴリ
  categoryId?: string;     // カテゴリID（画面遷移用）
  tags: string[];          // タグ（手動・自動）
  importance: 1 | 2 | 3;   // 重要度（1:低 2:中 3:高）
  createdAt: Date;         // 作成日時
  updatedAt: Date;         // 更新日時
  duration?: number;       // 推定再生時間（秒）
  lastPosition?: number;   // 最後の再生位置（文字数）
  playCount: number;       // 再生回数
  isCompleted: boolean;    // 読了フラグ
  bookmarks: Bookmark[];   // ブックマーク
  notes: Note[];           // メモ
  isFavorite: boolean;     // お気に入りフラグ - 追加
}

export interface Bookmark {
  id: string;
  position: number;        // 文字位置
  title: string;           // ブックマークのタイトル
  note?: string;           // メモ内容（オプション）
  createdAt: Date;
}

export interface Note {
  id: string;
  position: number;        // 関連位置
  content: string;         // メモ内容
  audioNote?: string;      // 音声メモのパス
  createdAt: Date;
}

export interface UserSettings {
  isPremium: boolean;           // プレミアム会員フラグ
  ttsSpeed: number;            // 再生速度（0.5-3.0）
  ttsVoice: string;           // 音声選択
  autoHighlight: boolean;      // 読み上げハイライト
  autoScroll: boolean;         // 自動スクロール
  skipUrls: boolean;          // URL読み飛ばし
  skipBrackets: boolean;       // 括弧内読み飛ばし
  maxFreeItems: number;        // 無料版上限数（50件）
  maxFreeFiles: number;        // 無料版ファイル上限（月5件）
  maxFreeUrls: number;         // 無料版URL上限（月10件）
  theme: 'light' | 'dark' | 'auto'; // テーマ設定
  fontSize: 'small' | 'medium' | 'large'; // フォントサイズ
}

export interface ExtractedContent {
  title: string;
  content: string;
  author?: string;
  publishDate?: Date;
  wordCount: number;
  estimatedDuration: number;
}

export interface YouTubeContent extends ExtractedContent {
  videoId: string;
  transcript?: string;
  description: string;
  duration: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentItem?: TextItem;
  currentPosition: number;
  speed: number;
  volume: number;
}

// カテゴリ定数
export const CATEGORIES = {
  BUSINESS: 'ビジネス',
  STUDY: '学習',
  NEWS: 'ニュース',
  ENTERTAINMENT: 'エンタメ',
  PERSONAL: '個人',
  OTHER: 'その他'
} as const;

// 重要度定数
export const IMPORTANCE_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
} as const;

// ファイル形式定数
export const SUPPORTED_FILE_TYPES = {
  PDF: 'pdf',
  WORD: 'docx',
  POWERPOINT: 'pptx',
  TEXT: 'txt',
  MARKDOWN: 'md',
  EPUB: 'epub'
} as const;