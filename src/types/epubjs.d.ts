// src/types/epubjs.d.ts
// epubjs の最小限の型定義

declare module 'epubjs' {
  export interface Book {
    loaded: {
      metadata: Promise<Metadata>;
      spine: Promise<Spine>;
    };
    rendition?: any;
    destroy(): void;
  }

  export interface Metadata {
    title?: string;
    creator?: string;
    description?: string;
    pubdate?: string;
    publisher?: string;
    language?: string;
  }

  export interface Spine {
    spineItems: SpineItem[];
  }

  export interface SpineItem {
    href: string;
    index: number;
    load(loader: any): Promise<Section>;
  }

  export interface Section {
    bodyElement?: HTMLElement;
    output(format: string): Promise<string>;
  }

  export default function ePub(url: string | ArrayBuffer, options?: any): Book;
}
