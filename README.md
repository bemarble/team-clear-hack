# FCMWebPush
FCMを利用したWebPushをnodejsを用いて実装したサンプルプロジェクトです。

## 動作環境

| 対象          | Version  |
| :-----------: |:-------------:|
| OS            | macOS Sierra ver 10.12.3 |
| Node.js       | 7.6.0 |
| Google Chrome | 58.0.3029.81 |

## ローカル環境構築

* レポジトリの取得
   
   ```
   git clone https://github.com/megadreams14/FCMWebPush.git
   ```

* Node.jsのバージョン指定
   ```
   nvm use v7.6.0
   ```
   * nvmをインストールされていない方は下記記事を参考
      * [Macにnvm + Node.jsをインストールする](http://qiita.com/dribble13/items/e895208727c85ef9bc52)
         
* ライブラリのインストール
   ```
   npm install
   ```

* サーバの起動
   ```
   node server.js
   ```

* ブラウザでアクセス

   http://localhost:3000/send/webpush
