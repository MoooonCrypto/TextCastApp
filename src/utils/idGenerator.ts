// src/utils/idGenerator.ts

/**
 * アイテムID生成（タイムスタンプ + ランダム文字列）
 * 例: "item_1704067200000_k7j3m9x2a"
 */
export const generateItemId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11); // 9文字
  return `item_${timestamp}_${random}`;
};

/**
 * リファラルコード生成（8桁ランダム英数字）
 * 例: "k7j3m9x2"
 */
export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 10); // 8文字
};

/**
 * ブックマークID生成
 * 例: "bookmark_1704067200000_abc123"
 */
export const generateBookmarkId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8); // 6文字
  return `bookmark_${timestamp}_${random}`;
};

/**
 * ノートID生成
 * 例: "note_1704067200000_xyz789"
 */
export const generateNoteId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8); // 6文字
  return `note_${timestamp}_${random}`;
};

/**
 * カテゴリID生成
 * 例: "category_1704067200000_def456"
 */
export const generateCategoryId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8); // 6文字
  return `category_${timestamp}_${random}`;
};
