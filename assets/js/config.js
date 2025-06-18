/**
 * KYC Document Generator v3.0 - Configuration
 * 모든 설정 및 상수 관리
 */

const CONFIG = {
    // API 엔드포인트
    API_ENDPOINTS: {
        FIREBASE_FUNCTIONS: 'https://us-central1-kyc-document-generator.cloudfunctions.net',
        ANALYZE_DOCUMENT: '/analyzeSingleDocument',  // v3.0 개별 문서 분석
        TRANSLATE_ADDRESS: '/translateAddressWithValidation',
        VALIDATE_ADDRESS: '/validateJapaneseAddress'
    },
    
    // 파일 제한사항
    FILE_LIMITS: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        SELFIE_TYPES: ['image/jpeg', 'image/jpg', 'image/png']
    },
    
    // 워크플로우 단계
    STEPS: {
        PASSPORT: 1,
        LICENSE: 2, 
        SELFIE: 3,
        REVIEW: 4
    },
    
    // 단계별 제목
    STEP_TITLES: {
        1: '여권 정보 입력',
        2: '운전면허증 정보 입력', 
        3: '셀피 사진 업로드',
        4: '최종 검토 및 다운로드'
    },
    
    // 필수 필드 정의
    REQUIRED_FIELDS: {
        PASSPORT: [
            'fullName', 'dateOfBirth', 'gender', 'nationality',
            'issuingCountry', 'documentNumber'
        ],
        LICENSE: [
            'address'
        ]
    },
    
    // 문서 생성 설정
    DOCUMENT: {
        TRANSLATOR_NAME: 'Chae Woong Seok',
        LANGUAGES: {
            SOURCE: 'Japanese',
            TARGET: 'English'
        }
    },
    
    // 버전 정보
    VERSION: '3.0.0',
    BUILD_DATE: '2025-06-17'
};

// 전역 상태 관리
const AppState = {
    currentStep: 1,
    data: {
        passport: null,
        license: null,
        selfie: null
    },
    files: {
        passport: null,
        license: null,
        selfie: null
    },
    apiResults: {
        passport: null,
        license: null
    }
};

// 디버그 모드 (개발용)
const DEBUG = true;

// 콘솔 로그 래퍼 (강화된 버전)
function debugLog(message, data = null) {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
        if (data !== null && data !== undefined) {
            console.log(`🔧 [${timestamp}] ${message}`, data);
        } else {
            console.log(`🔧 [${timestamp}] ${message}`);
        }
    }
}

// API 전용 로그 함수
function apiLog(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    if (data !== null && data !== undefined) {
        console.log(`🌐 [API ${timestamp}] ${message}`, data);
    } else {
        console.log(`🌐 [API ${timestamp}] ${message}`);
    }
}

// 데이터 처리 로그 함수
function dataLog(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    if (data !== null && data !== undefined) {
        console.log(`📊 [DATA ${timestamp}] ${message}`, data);
    } else {
        console.log(`📊 [DATA ${timestamp}] ${message}`);
    }
}

// 전역 함수로 내보내기
window.CONFIG = CONFIG;
window.AppState = AppState;
window.debugLog = debugLog;
window.apiLog = apiLog;
window.dataLog = dataLog;