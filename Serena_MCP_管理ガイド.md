# Serena MCP 管理ガイド

## 📋 目次
1. [全体構成の理解](#全体構成の理解)
2. [設定ファイルの管理方法](#設定ファイルの管理方法)
3. [新規プロジェクトへのSerena MCP追加手順](#新規プロジェクトへのserena-mcp追加手順)
4. [トラブルシューティング](#トラブルシューティング)
5. [参考リンク](#参考リンク)

---

## 全体構成の理解

### アーキテクチャ概要

```
ホームディレクトリ (~/)
├── .claude.json          ← 全プロジェクトの設定を管理（グローバル設定）
└── .claude/              ← Claude Codeのデータディレクトリ
    ├── history.jsonl
    ├── session-env/
    └── ...

プロジェクトA/
├── .serena/              ← Serenaが自動生成（プロジェクト固有）
│   ├── project.yml       ← プロジェクト設定
│   ├── memories/         ← プロジェクトメモリ
│   └── cache/            ← シンボルキャッシュ
└── src/

プロジェクトB/
├── .serena/              ← プロジェクトごとに独立
│   ├── project.yml
│   ├── memories/
│   └── cache/
└── app/
```

### 設定の流れ

1. **ユーザーが設定**: `~/.claude.json`に各プロジェクトのMCP設定を追加
2. **Claude Codeが読み込み**: プロジェクトを開くと該当の設定を読み込む
3. **Serenaが起動**: `uvx`でGitHubから直接実行
4. **自動生成**: `.serena`フォルダがプロジェクトルートに作られる

---

## 設定ファイルの管理方法

### ~/.claude.jsonの役割

**すべてのプロジェクトのClaude Code設定を一元管理**

- 場所: `/Users/<ユーザー名>/.claude.json`
- 形式: JSON
- 可視化: Finderで`Cmd + Shift + .`で隠しファイル表示
- 編集: `code ~/.claude.json`（VS Code推奨）

### 設定の構造

```json
{
  "projects": {
    "/絶対/パス/プロジェクトA": {
      "mcpServers": {
        "serena": {
          "type": "stdio",
          "command": "uvx",
          "args": [
            "--from",
            "git+https://github.com/oraios/serena",
            "serena",
            "start-mcp-server",
            "--context",
            "ide-assistant",
            "--project",
            "/絶対/パス/プロジェクトA"
          ],
          "env": {}
        }
      },
      "hasTrustDialogAccepted": false
    },
    "/絶対/パス/プロジェクトB": {
      "mcpServers": {
        "serena": { ... }
      }
    }
  }
}
```

### 重要なポイント

1. **プロジェクトパスは絶対パス**で指定
2. **2箇所でパスを一致させる**:
   - オブジェクトのキー: `"/絶対/パス/プロジェクトA"`
   - `args`配列の最後: `"/絶対/パス/プロジェクトA"`
3. **パスに絵文字や特殊文字があると問題が起きる可能性**

### .serenaフォルダ（プロジェクトごと）

**Serenaが初回起動時に自動生成**

```
.serena/
├── project.yml           # プロジェクト設定（言語、無視パスなど）
├── memories/             # プロジェクト固有のメモリ
│   ├── project_overview.md
│   ├── development_commands.md
│   └── code_style_conventions.md
└── cache/                # シンボル情報キャッシュ
    └── typescript/
        └── raw_document_symbols.pkl
```

**特徴:**
- ✅ **自動生成**: 手動で作成不要
- ✅ **プロジェクト固有**: 各プロジェクトに独立して存在
- ✅ **Gitignore推奨**: キャッシュファイルは除外すべき
- ✅ **削除可能**: 削除しても次回起動時に再生成される

---

## 新規プロジェクトへのSerena MCP追加手順

### 前提条件

- ✅ Claude CodeとSerena MCPが他のプロジェクトで既に動作している
- ✅ `~/.claude.json`が存在している
- ✅ 新規プロジェクトのパスを確認済み

### 方法1: `/mcp add`コマンド（推奨）

**最も簡単で確実な方法**

#### 手順

1. **Claude Codeで新規プロジェクトを開く**

2. **コマンドを実行**:
   ```
   /mcp add serena
   ```

3. **プロンプトに従って入力**:
   - **Type**: `stdio`
   - **Command**: `uvx`
   - **Args**:
     ```
     --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project /新規プロジェクトの絶対パス
     ```
     ※ `/新規プロジェクトの絶対パス`は実際のパスに置き換えてください

4. **Claude Codeを再起動**

5. **動作確認**:
   ```
   /mcp list
   ```
   → `serena`が表示されればOK

#### プロジェクトパスの確認方法

ターミナルでプロジェクトルートに移動して：
```bash
pwd
```

出力例: `/Users/daisuke/Desktop/project/myapp`

### 方法2: 既存プロジェクトから設定をコピー（Pythonスクリプト）

**`/mcp add`が使えない場合の代替手段**

#### Pythonスクリプトで自動追加

```bash
# 1. バックアップを作成
cp ~/.claude.json ~/.claude.json.backup

# 2. 以下のスクリプトを実行
python3 << 'PYTHON'
import json

# 設定ファイルを読み込む
with open('/Users/<ユーザー名>/.claude.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

# 既存のSerena設定があるプロジェクトを探す
source_project = None
for key in config['projects'].keys():
    if 'serena' in config['projects'][key].get('mcpServers', {}):
        source_project = key
        break

if not source_project:
    print("❌ 既存のSerena設定が見つかりません")
    exit(1)

# 新しいプロジェクトのパス（ここを書き換えてください）
new_project = "/絶対/パス/新規プロジェクト"

# Serena設定をコピー
serena_config = config['projects'][source_project]['mcpServers']['serena'].copy()

# パスを更新
serena_config['args'][-1] = new_project

# 新しいプロジェクトの設定が存在しない場合は作成
if new_project not in config['projects']:
    config['projects'][new_project] = {
        "allowedTools": [],
        "mcpContextUris": [],
        "mcpServers": {},
        "enabledMcpjsonServers": [],
        "disabledMcpjsonServers": [],
        "hasTrustDialogAccepted": false
    }

# Serenaを追加
config['projects'][new_project]['mcpServers']['serena'] = serena_config

# 保存
with open('/Users/<ユーザー名>/.claude.json', 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

print("✅ 完了！Serena MCPを追加しました")
print(f"プロジェクト: {new_project}")
PYTHON

# 3. Claude Codeを再起動
```

**注意**: `<ユーザー名>`と`/絶対/パス/新規プロジェクト`を実際の値に置き換えてください。

### 方法3: VS Codeで手動編集（上級者向け）

#### 手順

1. **バックアップを作成**:
   ```bash
   cp ~/.claude.json ~/.claude.json.backup
   ```

2. **VS Codeで開く**:
   ```bash
   code ~/.claude.json
   ```

3. **既存のプロジェクト設定をコピー**:
   - 既にSerenaが設定されているプロジェクトの設定ブロック全体をコピー
   - 例: TextCastAppの設定

4. **新規プロジェクトのセクションに貼り付け**:
   - プロジェクトパスのキーを新規プロジェクトのパスに変更
   - `args`配列の最後のパスも同じパスに変更

5. **保存してClaude Code再起動**

#### 注意点
- JSONの構文エラーに注意（カンマ、括弧の対応）
- パスは2箇所を完全一致させる
- バックアップから復元できるようにしておく

---

## トラブルシューティング

### `/mcp list`でserenaが表示されない

**原因と対処法:**

1. **Claude Codeを再起動していない**
   - → Claude Codeを完全に終了して再起動

2. **パスが間違っている**
   - → `~/.claude.json`を開いて、プロジェクトパスが正しいか確認
   - → 2箇所（キーとargs）が一致しているか確認

3. **JSONの構文エラー**
   - → VS Codeでファイルを開くとエラー箇所がハイライトされる
   - → バックアップから復元: `cp ~/.claude.json.backup ~/.claude.json`

### `/mcp add`が「No MCP servers configured」と表示される

**これは情報メッセージの可能性があります。**

- プロジェクトに`mcpServers: {}`（空）の設定がある状態
- 続行すれば追加できる可能性が高い
- コマンドプロンプトに従って入力を続けてください

### .serenaフォルダが作成されない

**原因:**
- Serenaがまだ一度も起動していない

**対処法:**
- Serenaのツールを何か使ってみる
- または次回Claude Codeでプロジェクトを開いたときに自動生成される

### パスに絵文字があるとエラーになる

**問題:**
- `/Users/daisuke/Desktop/🔥プロジェクト/myapp`
- パスに絵文字があると認識に問題が起きる可能性

**対処法:**
- プロジェクトフォルダ名から絵文字を削除
- `~/.claude.json`の該当パスを更新

---

## 参考リンク

### 公式ドキュメント

- **Claude Code 公式ドキュメント**: https://docs.claude.com/en/docs/claude-code
- **Claude Code MCP ガイド**: https://docs.claude.com/en/docs/claude-code/mcp
- **Model Context Protocol (MCP)**: https://modelcontextprotocol.io/

### Serena MCP

- **Serena GitHub リポジトリ**: https://github.com/oraios/serena
- **Serena ドキュメント**: https://github.com/oraios/serena#readme

### ツール・技術

- **uvx (UV Package Manager)**: https://docs.astral.sh/uv/
- **AsyncStorage (React Native)**: https://react-native-async-storage.github.io/async-storage/

---

## 付録: チェックリスト

### 新規プロジェクト追加時

- [ ] プロジェクトの絶対パスを確認した
- [ ] `~/.claude.json`のバックアップを作成した
- [ ] `/mcp add serena`を実行した（または手動で設定追加）
- [ ] Claude Codeを再起動した
- [ ] `/mcp list`でserenaが表示されることを確認した
- [ ] Serenaのツールが使えることを確認した
- [ ] `.serena`フォルダが自動生成されたことを確認した

### トラブル時

- [ ] Claude Codeを再起動した
- [ ] `~/.claude.json`のプロジェクトパスを確認した
- [ ] パスが2箇所（キーとargs）で一致していることを確認した
- [ ] プロジェクトパスに絵文字や特殊文字がないことを確認した
- [ ] バックアップから復元できることを確認した

---

## まとめ

### 設定の全体像

```
~/.claude.json (グローバル)
  ↓ プロジェクトごとの設定を管理
  ↓
各プロジェクトで Claude Code 起動
  ↓ 該当プロジェクトの設定を読み込み
  ↓
uvx で Serena を起動 (GitHub から直接)
  ↓ 初回起動時
  ↓
.serena/ フォルダ自動生成 (プロジェクト固有)
```

### 新規追加の基本手順

1. **`/mcp add serena`を実行**（最も簡単）
2. プロンプトに従ってプロジェクトパスを入力
3. Claude Code再起動
4. 完了

失敗した場合のみ、Pythonスクリプトまたは手動編集を検討してください。

---

**作成日**: 2025-11-29
**対象バージョン**: Claude Code (2024-2025)
**Serena**: https://github.com/oraios/serena
