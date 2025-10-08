// src/data/mockData.ts
import { TextItem } from '../types';

export const mockTextItems: TextItem[] = [
  {
    id: 'mock-1',
    title: 'TypeScript入門ガイド',
    content: `TypeScriptは、JavaScriptに型システムを追加した言語です。静的型付けにより、開発時にエラーを発見しやすくなります。

主な特徴として、型安全性の向上、コード補完の充実、リファクタリングの安全性があります。

TypeScriptは大規模なアプリケーション開発において、保守性と開発効率を大幅に向上させることができます。現代のWebアプリケーション開発において、TypeScriptは必須のスキルとなっています。

型定義ファイルを使用することで、既存のJavaScriptライブラリも型安全に使用できます。これにより、既存のエコシステムを活用しながら、型の恩恵を受けることができます。`,
    source: 'manual',
    category: 'プログラミング',
    tags: ['TypeScript', '開発', 'JavaScript'],
    importance: 2,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    duration: 45,
    lastPosition: 0,
    playCount: 0,
    isCompleted: false,
    bookmarks: [],
    notes: [],
    isFavorite: false,
  },
  {
    id: 'mock-2',
    title: 'React Nativeアプリ開発のベストプラクティス',
    content: `React Nativeは、一つのコードベースでiOSとAndroidの両方のアプリを開発できるフレームワークです。

パフォーマンスの最適化には、FlatListの適切な使用、画像の最適化、不要な再レンダリングの防止が重要です。

状態管理には、小規模なアプリではContext API、大規模なアプリではZustandやRedux Toolkitを使用することを推奨します。

ナビゲーションはReact Navigationを使用し、型安全なルーティングを実装することで、開発効率と保守性を向上させることができます。

デバッグには、Flipper、React DevTools、ネイティブデバッガーを適切に使い分けることが重要です。これらのツールを効果的に活用することで、開発時間を大幅に短縮できます。`,
    source: 'url',
    sourceUrl: 'https://example.com/react-native-best-practices',
    category: 'モバイル開発',
    tags: ['React Native', 'モバイル', 'アプリ開発'],
    importance: 3,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    duration: 60,
    lastPosition: 0,
    playCount: 0,
    isCompleted: false,
    bookmarks: [],
    notes: [],
    isFavorite: true,
  },
  {
    id: 'mock-3',
    title: 'UIデザインの基本原則',
    content: `優れたUIデザインには、一貫性、シンプルさ、使いやすさが重要です。

カラーパレットは、ブランドのアイデンティティを反映し、ユーザーの感情に訴えかける重要な要素です。適切なコントラスト比を保つことで、アクセシビリティも向上します。

タイポグラフィは情報の階層を明確にし、読みやすさを向上させます。フォントサイズ、行間、文字間を適切に調整することが重要です。

レイアウトにおいては、グリッドシステムを使用することで、整然とした美しいデザインを実現できます。余白を効果的に活用することで、コンテンツに呼吸感を与え、視覚的な疲労を軽減できます。`,
    source: 'file',
    fileName: 'ui-design-principles.pdf',
    fileType: 'pdf',
    category: 'デザイン',
    tags: ['UI', 'デザイン', 'UX'],
    importance: 2,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    duration: 35,
    lastPosition: 0,
    playCount: 0,
    isCompleted: false,
    bookmarks: [],
    notes: [],
    isFavorite: false,
  },
  {
    id: 'mock-4',
    title: 'AIと機械学習の現在と未来',
    content: `人工知能と機械学習は、現代社会のあらゆる分野で革新をもたらしています。

自然言語処理の分野では、大規模言語モデルが人間レベルの理解と生成能力を示しています。これにより、翻訳、要約、対話システムなどの精度が大幅に向上しました。

コンピュータビジョンでは、画像認識、物体検出、セグメンテーションの技術が実用レベルに達し、自動運転、医療診断、製造業の品質管理などに活用されています。

倫理的なAI開発も重要な課題となっており、バイアスの除去、プライバシーの保護、透明性の確保などが求められています。

今後は、より効率的なアルゴリズム、少ないデータでの学習、人間とAIの協調など、新たな研究領域が注目されています。`,
    source: 'camera',
    category: 'テクノロジー',
    tags: ['AI', '機械学習', '未来技術'],
    importance: 3,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    duration: 75,
    lastPosition: 150,
    playCount: 2,
    isCompleted: false,
    bookmarks: [
      {
        id: 'bookmark-1',
        position: 150,
        title: '大規模言語モデルについて',
        note: '重要なポイント',
        createdAt: new Date('2024-01-18'),
      }
    ],
    notes: [],
    isFavorite: true,
  },
  {
    id: 'mock-5',
    title: '効果的な時間管理術',
    content: `時間管理は、個人の生産性と生活の質を向上させる重要なスキルです。

ポモドーロ・テクニックは、25分の集中作業と5分の休憩を繰り返す手法で、集中力の維持と疲労の軽減に効果的です。

優先順位の設定には、アイゼンハワー・マトリックスが有用です。緊急度と重要度の2軸で課題を分類し、効率的にタスクを処理できます。

デジタルツールを活用することで、スケジュール管理、タスク管理、時間追跡を自動化できます。しかし、ツールに依存しすぎず、シンプルなシステムを維持することが重要です。

定期的な振り返りを行い、時間の使い方を分析することで、継続的な改善が可能になります。`,
    source: 'manual',
    category: '自己啓発',
    tags: ['時間管理', '生産性', 'ライフハック'],
    importance: 1,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    duration: 30,
    lastPosition: 0,
    playCount: 1,
    isCompleted: true,
    bookmarks: [],
    notes: [],
    isFavorite: false,
  }
];

// プレイリスト用のモックデータ
export const mockPlaylists = [
  {
    id: 'playlist-1',
    name: '学習用',
    items: ['mock-1', 'mock-2', 'mock-3'],
  },
  {
    id: 'playlist-2',
    name: 'お気に入り',
    items: ['mock-2', 'mock-4'],
  },
  {
    id: 'playlist-3',
    name: '完了済み',
    items: ['mock-5'],
  },
];