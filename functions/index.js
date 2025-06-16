import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";

// Firebase Admin 초기화
initializeApp();

// Google Translate 클라이언트 초기화
const translate = new Translate();

// 🚀 구글 번역 API 전용 주소 번역 함수 (CORS 설정 포함)
export const translateAddress = onRequest(async (req, res) => {
  try {
    console.log("구글 번역 API 주소 번역 시작");
    
    // CORS 설정 (localhost 포함)
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "POST 메서드만 지원됩니다"
      });
    }

    // 요청 데이터 추출
    const { originalAddress, text, sourceLang = 'ja', targetLang = 'en' } = req.body;
    
    // originalAddress 또는 text 둘 중 하나 사용
    const textToTranslate = originalAddress || text;

    if (!textToTranslate) {
      return res.status(400).json({
        success: false,
        error: "MISSING_TEXT",
        message: "번역할 텍스트 (originalAddress 또는 text)가 제공되지 않았습니다"
      });
    }

    console.log(`구글 번역 요청: "${textToTranslate}" (${sourceLang} → ${targetLang})`);
    
    // Google Translate API로 번역 수행
    const [translatedText] = await translate.translate(textToTranslate, {
      from: sourceLang,
      to: targetLang
    });

    console.log(`구글 번역 완료: "${translatedText}"`);

    // 번역 후 추가 정리 (일본 주소 특화)
    let cleanedAddress = translatedText;
    
    // 일본 국가명 추가 (영어 번역시)
    if (targetLang === 'en' && !cleanedAddress.includes('Japan')) {
      cleanedAddress += ', Japan';
    }

    // 성공 응답
    res.status(200).json({
      success: true,
      originalAddress: textToTranslate,
      translatedAddress: cleanedAddress,
      translatedText: cleanedAddress, // 호환성을 위해 두 가지 필드 제공
      sourceLang: sourceLang,
      targetLang: targetLang,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("구글 번역 주소 번역 오류:", error);
    
    res.status(500).json({
      success: false,
      error: "TRANSLATION_ERROR",
      message: error.message || "구글 번역 중 오류가 발생했습니다",
      originalAddress: req.body.originalAddress || req.body.text,
      timestamp: new Date().toISOString()
    });
  }
});

// Health Check Function
export const healthCheck = onRequest((req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Firebase Functions with Google Translate API 정상 작동",
    timestamp: new Date().toISOString(),
    functions: [
      "translateAddress - 구글 번역 API 주소 번역",
      "healthCheck - 상태 확인"
    ]
  });
});
