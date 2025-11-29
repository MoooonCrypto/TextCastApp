// src/services/SharedDataService.ts
// Share Extensionとメインアプリ間でデータを共有するサービス

import { NativeModules, Platform } from 'react-native';

const { AppGroupStorage } = NativeModules;

export interface SharedArticle {
  id: string;
  url: string;
  title: string;
  content: string;
  excerpt: string;
  siteName?: string;
  author?: string;
  sharedAt: string; // ISO 8601 format
  processed: boolean; // メインアプリで処理済みかどうか
}

export class SharedDataService {
  private static readonly SHARED_ARTICLES_KEY = 'textcast_shared_articles';

  /**
   * 共有された記事を保存
   */
  static async addSharedArticle(article: Omit<SharedArticle, 'id' | 'sharedAt' | 'processed'>): Promise<string> {
    try {
      const sharedArticle: SharedArticle = {
        ...article,
        id: this.generateId(),
        sharedAt: new Date().toISOString(),
        processed: false,
      };

      const articles = await this.getSharedArticles();
      articles.push(sharedArticle);

      if (Platform.OS === 'ios' && AppGroupStorage) {
        await AppGroupStorage.setItem(this.SHARED_ARTICLES_KEY, JSON.stringify(articles));
      }
      console.log('[SharedData] Article saved:', sharedArticle.id);

      return sharedArticle.id;
    } catch (error) {
      console.error('[SharedData] Save error:', error);
      throw error;
    }
  }

  /**
   * 未処理の共有記事を取得
   */
  static async getUnprocessedArticles(): Promise<SharedArticle[]> {
    try {
      const articles = await this.getSharedArticles();
      return articles.filter(article => !article.processed);
    } catch (error) {
      console.error('[SharedData] Get unprocessed error:', error);
      return [];
    }
  }

  /**
   * すべての共有記事を取得
   */
  static async getSharedArticles(): Promise<SharedArticle[]> {
    try {
      let data: string | null = null;

      if (Platform.OS === 'ios' && AppGroupStorage) {
        data = await AppGroupStorage.getItem(this.SHARED_ARTICLES_KEY);
      }

      if (!data) {
        return [];
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('[SharedData] Get all error:', error);
      return [];
    }
  }

  /**
   * 記事を処理済みにマーク
   */
  static async markAsProcessed(articleId: string): Promise<void> {
    try {
      const articles = await this.getSharedArticles();
      const updated = articles.map(article =>
        article.id === articleId
          ? { ...article, processed: true }
          : article
      );

      if (Platform.OS === 'ios' && AppGroupStorage) {
        await AppGroupStorage.setItem(this.SHARED_ARTICLES_KEY, JSON.stringify(updated));
      }
      console.log('[SharedData] Marked as processed:', articleId);
    } catch (error) {
      console.error('[SharedData] Mark processed error:', error);
      throw error;
    }
  }

  /**
   * 処理済みの古い記事を削除（30日以上前）
   */
  static async cleanupOldArticles(): Promise<void> {
    try {
      const articles = await this.getSharedArticles();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filtered = articles.filter(article => {
        if (!article.processed) {
          return true; // 未処理は残す
        }

        const sharedDate = new Date(article.sharedAt);
        return sharedDate > thirtyDaysAgo; // 30日以内は残す
      });

      if (Platform.OS === 'ios' && AppGroupStorage) {
        await AppGroupStorage.setItem(this.SHARED_ARTICLES_KEY, JSON.stringify(filtered));
      }
      console.log('[SharedData] Cleanup completed:', articles.length - filtered.length, 'articles removed');
    } catch (error) {
      console.error('[SharedData] Cleanup error:', error);
    }
  }

  /**
   * 記事を削除
   */
  static async deleteArticle(articleId: string): Promise<void> {
    try {
      const articles = await this.getSharedArticles();
      const filtered = articles.filter(article => article.id !== articleId);

      if (Platform.OS === 'ios' && AppGroupStorage) {
        await AppGroupStorage.setItem(this.SHARED_ARTICLES_KEY, JSON.stringify(filtered));
      }
      console.log('[SharedData] Article deleted:', articleId);
    } catch (error) {
      console.error('[SharedData] Delete error:', error);
      throw error;
    }
  }

  /**
   * すべての共有記事をクリア
   */
  static async clearAll(): Promise<void> {
    try {
      if (Platform.OS === 'ios' && AppGroupStorage) {
        await AppGroupStorage.removeItem(this.SHARED_ARTICLES_KEY);
      }
      console.log('[SharedData] All articles cleared');
    } catch (error) {
      console.error('[SharedData] Clear error:', error);
      throw error;
    }
  }

  /**
   * ユニークIDを生成
   */
  private static generateId(): string {
    return `shared_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
