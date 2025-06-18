/**
 * KYC Document Generator v3.0 - API Manager
 * 모든 API 호출을 담당하는 모듈
 */

class APIManager {
    /**
     * 문서 분석 API 호출 (여권 또는 라이센스)
     */
    static async analyzeDocument(file, documentType) {
        try {
            apiLog(`📡 문서 분석 시작: ${documentType}`);
            apiLog(`📤 파일 정보:`, {
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                type: file.type,
                lastModified: new Date(file.lastModified).toLocaleString()
            });
            
            const base64 = await Utils.fileToBase64(file);
            apiLog(`🔄 Base64 변환 완료, 길이: ${base64.length.toLocaleString()}자`);
            
            // v3.0 개별 문서 분석 API 사용
            const requestData = {
                data: {
                    image: base64,
                    type: documentType,
                    filename: file.name
                }
            };
            
            const apiUrl = `${CONFIG.API_ENDPOINTS.FIREBASE_FUNCTIONS}${CONFIG.API_ENDPOINTS.ANALYZE_DOCUMENT}`;
            apiLog(`🌐 API 호출 시작: ${apiUrl}`);
            apiLog(`📤 요청 데이터:`, {
                type: documentType,
                filename: file.name,
                imageSize: `${base64.length} 문자`
            });
            
            const startTime = Date.now();
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const responseTime = Date.now() - startTime;
            apiLog(`📨 응답 수신 (${responseTime}ms): ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                apiLog('❌ HTTP 오류 응답:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            apiLog(`✅ 문서 분석 완료: ${documentType} (${responseTime}ms)`);
            
            // 응답 데이터 상세 로그
            dataLog('📥 전체 API 응답:', result);
            
            if (result.result) {
                dataLog('📋 응답 구조 분석:', {
                    hasSuccess: !!result.result.success,
                    hasPassportData: !!result.result.passport_data,
                    hasLicenseData: !!result.result.license_data,
                    hasExtracted: !!result.result.passport_data?.extracted || !!result.result.license_data?.extracted,
                    hasTranslated: !!result.result.passport_data?.translated || !!result.result.license_data?.translated
                });
                
                // 추출된 데이터 로그
                const dataSource = result.result.passport_data || result.result.license_data;
                if (dataSource) {
                    if (dataSource.extracted) {
                        dataLog('🔍 추출된 데이터 (extracted):', dataSource.extracted);
                    }
                    if (dataSource.translated) {
                        dataLog('🌍 번역된 데이터 (translated):', dataSource.translated);
                    }
                }
            }
            
            return result;
            
        } catch (error) {
            apiLog(`❌ 문서 분석 오류: ${documentType}`, error);
            throw new Error(`문서 분석 중 오류가 발생했습니다: ${error.message}`);
        }
    }
    
    /**
     * 주소 번역 및 검증 API 호출
     */
    static async translateAddress(japaneseAddress) {
        try {
            debugLog('🌍 주소 번역 시작', japaneseAddress);
            
            const response = await fetch(`${CONFIG.API_ENDPOINTS.FIREBASE_FUNCTIONS}${CONFIG.API_ENDPOINTS.TRANSLATE_ADDRESS}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalAddress: japaneseAddress,
                    sourceLang: 'ja',
                    targetLang: 'en'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            debugLog('✅ 주소 번역 완료', result);
            
            return result;
            
        } catch (error) {
            debugLog('❌ 주소 번역 오류', error);
            
            // 폴백: 기본 번역 시도
            try {
                debugLog('🔄 폴백 번역 시도');
                return await this.fallbackTranslation(japaneseAddress);
            } catch (fallbackError) {
                throw new Error(`주소 번역 중 오류가 발생했습니다: ${error.message}`);
            }
        }
    }
    
    /**
     * 폴백 번역 (기본 Google Translate)
     */
    static async fallbackTranslation(text) {
        // 기존 번역 API 호출 로직
        const response = await fetch(`${CONFIG.API_ENDPOINTS.FIREBASE_FUNCTIONS}/translateAddress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                sourceLang: 'ja',
                targetLang: 'en'
            })
        });
        
        if (!response.ok) {
            throw new Error('Fallback translation failed');
        }
        
        return await response.json();
    }
    
    /**
     * 네트워크 연결 상태 확인
     */
    static async checkConnection() {
        try {
            const response = await fetch(`${CONFIG.API_ENDPOINTS.FIREBASE_FUNCTIONS}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * API 응답 에러 처리
     */
    static handleApiError(error, context = '') {
        debugLog(`❌ API 오류 [${context}]`, error);
        
        if (error.message.includes('fetch')) {
            return '네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('timeout')) {
            return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            return 'API 인증에 실패했습니다. 관리자에게 문의하세요.';
        } else if (error.message.includes('429')) {
            return 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else {
            return error.message || '알 수 없는 오류가 발생했습니다.';
        }
    }
}

// 전역 APIManager 인스턴스 생성
window.APIManager = new APIManager();