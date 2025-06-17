import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";
import { Client } from "@googlemaps/google-maps-services-js";

// Firebase Admin 초기화
initializeApp();

// Google Translate 클라이언트 초기화
const translate = new Translate();

// Google Maps 클라이언트 초기화
const googleMapsClient = new Client({});

// 🌍 일본 주소 검증 및 표준화 함수 (Google Geocoding API 활용)
export const validateJapaneseAddress = onRequest(async (req, res) => {
  try {
    console.log("Google Geocoding API 일본 주소 검증 시작");
    
    // CORS 설정
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

    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "MISSING_ADDRESS",
        message: "검증할 주소가 제공되지 않았습니다"
      });
    }

    console.log(`Google Geocoding 주소 검증 요청: "${address}"`);

    try {
      // Google Geocoding API 호출
      const geocodingResponse = await googleMapsClient.geocode({
        params: {
          address: address,
          language: 'ja',
          region: 'jp',
          key: process.env.GOOGLE_MAPS_API_KEY || ''
        }
      });

      if (geocodingResponse.data.status !== 'OK' || !geocodingResponse.data.results.length) {
        console.log(`Geocoding 검증 실패: ${geocodingResponse.data.status}`);
        
        // 검증 실패시 원본 주소 반환 (폴백)
        return res.status(200).json({
          success: true,
          validated: false,
          originalAddress: address,
          standardizedAddress: address,
          fallbackReason: `Geocoding 검증 실패: ${geocodingResponse.data.status}`,
          timestamp: new Date().toISOString()
        });
      }

      const result = geocodingResponse.data.results[0];
      const standardizedAddress = result.formatted_address;
      
      // 주소 구성 요소 분석
      const addressComponents = {};
      result.address_components.forEach(component => {
        const types = component.types;
        if (types.includes('administrative_area_level_1')) {
          addressComponents.prefecture = component.long_name; // 현
        }
        if (types.includes('locality')) {
          addressComponents.city = component.long_name; // 시
        }
        if (types.includes('sublocality_level_1')) {
          addressComponents.ward = component.long_name; // 구
        }
        if (types.includes('sublocality_level_2')) {
          addressComponents.district = component.long_name; // 동/마을
        }
        if (types.includes('premise')) {
          addressComponents.premise = component.long_name; // 번지
        }
      });

      console.log(`Google Geocoding 검증 성공: "${standardizedAddress}"`);

      return res.status(200).json({
        success: true,
        validated: true,
        originalAddress: address,
        standardizedAddress: standardizedAddress,
        addressComponents: addressComponents,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        placeId: result.place_id,
        timestamp: new Date().toISOString()
      });

    } catch (geocodingError) {
      console.error("Google Geocoding API 오류:", geocodingError);
      
      // API 오류시 원본 주소 반환 (폴백)
      return res.status(200).json({
        success: true,
        validated: false,
        originalAddress: address,
        standardizedAddress: address,
        fallbackReason: `Geocoding API 오류: ${geocodingError.message}`,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("주소 검증 함수 오류:", error);
    
    res.status(500).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: error.message || "주소 검증 중 오류가 발생했습니다",
      originalAddress: req.body.address,
      timestamp: new Date().toISOString()
    });
  }
});

// 🚀 개선된 주소 번역 함수 (검증 + 번역 통합)
export const translateAddressWithValidation = onRequest(async (req, res) => {
  try {
    console.log("주소 검증 + 번역 통합 함수 시작");
    
    // CORS 설정
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

    const { originalAddress, text, sourceLang = 'ja', targetLang = 'en' } = req.body;
    const addressToProcess = originalAddress || text;

    if (!addressToProcess) {
      return res.status(400).json({
        success: false,
        error: "MISSING_ADDRESS",
        message: "처리할 주소가 제공되지 않았습니다"
      });
    }

    console.log(`통합 주소 처리 시작: "${addressToProcess}"`);

    let processedAddress = addressToProcess;
    let validationResult = null;

    // 1단계: 일본어 주소인 경우 Google Geocoding으로 검증 및 표준화
    if (sourceLang === 'ja') {
      try {
        console.log("1단계: Google Geocoding 주소 검증");
        
        const geocodingResponse = await googleMapsClient.geocode({
          params: {
            address: addressToProcess,
            language: 'ja',
            region: 'jp',
            key: process.env.GOOGLE_MAPS_API_KEY || ''
          }
        });

        if (geocodingResponse.data.status === 'OK' && geocodingResponse.data.results.length > 0) {
          const result = geocodingResponse.data.results[0];
          processedAddress = result.formatted_address;
          
          validationResult = {
            validated: true,
            originalAddress: addressToProcess,
            standardizedAddress: processedAddress,
            placeId: result.place_id
          };
          
          console.log(`주소 검증 성공: "${processedAddress}"`);
        } else {
          console.log(`주소 검증 실패, 원본 주소 사용: "${addressToProcess}"`);
          validationResult = {
            validated: false,
            originalAddress: addressToProcess,
            standardizedAddress: addressToProcess,
            reason: geocodingResponse.data.status
          };
        }
      } catch (geocodingError) {
        console.log(`Geocoding 오류, 원본 주소 사용: ${geocodingError.message}`);
        validationResult = {
          validated: false,
          originalAddress: addressToProcess,
          standardizedAddress: addressToProcess,
          reason: "API 오류"
        };
      }
    }

    // 2단계: Google Translate로 번역
    console.log("2단계: Google Translate 번역");
    
    const [translatedText] = await translate.translate(processedAddress, {
      from: sourceLang,
      to: targetLang
    });

    // 번역 후 정리
    let cleanedAddress = translatedText;
    if (targetLang === 'en' && !cleanedAddress.includes('Japan')) {
      cleanedAddress += ', Japan';
    }

    console.log(`번역 완료: "${cleanedAddress}"`);

    // 성공 응답
    res.status(200).json({
      success: true,
      originalAddress: addressToProcess,
      processedAddress: processedAddress,
      translatedAddress: cleanedAddress,
      validationResult: validationResult,
      sourceLang: sourceLang,
      targetLang: targetLang,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("통합 주소 처리 오류:", error);
    
    res.status(500).json({
      success: false,
      error: "PROCESSING_ERROR",
      message: error.message || "주소 처리 중 오류가 발생했습니다",
      originalAddress: req.body.originalAddress || req.body.text,
      timestamp: new Date().toISOString()
    });
  }
});

// 🚀 구글 번역 API 전용 주소 번역 함수 (기존 함수 - 호환성 유지)
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
    message: "Firebase Functions with Google APIs 정상 작동",
    timestamp: new Date().toISOString(),
    functions: [
      "translateAddress - 구글 번역 API 주소 번역 (기존)",
      "validateJapaneseAddress - 일본 주소 검증 및 표준화",
      "translateAddressWithValidation - 주소 검증 + 번역 통합",
      "healthCheck - 상태 확인"
    ],
    apis: [
      "Google Translate API",
      "Google Geocoding API"
    ]
  });
});
