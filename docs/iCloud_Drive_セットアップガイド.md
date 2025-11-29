# iCloud Drive連携機能 セットアップガイド

## 📋 目次
1. [概要](#概要)
2. [実装方針](#実装方針)
3. [ユーザー側で必要な作業（順序）](#ユーザー側で必要な作業順序)
4. [テスト方法](#テスト方法)
5. [トラブルシューティング](#トラブルシューティング)

---

## 概要

TextCastAppにiCloud Drive連携機能を実装しました。

### 特徴

- ✅ **すべてのデータをiCloud Driveに統一**（UserSettings + TextItem）
- ✅ **プレミアム会員限定**機能
- ✅ **デフォルトで有効**（設定画面でトグル切り替え可能）
- ✅ **データ更新時に自動同期**（バックグラウンド処理）
- ✅ **複数デバイス間で同期**

### データ保存先

```
iCloud Drive/
  Documents/
    TextCast/
      ├── settings.json       // UserSettings（~5KB）
      ├── items.json          // 全TextItem（数MB〜数十MB）
      └── sync_metadata.json  // 同期メタデータ
```

---

## 実装方針

### iCloud Drive統一方式

| データ | 保存先 | 容量 |
|--------|--------|------|
| UserSettings | iCloud Drive | ~5KB |
| 全TextItem | iCloud Drive | 数MB〜 |

**メリット**:
- 実装がシンプル（1つのAPIのみ）
- ユーザーのiCloud容量次第（5GB〜2TB）
- すべてのデータを一元管理

**自動同期タイミング**:
- アイテム追加・更新・削除時
- 設定変更時
- アプリ起動時（初回ダウンロード）
- 定期同期（10分ごと）

---

## ユーザー側で必要な作業（順序）

### ステップ1: Xcodeでプロジェクトを開く

```bash
cd ios
open TextCast.xcworkspace
```

⚠️ **注意**: `.xcodeproj`ではなく`.xcworkspace`を開いてください（CocoaPodsを使用しているため）

---

### ステップ2: Swiftファイルをプロジェクトに追加

1. **Xcodeの左側ナビゲーター**で`TextCast`グループを探す
2. **右クリック** → **"Add Files to 'TextCast'..."**を選択
3. 以下の2つのファイルを選択：
   - `ios/iCloudDriveStorage.swift`
   - `ios/iCloudDriveStorage.m`
4. **オプション設定**：
   - ✅ "Copy items if needed" にチェック
   - ✅ "Create groups" を選択
   - ✅ "Add to targets: TextCast" にチェック
5. **"Add"**ボタンをクリック

### Bridging Headerの作成確認

初めてSwiftファイルを追加する場合、以下のダイアログが表示されます：

```
Would you like to configure an Objective-C bridging header?
```

→ **"Create Bridging Header"**をクリック

すると`TextCast-Bridging-Header.h`というファイルが自動生成されます。

---

### ステップ3: iCloud Capabilityを有効化

1. **Xcodeの左側ナビゲーター**で、一番上のプロジェクトファイル`TextCast.xcodeproj`をクリック
2. **TARGETS**セクションで**"TextCast"**を選択
3. 上部タブで**"Signing & Capabilities"**をクリック
4. **"+ Capability"**ボタン（左上）をクリック
5. 検索ボックスに`iCloud`と入力
6. **"iCloud"**をダブルクリックして追加

### iCloud設定の詳細

追加されたiCloudセクションで以下を設定：

1. **Services**:
   - ❌ **CloudKit**のチェックを**外す**（使用しない）
   - ✅ **iCloud Drive/Documents**にチェック（ここが重要！）

2. **Containers**:
   - 自動的に`iCloud.$(CFBundleIdentifier)`が追加されます
   - 例: `iCloud.com.yourcompany.TextCast`

---

### ステップ4: Entitlementsファイルの確認

`ios/TextCast/TextCast.entitlements`ファイルが自動生成されているはずです。

以下の内容が含まれていることを確認：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.icloud-container-identifiers</key>
    <array>
        <string>iCloud.$(CFBundleIdentifier)</string>
    </array>
    <key>com.apple.developer.icloud-services</key>
    <array>
        <string>CloudDocuments</string>
    </array>
    <key>com.apple.developer.ubiquity-container-identifiers</key>
    <array>
        <string>iCloud.$(CFBundleIdentifier)</string>
    </array>
</dict>
</plist>
```

⚠️ **もし`CloudKit`が含まれていたら削除してください**（今回は使用しません）

---

### ステップ5: ビルドしてエラーチェック

1. **Product** → **Clean Build Folder**（Shift + Cmd + K）
2. **Product** → **Build**（Cmd + B）

エラーがないことを確認してください。

---

### ステップ6: 実機でテスト

⚠️ **重要**: iCloud Driveは**実機でのみ動作**します（シミュレータでは動作しません）

#### 実機接続の方法

**1. ケーブルで物理的に接続**

- **Lightning ケーブル** (iPhone 14以前) または **USB-Cケーブル** (iPhone 15以降)でMacと接続
- 初回接続時、iPhone に「このコンピュータを信頼しますか？」と表示される
- **「信頼」**をタップし、パスコードを入力

**2. Xcodeでデバイスを選択**

```
Xcodeウィンドウ上部中央:
[TextCast] > [デバイス選択ドロップダウン] > [あなたのiPhone名（例: "Daisuke's iPhone"）]
```

- シミュレータではなく、実機デバイス名を選択
- 接続が認識されない場合: **Window** → **Devices and Simulators** で確認

**3. ビルド＆実行**

- **Product** → **Run**（Cmd + R）
- 初回は署名処理で数分かかる場合あり

#### iCloud設定の確認（iPhone側）

1. **設定アプリ** → **[あなたの名前]**
2. **iCloud**が有効になっているか確認
3. **iCloud Drive**がオンになっているか確認

---

### ステップ7: アプリでの動作確認

1. アプリを起動
2. コンソールログを確認：
   ```
   [iCloud] ✅ Container URL: /var/mobile/...
   [iCloud] ✅ Sync initialized (enabled: true)
   [iCloud] Starting upload to iCloud...
   [iCloud] ✅ Upload completed
   ```

3. 何か記事を追加してみる
4. ログで同期が実行されることを確認：
   ```
   [StorageService] Item added: xxx-xxx-xxx
   [iCloud] Starting upload to iCloud...
   [iCloud] ✅ Saved file: items.json
   [iCloud] ✅ Saved file: settings.json
   ```

---

### ステップ8: 設定画面でiCloudトグルを追加（オプション）

現在、iCloud同期は**デフォルトで有効**になっています。

ユーザーがオン/オフを切り替えられるようにするには、設定画面にトグルを追加します：

```tsx
// src/screens/SettingsScreen.tsx に追加

import { iCloudSyncService } from '../services/iCloudSyncService';

const [iCloudEnabled, setICloudEnabled] = useState(false);

useEffect(() => {
  const loadStatus = async () => {
    const status = iCloudSyncService.getStatus();
    setICloudEnabled(status.enabled);
  };
  loadStatus();
}, []);

const handleiCloudToggle = async (enabled: boolean) => {
  if (enabled) {
    await iCloudSyncService.enable();
  } else {
    await iCloudSyncService.disable();
  }
  setICloudEnabled(enabled);
};

// UI
<Switch
  value={iCloudEnabled}
  onValueChange={handleiCloudToggle}
  disabled={!isPremium} // プレミアム会員のみ
/>
```

---

## テスト方法

### 単一デバイスでのテスト

1. アプリで記事を追加
2. **iCloud Drive**にファイルが保存されているか確認

#### Macから確認する方法

```bash
# iCloud Driveフォルダを開く
open ~/Library/Mobile\ Documents/
```

または：

```bash
# Finder → 移動 → ライブラリ → Mobile Documents
```

`com~apple~CloudDocs`または似たフォルダ内に`TextCast`フォルダがあるはずです。

---

### 複数デバイス間での同期テスト

1. **デバイス1**で記事を追加
2. **デバイス2**でアプリを起動
3. 自動的にデバイス1のデータがダウンロードされることを確認

⚠️ **注意**: 同期には数秒〜数分かかることがあります（iCloudの仕様）

---

### Xcode直接テスト vs TestFlight

#### 開発中（今）は Xcode 直接接続を推奨

| 項目 | Xcode直接接続 | TestFlight |
|------|--------------|------------|
| **デプロイ方法** | USB接続して即座に実行 | EAS Build → App Store Connect |
| **実行速度** | コード変更後すぐ（1分以内） | ビルド処理待ち（10〜30分） |
| **デバッグ** | ✅ Xcodeコンソールでリアルタイムログ確認 | ❌ ログ取得が困難 |
| **iCloud動作** | ✅ 完全動作 | ✅ 完全動作 |
| **適した用途** | **開発中の機能テスト・デバッグ** | 複数ユーザーでのベータテスト |

#### Xcode直接接続の利点（iCloud開発時）

```
コード変更
  ↓ Cmd + B (ビルド)
  ↓ Cmd + R (実行)
  ↓ 1分以内
iPhoneで動作確認
  ↓
Xcodeコンソールでリアルタイムログ確認:
[iCloud] ✅ Container URL: /var/mobile/...
[iCloud] ✅ Saved file: items.json
[iCloud] Starting upload to iCloud...
  ↓
問題があれば即座に修正して再実行
```

#### TestFlight の用途

- iCloud機能が完成した後のベータテスト
- 複数ユーザー・複数デバイスでの総合テスト
- 本番環境に近い状態での動作確認

**推奨開発フロー:**
1. **今**: Xcode直接接続でiCloud機能を完成させる
2. **完成後**: TestFlightで広範囲テスト

---

## トラブルシューティング

### ❌ `[iCloud] ❌ iCloud container not available`

**原因**:
- iCloud Capabilityが有効になっていない
- Entitlementsファイルの設定が間違っている
- デバイスがiCloudにサインインしていない

**解決**:
1. Xcodeで`Signing & Capabilities`を再確認
2. `TextCast.entitlements`を確認
3. デバイスの設定でiCloudを有効化

---

### ❌ ビルドエラー: `Bridging header not found`

**原因**:
- Bridging Headerが正しく作成されていない

**解決**:
1. Xcodeで **Build Settings**を開く
2. `Objective-C Bridging Header`を検索
3. パスを確認: `TextCast/TextCast-Bridging-Header.h`

---

### ❌ 同期が実行されない

**確認事項**:
1. プレミアム会員かどうか
   ```typescript
   const { isPremium } = usePurchaseStore.getState();
   console.log('Premium:', isPremium);
   ```

2. iCloud同期が有効か
   ```typescript
   const status = iCloudSyncService.getStatus();
   console.log('iCloud enabled:', status.enabled);
   ```

3. 実機で実行しているか（シミュレータでは動作しません）

---

### ❌ ファイルが見つからない

**原因**:
- iCloudの同期が完了していない

**解決**:
- 時間を置いて再試行
- 手動で同期を実行：
  ```typescript
  await iCloudSyncService.sync();
  ```

---

## 📊 データサイズの見積もり

### ユーザーあたりのデータ量

| シナリオ | 記事数 | 平均文字数 | 合計サイズ |
|---------|--------|-----------|-----------|
| ライトユーザー | 50件 | 3,000文字 | **1 MB** |
| 通常ユーザー | 200件 | 5,000文字 | **5 MB** |
| ヘビーユーザー | 1,000件 | 10,000文字 | **50 MB** |

**結論**: ユーザーのiCloud容量（5GB〜）なら十分に余裕があります。

---

## ✅ チェックリスト

### Xcode設定

- [ ] `iCloudDriveStorage.swift`を追加
- [ ] `iCloudDriveStorage.m`を追加
- [ ] Bridging Headerが作成された
- [ ] iCloud Capabilityを有効化
- [ ] "iCloud Drive/Documents"にチェック
- [ ] "CloudKit"のチェックを外した
- [ ] `TextCast.entitlements`を確認
- [ ] ビルドが成功

### 実機テスト

- [ ] iPhoneでiCloudにサインイン
- [ ] アプリをビルド＆実行
- [ ] コンソールで同期ログを確認
- [ ] 記事を追加して同期を確認
- [ ] iCloud Driveにファイルが保存されたか確認

### 複数デバイステスト（オプション）

- [ ] デバイス1で記事を追加
- [ ] デバイス2でアプリを起動
- [ ] データが同期されることを確認

---

## 📚 参考リンク

- [Apple - FileManager iCloud](https://developer.apple.com/documentation/foundation/filemanager/ubiquitous_storage)
- [Apple - iCloud Design Guide](https://developer.apple.com/library/archive/documentation/General/Conceptual/iCloudDesignGuide/Chapters/Introduction.html)
- [React Native - Native Modules (iOS)](https://reactnative.dev/docs/native-modules-ios)

---

## 🎉 完成！

これでiCloud Drive連携機能の実装とセットアップが完了しました。

何か問題があれば、上記のトラブルシューティングセクションを参照してください。
