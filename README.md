# Accounting 記帳小工具

使用 TypeScript、React、React Hooks、Next.js App Router 與 Firebase 製作的記帳練習專案。

## 功能

- `/`：首頁與前往記帳頁面的入口
- `/accounting`：新增收入或支出、刪除記錄、自動計算小計
- Firebase Authentication：使用匿名登入建立個人資料範圍
- Cloud Firestore：儲存每一筆記帳記錄
- Realtime Database：同步筆數、餘額與更新時間摘要
- 未設定 Firebase 時使用 localStorage 示範模式

## 技術

- Node.js、npm
- TypeScript
- React、React Hooks
- Next.js App Router
- Firebase Web SDK、Firebase CLI

## 本機啟動

```bash
npm install
cp .env.example .env.local
npm run dev
```

開啟 http://localhost:3000 。

## Firebase 設定

1. 在 Firebase Console 建立專案並註冊 Web App。
2. 啟用 Authentication 的 Anonymous 登入方式。
3. 建立 Cloud Firestore 資料庫。
4. 建立 Realtime Database。
5. 把 Firebase Web App 設定填入 `.env.local`。
6. 登入 Firebase CLI 後部署安全規則：

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules,database
```

同一組 `NEXT_PUBLIC_FIREBASE_*` 環境變數也需要設定在 Vercel。

## 專案結構

```text
src/app/                 Next.js 路由與頁面
src/components/          React 表單、清單與主畫面元件
src/hooks/               React Hooks 與狀態管理
src/lib/                 Firebase 初始化與資料存取
src/types/               TypeScript 型別
firestore.rules          Firestore 安全規則
database.rules.json      Realtime Database 安全規則
```
