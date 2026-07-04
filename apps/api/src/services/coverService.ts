import type { Env } from '../types/env';

const RAKUTEN_BOOKS_API_URL =
  'https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404';

// 楽天ウェブサービスのアプリ登録で許可済みのドメイン（Allowed websites）。
// サーバー間リクエストにはRefererが付かないため、許可リスト判定を通すよう明示的に付与する
const RAKUTEN_REFERER = 'https://tsundoku.deepon.dev/';

// largeImageUrlのデフォルトは200x200。UI表示用に十分な解像度へ引き上げる
const COVER_IMAGE_SIZE = '400x400';

interface RakutenBookItem {
  Item: {
    largeImageUrl?: string;
  };
}

interface RakutenBooksSearchResponse {
  Items?: RakutenBookItem[];
}

/**
 * 楽天ブックス書籍検索APIから書影画像URLを取得するサービス
 *
 * NDL書影APIが2026-03-31で終了したため、書影取得は楽天APIで代替する。
 * https://github.com/dznbk/tsundoku-dragon/issues/92
 */
export class CoverService {
  constructor(private env: Env) {}

  /**
   * ISBNから書影画像URLを取得する
   * @returns 書影URL。見つからない場合はnull
   */
  async getCoverImageUrl(isbn: string): Promise<string | null> {
    const applicationId = this.env.RAKUTEN_APPLICATION_ID;
    if (!applicationId) {
      console.error('RAKUTEN_APPLICATION_ID is not configured');
      return null;
    }

    const params = new URLSearchParams({
      format: 'json',
      isbn,
      applicationId,
      elements: 'largeImageUrl',
    });

    const response = await fetch(`${RAKUTEN_BOOKS_API_URL}?${params}`, {
      headers: { Referer: RAKUTEN_REFERER },
    });

    // 楽天APIは検索結果0件を404で返すことがあるため、非2xxはすべて「書影なし」として扱う
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RakutenBooksSearchResponse;
    const imageUrl = data.Items?.[0]?.Item?.largeImageUrl;
    if (!imageUrl) {
      return null;
    }

    return this.resizeImageUrl(imageUrl);
  }

  /**
   * 楽天の画像URLのサイズ指定（?_ex=200x200）を差し替える
   */
  private resizeImageUrl(imageUrl: string): string {
    const url = new URL(imageUrl);
    url.searchParams.set('_ex', COVER_IMAGE_SIZE);
    return url.toString();
  }
}
