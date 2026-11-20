# 日常 Dayflow

Firebase Authentication 使用 Google 登入，Firestore 將每位使用者的行程、任務與習慣存入自己的 `users/{uid}/appData/main` 文件。Firestore 規則只允許登入者讀寫自己的文件。

## Gemini AI 小幫手

前端只呼叫 Firebase Callable Function `askPlanningAssistant`。Cloud Function 會驗證 Firebase 登入狀態，再把使用者這次輸入的訊息送至 Google Gemini。API 金鑰使用 Firebase Functions Secret，不放進 `index.html`。目前不會把 Firestore 中的行程或任務資料傳給 Gemini。

部署前需要：

1. 安裝 Node.js 20 與 Firebase CLI，並登入有 `plan2026-92db6` 專案權限的 Google 帳號。
2. 取得 Gemini API 金鑰，於 Firebase 專案設定 Secret：`firebase functions:secrets:set GEMINI_API_KEY`。
3. Firebase Functions 部署需要 Firebase Blaze 計費方案；檢查預算與計費設定後再部署：`firebase deploy --only functions`。
4. 使用 `http://localhost` 或正式網站網域開啟前端。`file://` 本機檔案網址無法用於 Google OAuth。

## GitHub Pages

`index.html` 可作為 GitHub Pages 靜態網站入口。發布前需先建立或選擇 GitHub repository，將網站的 GitHub Pages 網域加入 Firebase Authentication 授權網域，再在 GitHub repository 設定 Pages。不要把 Gemini API 金鑰提交到 GitHub。
