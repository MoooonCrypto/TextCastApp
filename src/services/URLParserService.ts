// src/services/URLParserService.ts
// URLから記事情報を抽出するサービス

import { Readability } from '@mozilla/readability';
import { parse } from 'node-html-parser';

export interface ParsedArticle {
  title: string;
  content: string;
  excerpt: string;
  url: string;
  siteName?: string;
  author?: string;
}

export class URLParserService {
  /**
   * URLから記事情報を取得
   */
  static async parseURL(url: string): Promise<ParsedArticle> {
    try {
      console.log('[URLParser] Fetching URL:', url);

      // URLからHTMLを取得
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      console.log('[URLParser] HTML fetched, length:', html.length);

      // HTMLをパース
      const doc = parse(html);

      // Readabilityで本文抽出
      const article = new Readability(doc as any).parse();

      if (!article) {
        throw new Error('Failed to parse article content');
      }

      console.log('[URLParser] Article parsed:', article.title);

      // メタデータを抽出
      const siteName = this.extractMetaContent(doc, 'og:site_name') ||
                       this.extractMetaContent(doc, 'twitter:site') ||
                       new URL(url).hostname;

      const author = this.extractMetaContent(doc, 'author') ||
                     this.extractMetaContent(doc, 'og:author') ||
                     article.byline;

      // HTMLタグを除去してプレーンテキストに
      const plainTextContent = this.stripHTML(article.textContent || article.content);

      return {
        title: article.title || 'Untitled',
        content: plainTextContent,
        excerpt: article.excerpt || plainTextContent.substring(0, 200) + '...',
        url: url,
        siteName: siteName,
        author: author || undefined,
      };

    } catch (error) {
      console.error('[URLParser] Parse error:', error);
      throw error;
    }
  }

  /**
   * メタタグの内容を取得
   */
  private static extractMetaContent(doc: any, property: string): string | null {
    try {
      // og:property形式
      const ogTag = doc.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        return ogTag.getAttribute('content');
      }

      // name形式
      const nameTag = doc.querySelector(`meta[name="${property}"]`);
      if (nameTag) {
        return nameTag.getAttribute('content');
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * HTMLタグを除去してプレーンテキストに変換
   */
  private static stripHTML(html: string): string {
    try {
      const doc = parse(html);
      return doc.textContent
        .replace(/\s+/g, ' ') // 連続する空白を1つに
        .replace(/\n+/g, '\n') // 連続する改行を1つに
        .trim();
    } catch (error) {
      // パースに失敗した場合は正規表現でタグを除去
      return html
        .replace(/<[^>]*>/g, '') // HTMLタグを除去
        .replace(/&nbsp;/g, ' ') // &nbsp;を空白に
        .replace(/&amp;/g, '&') // &amp;を&に
        .replace(/&lt;/g, '<') // &lt;を<に
        .replace(/&gt;/g, '>') // &gt;を>に
        .replace(/&quot;/g, '"') // &quot;を"に
        .replace(/&#39;/g, "'") // &#39;を'に
        .replace(/\s+/g, ' ') // 連続する空白を1つに
        .replace(/\n+/g, '\n') // 連続する改行を1つに
        .trim();
    }
  }

  /**
   * URLの妥当性チェック
   */
  static isValidURL(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * URLの正規化（http → https、末尾スラッシュ除去など）
   */
  static normalizeURL(urlString: string): string {
    try {
      const url = new URL(urlString);

      // httpをhttpsに
      if (url.protocol === 'http:') {
        url.protocol = 'https:';
      }

      // 末尾のスラッシュを除去
      url.pathname = url.pathname.replace(/\/$/, '');

      return url.toString();
    } catch (error) {
      return urlString;
    }
  }
}
