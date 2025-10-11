# プレイヤーUI代替案

## 1. 波形ビュー（Waveform Display）

### 特徴
- 音声の強弱を視覚的に表現
- 盛り上がり箇所が一目でわかる
- **ポッドキャストアプリで最もポピュラー**

### メリット
- ✅ 視覚的にリッチ
- ✅ 「どこが重要か」が直感的にわかる
- ✅ タップ/ドラッグでシーク可能
- ✅ 現在位置が明確
- ✅ プロフェッショナルな印象

### デメリット
- ❌ 実装がやや複雑
- ❌ TTSでは波形データが事前に存在しない（生成が必要）
- ❌ レンダリングコストが高い

### 使用例
- **Spotify Podcasts**
- **Apple Podcasts**
- **Overcast**
- **Pocket Casts**

### 実装方法（TTS版）
```typescript
// テキストの「重要度」を解析して疑似波形を生成
const generatePseudoWaveform = (text: string): number[] => {
  const sentences = text.split(/[。！？]/);
  return sentences.map(sentence => {
    // 文の長さ、感嘆符の有無などで振幅を決定
    let amplitude = 0.3; // ベース
    if (sentence.includes('！')) amplitude += 0.3;
    if (sentence.includes('？')) amplitude += 0.2;
    if (sentence.length > 50) amplitude += 0.1;
    return Math.min(1.0, amplitude);
  });
};
```

---

## 2. **チャプターマーカー付きバー** ⭐️⭐️⭐️⭐️

### 特徴
- プログレスバー + 区切りマーカー
- セクション/段落ごとに分割表示
- タップで該当チャプターにジャンプ

### メリット
- ✅ 実装が比較的簡単
- ✅ 長文コンテンツに最適
- ✅ 「どこまで聞いたか」が明確
- ✅ TTSと相性が良い（段落ベースで分割可能）

### デメリット
- ❌ チャプター分割のロジックが必要
- ❌ 短い記事では効果が薄い

### 使用例
- **YouTube**（チャプター機能）
- **Audible**（チャプター付き書籍）

### 実装例
```typescript
interface Chapter {
  title: string;
  startPosition: number; // 秒
  endPosition: number;
}

const generateChapters = (text: string): Chapter[] => {
  const paragraphs = text.split('\n\n');
  let currentPosition = 0;

  return paragraphs.map((para, index) => {
    const duration = estimatePlaybackDuration(para);
    const chapter = {
      title: para.substring(0, 30) + '...',
      startPosition: currentPosition,
      endPosition: currentPosition + duration,
    };
    currentPosition += duration;
    return chapter;
  });
};
```

---

## 3. **円形プログレスリング** ⭐️⭐️⭐️

### 特徴
- Apple Watchスタイルの円形UI
- 中央に再生/一時停止ボタン
- リングで進捗を表現

### メリット
- ✅ コンパクト
- ✅ 美しい・モダン
- ✅ ミニマリストデザイン
- ✅ 実装が比較的簡単（react-native-svg）

### デメリット
- ❌ シークしづらい
- ❌ 正確な位置がわかりにくい
- ❌ 長時間コンテンツには不向き

### 使用例
- **Apple Music** (ミニプレイヤー)
- **Instagram Stories**
- **Headspace** (瞑想アプリ)

---

## 4. **テキストハイライト連動型** ⭐️⭐️⭐️⭐️⭐️ (TextCastに最適！)

### 特徴
- **プログレスバーなし**
- 読み上げ中のテキストをリアルタイムハイライト
- テキストをタップで該当位置にジャンプ

### メリット
- ✅ **テキストアプリに最も適している**
- ✅ 「今どこを読んでいるか」が一目瞭然
- ✅ シークが直感的（テキストをタップするだけ）
- ✅ 読書体験の延長線上
- ✅ TTSと完璧に相性が良い

### デメリット
- ❌ 全文表示が必要
- ❌ 長文だとスクロールが大変

### 使用例
- **Kindle** (読み上げ機能)
- **Moon+ Reader**
- **Voice Dream Reader**

### 実装例
```typescript
// 現在読み上げ中の文字位置を計算
const currentCharIndex = Math.floor(currentPosition * 8); // 8文字/秒

// テキストを分割してハイライト
<Text>
  <Text style={styles.normalText}>
    {text.substring(0, currentCharIndex)}
  </Text>
  <Text style={styles.highlightText}>
    {text.substring(currentCharIndex, currentCharIndex + 20)}
  </Text>
  <Text style={styles.normalText}>
    {text.substring(currentCharIndex + 20)}
  </Text>
</Text>
```

