// src/types/index.ts - 完全修正版

export interface TextItem {
  // 基本情報
  id: string;              // UUID
  title: string;           // タイトル（最大50文字）
  content: string;         // 本文（最大100,000文字）

  // 入力ソース
  source: 'manual' | 'file' | 'url' | 'camera' | 'image'; // 入力方法
  sourceUrl?: string;      // 元URL（URLから取得の場合）
  fileName?: string;       // ファイル名（ファイルから取得の場合）
  fileType?: 'pdf' | 'epub' | 'docx' | 'pptx' | 'txt' | 'md' | 'csv' | 'image' | 'jpg' | 'png'; // ファイル種別

  // 分類
  category: string;        // 自動分類カテゴリ
  categoryId?: string;     // カテゴリID（画面遷移用）
  isFavorite: boolean;     // お気に入りフラグ

  // 日時管理
  createdAt: Date;         // 作成日時
  updatedAt: Date;         // 更新日時

  // 削除管理
  isDeleted: boolean;      // ゴミ箱フラグ
  deletedAt?: Date;        // ゴミ箱移動日時

  // 再生管理
  duration?: number;       // 推定再生時間（秒）
  lastPosition?: number;   // 最後の再生位置（秒）
  playCount: number;       // 再生回数
  isCompleted: boolean;    // 読了フラグ

  // メモ・ブックマーク
  bookmarks: Bookmark[];   // ブックマーク
  notes: Note[];           // メモ
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
  // プレミアム管理
  isPremium: boolean;                    // プレミアム会員フラグ
  premiumPurchaseDate?: Date;            // プレミアム購入日

  // 無料プラン制限
  maxFreeItems: number;                  // 基本保存数（デフォルト20）
  bonusItemsFromAds: number;             // 広告視聴ボーナス
  bonusItemsFromReferral: number;        // リファラルボーナス

  // 広告管理
  lastAdWatchedAt?: Date;                // 最後の広告視聴日時
  totalAdsWatched: number;               // 累計広告視聴回数
  adsWatchedToday: number;               // 本日の広告視聴回数
  lastAdResetDate?: Date;                // 広告カウントリセット日

  // リファラル
  referralCode: string;                  // 自分の紹介コード（8桁ランダム）
  referredBy?: string;                   // 紹介者コード
  referralCount: number;                 // 紹介成功数

  // TTS設定
  ttsSpeed: number;                      // 再生速度（0.5-3.0）
  ttsVoice: string;                      // 音声選択

  // UI設定
  theme: 'light' | 'dark' | 'auto';      // テーマ設定
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

// カテゴリ定数（トップ画面と統一）
export const CATEGORIES = {
  PROGRAMMING: 'プログラミング',
  MOBILE: 'モバイル開発',
  DESIGN: 'デザイン',
  TECH: 'テクノロジー',
  SELF: '自己啓発',
  PERSONAL: '個人'
} as const;

// プラン定数
export const PLAN_LIMITS = {
  FREE_BASE_ITEMS: 20,           // 無料プラン基本保存数
  BONUS_PER_AD: 1,               // 広告1回視聴ボーナス
  MAX_ADS_PER_DAY: 10,           // 1日の広告視聴上限
  BONUS_PER_REFERRAL: 10,        // リファラル1人ボーナス
  TRASH_RETENTION_DAYS: 30,      // ゴミ箱保持期間
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