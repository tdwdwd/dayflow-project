const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { defineSecret } = require('firebase-functions/params');

setGlobalOptions({ region: 'asia-east1', maxInstances: 3 });

const geminiApiKey = defineSecret('GEMINI_API_KEY');

exports.askPlanningAssistant = onCall(
  { secrets: [geminiApiKey], timeoutSeconds: 45 },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '請先登入後再使用 AI 小幫手。');
    }

    const message = typeof request.data?.message === 'string'
      ? request.data.message.trim()
      : '';
    if (!message) {
      throw new HttpsError('invalid-argument', '請輸入訊息。');
    }
    if ([...message].length > 2000) {
      throw new HttpsError('invalid-argument', '訊息長度不可超過 2,000 個字元。');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'Gemini API 金鑰尚未設定。');
    }

    let response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: '你是「日常」行程管理系統的 AI 小幫手。請以繁體中文、友善且精簡地回答，協助使用者規劃行程、拆解待辦與整理想法。你只會看到使用者這次輸入的訊息，不會讀取行程資料。不要聲稱你已替使用者新增、修改或儲存任何資料。'
              }]
            },
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 600 }
          })
        }
      );
    } catch (error) {
      console.error('Gemini network request failed', error?.name || 'unknown');
      throw new HttpsError('unavailable', '目前無法連線到 Gemini。');
    }

    if (!response.ok) {
      console.error('Gemini API returned status', response.status);
      if (response.status === 429) {
        throw new HttpsError('resource-exhausted', 'Gemini 使用量已達上限，請稍後再試。');
      }
      if (response.status >= 500) {
        throw new HttpsError('unavailable', 'Gemini 暫時無法使用，請稍後再試。');
      }
      throw new HttpsError('failed-precondition', 'Gemini API 設定無效，請檢查 API 金鑰與模型設定。');
    }

    const result = await response.json();
    const text = (result.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || '')
      .join('')
      .trim();
    if (!text) {
      throw new HttpsError('unavailable', 'Gemini 沒有產生文字回覆，請換個方式提問。');
    }
    return { text };
  }
);