---

## 5. **タイムライン + ブックマーク** ⭐️⭐️⭐️⭐️

### 特徴
- 横スクロール可能なタイムライン
- ブックマーク/メモがタイムライン上に表示
- 重要箇所に旗マーク

### メリット
- ✅ ブックマーク機能と自然に統合
- ✅ 「後で聞き直したい箇所」が一目瞭然
- ✅ 学習コンテンツに最適

### デメリット
- ❌ 実装が複雑
- ❌ 画面専有面積が大きい

### 使用例
- **Notion Audio Notes**
- **Otter.ai** (文字起こし + タイムライン)

---

## 6. **スクラブバー（Apple Music風）** ⭐️⭐️⭐️

### 特徴
- 細長いバー
- ドラッグで高速スクラブ
- 指を離すまでプレビュー

### メリット
- ✅ 正確なシークが可能
- ✅ Apple的な洗練されたUX
- ✅ ミュージックアプリと統一感

### デメリット
- ❌ TTSでは「プレビュー」が実装困難
- ❌ 音声ファイル方式でないと真価を発揮できない

---

## 📊 TextCastアプリへの推奨

### 最優先候補: **テキストハイライト連動型 + ミニプログレスバー**

#### 理由
1. **アプリのコンセプトに最適**
   - 「テキストを聞く」アプリなので、テキスト自体が主役
   - プログレスバーは補助的な役割

2. **実装の容易さ**
   - 文字位置ベースなので現在の実装と相性が良い
   - 波形生成など不要

3. **UXの自然さ**
   - 読書 + 読み上げの体験が統一される
   - 「どこを読んでいるか」がテキストで明確

4. **段階的実装が可能**
   - Phase 1: ミニプログレスバー（現状維持）
   - Phase 2: 全文表示 + ハイライト
   - Phase 3: スクロール連動

---

## 🎯 推奨実装案

### デザイン構成

```
┌─────────────────────────────────────┐
│  📄 TextCast - タイトル             │
├─────────────────────────────────────┤
│                                     │
│  TypeScriptは、JavaScriptに        │
│  型システムを追加したプログラミング │
│  言語です。【マイクロソフトが開発】 │  ← 現在読み上げ中（ハイライト）
│  し、2012年に公開されました。      │
│                                     │
│  TypeScriptの最大の特徴は...       │
│                                     │
├─────────────────────────────────────┤
│  ▶  [========●─────]  3:24 / 8:15  │  ← ミニプレイヤー（常時表示）
│      ⏪  ⏸  ⏩   1.0x               │
└─────────────────────────────────────┘
```

### UI実装優先順位

**Phase 1（現在）**: ミニプログレスバー（実装済み）
- ✅ プログレスバー
- ✅ 再生/一時停止
- ✅ スキップボタン
- ✅ 速度変更

**Phase 2**: テキストハイライト
- [ ] 全文表示画面
- [ ] リアルタイムハイライト
- [ ] タップでシーク
- [ ] 自動スクロール

**Phase 3**: 高度な機能
- [ ] ブックマークマーカー（タイムライン上）
- [ ] 段落/チャプター区切り
- [ ] 波形表示（オプション）

---

## 💡 他の人気アプリのUI分析

| アプリ名 | 主なUI | 特徴 |
|---------|--------|------|
| Spotify Podcasts | 波形 + プログレスバー | 視覚的に豪華 |
| Apple Podcasts | シンプルなバー | ミニマル |
| Audible | チャプター付きバー | 書籍に最適 |
| Overcast | 波形 + スマートスピード | 高機能 |
| Pocket Casts | 円形プログレス | モダン |
| **Voice Dream Reader** | **テキストハイライト** | **テキストアプリに最適** ⭐️ |

---

## 🚀 次のステップ提案

1. **現状のプログレスバーを改善**
   - より視認性を高める
   - チャプターマーカーを追加

2. **テキストハイライト機能を追加**
   - 別画面で全文 + ハイライト表示
   - スワイプでミニプレイヤー ⇄ 全文表示を切り替え

3. **将来的に波形表示を追加**（プレミアム機能）
   - クラウドTTS移行後に実装

どの方向性で進めますか？
