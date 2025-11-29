// src/utils/processSharedArticles.ts
// 共有された記事を処理してTextItemに変換

import { SharedDataService, SharedArticle } from '../services/SharedDataService';
import { URLParserService } from '../services/URLParserService';
import { StorageService } from '../services/StorageService';
import { TextItem } from '../types';
import uuid from 'react-native-uuid';

/**
 * 未処理の共有記事をチェックして処理
 */
export async function processSharedArticles(): Promise<number> {
  try {
    console.log('[ProcessShared] Checking for shared articles...');

    const unprocessedArticles = await SharedDataService.getUnprocessedArticles();

    if (unprocessedArticles.length === 0) {
      console.log('[ProcessShared] No shared articles found');
      return 0;
    }

    console.log(`[ProcessShared] Processing ${unprocessedArticles.length} shared articles`);

    for (const article of unprocessedArticles) {
      try {
        await processSharedArticle(article);
        await SharedDataService.markAsProcessed(article.id);
        console.log(`[ProcessShared] ✅ Processed: ${article.title}`);
      } catch (error) {
        console.error(`[ProcessShared] ❌ Failed to process: ${article.title}`, error);
        // エラーでも処理済みにマーク（無限ループ防止）
        await SharedDataService.markAsProcessed(article.id);
      }
    }

    // 古い記事をクリーンアップ
    await SharedDataService.cleanupOldArticles();

    return unprocessedArticles.length;
  } catch (error) {
    console.error('[ProcessShared] Error:', error);
    return 0;
  }
}

/**
 * 共有記事を TextItem に変換して保存
 */
async function processSharedArticle(article: SharedArticle): Promise<void> {
  // contentが空の場合はURLから取得
  let content = article.content;
  let title = article.title;
  let excerpt = article.excerpt;
  let siteName = article.siteName;
  let author = article.author;

  if (!content || content.trim() === '') {
    console.log(`[ProcessShared] Fetching content from URL: ${article.url}`);
    try {
      const parsed = await URLParserService.parseURL(article.url);
      content = parsed.content;
      title = parsed.title || title;
      excerpt = parsed.excerpt || excerpt;
      siteName = parsed.siteName || siteName;
      author = parsed.author || author;
      console.log(`[ProcessShared] Content fetched successfully`);
    } catch (error) {
      console.error(`[ProcessShared] Failed to fetch content:`, error);
      // URL取得に失敗してもタイトルだけで保存
      content = `記事の取得に失敗しました。URL: ${article.url}`;
    }
  }

  // TextItemを作成
  const textItem: TextItem = {
    id: uuid.v4().toString(),
    title: title,
    content: content,
    source: 'url',
    sourceUrl: article.url,
    createdAt: article.sharedAt,
    updatedAt: new Date().toISOString(),
    metadata: {
      siteName: siteName,
      author: author,
      excerpt: excerpt,
    },
  };

  // デフォルトプレイリストに追加
  // TODO: ユーザーが選択したプレイリストに追加する機能を実装
  await StorageService.saveItem(textItem);

  console.log(`[ProcessShared] Saved as TextItem: ${textItem.id}`);
}
