# Ministagam Web API - Dev Container Setup Guide

このプロジェクトは、VS Code Dev Containersを使用して統合開発環境（IDE）を提供します。

## 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- **Docker Desktop** (4.0以上推奨)
  - [Docker Desktop インストール](https://www.docker.com/products/docker-desktop)
- **Visual Studio Code** (1.78以上推奨)
  - [VS Code インストール](https://code.visualstudio.com/)
- **Dev Containers 拡張機能**
  - VS Code Marketplace から `Remote - Containers` 拡張機能をインストール

## セットアップ手順

### 1. VS Code で開く

```bash
code .
```

### 2. Dev Container で開く

VS Code で以下のいずれかの方法を選択します：

#### 方法A: コマンドパレットを使用
1. `Ctrl+Shift+P` キーを押す
2. "Dev Containers: Reopen in Container" を検索して選択
3. Dev Container が起動するまで待機（初回は5-10分程度かかります）

#### 方法B: リモート接続アイコンを使用
1. VS Code ウィンドウの左下隅にある `><` アイコン（リモート接続ボタン）をクリック
2. "Reopen in Container" を選択

### 3. 初期セットアップ

Dev Container が起動すると、`postCreateCommand` が自動実行されます：
- Composer依存関係のインストール
- npm依存関係のインストール
- Laravel キーの生成
- データベースマイグレーション

初期化が完了するまで数分待機してください。

## 利用可能なコマンド

Dev Container 内で以下のコマンドが実行可能です：

### Composer コマンド
```bash
composer install      # 依存関係をインストール
composer update       # 依存関係を更新
composer dump-autoload # オートローダを再生成
```

### Laravel Artisan コマンド
```bash
php artisan serve     # アプリケーションサーバを起動
php artisan migrate   # マイグレーションを実行
php artisan tinker    # REPL シェルを開く
php artisan make:model ModelName # モデルを作成
```

### npm コマンド
```bash
npm run dev           # 開発サーバを起動（Vite）
npm run build         # プロダクションビルド
```

### PHPUnit テスト
```bash
./vendor/bin/phpunit  # テストスイートを実行
```

## ポート フォワーディング

Dev Container は以下のポートをホスト マシンに公開しています：

| ポート | サービス | URL |
|--------|---------|-----|
| 80 | Laravel App | http://localhost |
| 3306 | MySQL | localhost:3306 |
| 9003 | Xdebug | - |

## デバッグ設定

### Xdebug の有効化

1. Dev Container 内で環境変数を確認：
   ```bash
   echo $XDEBUG_MODE
   ```

2. `.devcontainer/docker-compose.yml` で `XDEBUG_MODE` を `debug` に設定（デフォルト）

3. VS Code で以下の設定を確認：
   - `settings.json` で Xdebug 設定が有効か確認

### ブレークポイントの設定

1. PHP ファイルを開く
2. コード行の左側をクリックしてブレークポイントを設定
3. Laravel アプリケーションにアクセスしてブレークポイントで停止確認

## よくある問題と解決方法

### Q: Dev Container の起動が遅い
**A:** 初回起動時は Docker イメージのビルドが必要なため、5-10分程度かかります。その後の起動は高速化されます。

### Q: "Docker Daemon is not running" エラー
**A:** Docker Desktop を起動してください。

### Q: データベースに接続できない
**A:** 以下を確認：
- MySQL が起動しているか確認：`docker ps`
- DB_HOST が `mysql`（コンテナ名）に設定されているか確認
- 環境変数が正しく設定されているか確認

### Q: ターミナルでコマンドが実行できない
**A:** Dev Container 内の統合ターミナルを使用してください。VS Code のターミナルパネル（`Ctrl+`'`）で確認してください。

## ボリュームについて

Dev Container は以下のボリュームを使用しています：

- `app-vendor`: Composer `vendor` ディレクトリ
- `app-node-modules`: npm `node_modules` ディレクトリ
- `mysql-data`: MySQL データベース ファイル

これらはホスト マシンの開発環境の効率を向上させるため、自動的に管理されます。

## 環境の停止と再起動

### Dev Container を停止する
1. VS Code コマンドパレット（`Ctrl+Shift+P`）
2. "Dev Containers: Rebuild Container" で再構築
3. または "Dev Containers: Close Remote Connection" で切断

### 完全にリセットする
```bash
docker-compose down -v
```

## カスタマイズ

Dev Container の設定をカスタマイズする場合：

1. `.devcontainer/devcontainer.json` を編集
2. VS Code コマンドパレットで "Dev Containers: Rebuild Container" を実行

## 詳細なドキュメント

- [Microsoft Dev Containers Documentation](https://containers.dev/)
- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)
- [Laravel Documentation](https://laravel.com/docs)
- [Docker Documentation](https://docs.docker.com/)

## 注釈

このセットアップは、本番環境での使用は想定していません。開発環境専用です。
