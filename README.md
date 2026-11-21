# 日常 Dayflow

個人行程與任務管理網站，使用 Firebase Authentication 的 Google 登入，並將每位使用者的資料儲存在 Firestore 的 `users/{uid}/appData/main`。Firestore 規則只允許登入者讀寫自己的資料。

## Gemini 行程小幫手

聊天功能使用 Firebase AI Logic 的 Gemini Developer API。使用者送出問題時，瀏覽器會把問題、接下來 30 天的行程及未完成任務傳給 Gemini，讓它依照個人資料回答。資料只從目前登入者的瀏覽器讀取，不會透過其他使用者的資料查詢。

首次設定 Firebase AI Logic：

1. 安裝 Node.js 20 以上版本，並在此專案根目錄使用已登入 Firebase 的 CLI。
2. 確認 CLI 目前選取 `plan2026-92db6`，再執行 `npx -y firebase-tools@latest init ailogic` 啟用 Firebase AI Logic。
3. 在 Firebase Console 的 App Check 為 Web app 註冊 reCAPTCHA Enterprise，並將 `tdwdwd.github.io` 加入允許網域。
4. 將該 Web app 的 reCAPTCHA Enterprise site key 填入 `index.html` 的 `recaptchaEnterpriseSiteKey`。
5. 將更新後的 `index.html` 發佈至 GitHub Pages。

Firebase AI Logic 會在 Firebase 端代理 Gemini API 請求，不需把 Gemini API 金鑰寫入網站或 Firebase Functions。App Check 會為網站請求附上有效的應用程式驗證。

## GitHub Pages

`index.html` 是網站入口。發佈後，請在 Firebase Authentication 的授權網域清單保留 `tdwdwd.github.io`，以允許 Google 登入。
