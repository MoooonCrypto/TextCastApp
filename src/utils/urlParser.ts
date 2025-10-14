// src/utils/urlParser.ts - URL解析ユーティリティ

/**
 * URLからテキストを抽出
 */
export async function extractTextFromURL(url: string): Promise<{
  title: string;
  content: string;
  source: string;
}> {
  try {
    console.log('[URL Parser] フェッチ開始:', url);

    // URLの正規化
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // HTMLを取得
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('[URL Parser] HTML取得完了:', html.length, '文字');

    // タイトルを抽出
    const title = extractTitle(html);

    // 本文を抽出
    const content = extractContent(html);

    console.log('[URL Parser] 抽出完了 - タイトル:', title.substring(0, 50));
    console.log('[URL Parser] 本文:', content.substring(0, 100), '...');

    return {
      title,
      content,
      source: normalizedUrl,
    };
  } catch (error) {
    console.error('[URL Parser] エラー:', error);
    throw error;
  }
}

/**
 * HTMLからタイトルを抽出
 */
function extractTitle(html: string): string {
  // Open Graph title
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    return decodeHTML(ogTitleMatch[1]);
  }

  // Twitter title
  const twitterTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
  if (twitterTitleMatch) {
    return decodeHTML(twitterTitleMatch[1]);
  }

  // <title>タグ
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return decodeHTML(titleMatch[1]);
  }

  return 'タイトルなし';
}

/**
 * HTMLから本文を抽出（簡易版）
 */
function extractContent(html: string): string {
  // スクリプトとスタイルを削除
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');

  // article, main, .post, .content などから抽出
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    text = articleMatch[1];
  } else {
    const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      text = mainMatch[1];
    }
  }

  // HTMLタグを削除
  text = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  // 余分な空白を削除
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // 文字数チェック
  if (text.length < 100) {
    throw new Error('本文が短すぎます。記事の本文を取得できませんでした。');
  }

  return text;
}

/**
 * HTML エンティティをデコード
 */
function decodeHTML(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

/**
 * HTMLファイルからテキストを抽出（ローカルファイル用）
 */
export function extractTextFromHTML(html: string, fileName: string): {
  title: string;
  content: string;
} {
  const title = extractTitle(html) !== 'タイトルなし'
    ? extractTitle(html)
    : fileName;

  const content = extractContent(html);

  return { title, content };
}

/**
 * URLの妥当性をチェック
 */
export function isValidURL(url: string): boolean {
  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    new URL(normalizedUrl);
    return true;
  } catch {
    return false;
  }
}
