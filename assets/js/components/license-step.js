/**
 * KYC Document Generator v3.0 - License Step Component
 * 운전면허증 처리 단계를 담당하는 컴포넌트
 */

class LicenseStep {
    constructor() {
        this.data = {};
        this.file = null;
        this.apiResult = null;
        this.isCompleted = false;
        
        this.init();
    }
    
    /**
     * 컴포넌트 초기화
     */
    init() {
        debugLog('🚗 라이센스 단계 초기화');
        this.setupEventListeners();
        this.setupUploadArea();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 파일 업로드 관련
        const uploadArea = document.getElementById('license-upload-area');
        const fileInput = document.getElementById('license-file-input');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
            
            // 드래그 앤 드롭
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
        }        
        // 버튼 이벤트는 동적 생성되므로 이벤트 위임 방식 사용
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'license-next-button') {
                e.preventDefault();
                this.proceedToNext();
            }
            if (e.target && e.target.id === 'license-retry-button') {
                e.preventDefault();
                this.resetStep();
            }
            if (e.target && e.target.id === 'license-back-button') {
                e.preventDefault();
                this.goBack();
            }
        });
    }
    
    /**
     * 업로드 영역 설정
     */
    setupUploadArea() {
        const uploadArea = document.getElementById('license-upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <i class="bi bi-credit-card upload-icon"></i>
                    <h5>운전면허증 이미지를 업로드하세요</h5>
                    <p class="text-muted">드래그 앤 드롭 또는 클릭하여 파일 선택</p>
                    <small class="text-muted">지원 형식: JPG, PNG, PDF (최대 10MB)</small>
                </div>
            `;
        }
    }
    
    /**
     * 파일 업로드 처리
     */
    async handleFileUpload(file) {
        try {
            debugLog('📁 라이센스 파일 업로드 시작', file.name);
            
            if (!this.validateFile(file)) {
                return;
            }
            
            this.file = file;
            UIManager.showFilePreview(file, 'license-upload-area');
            UIManager.showLoading('운전면허증 분석 중...', '주소 정보를 추출하고 있습니다');
            
            await this.analyzeLicense(file);
            
        } catch (error) {
            debugLog('❌ 라이센스 파일 업로드 오류', error);
            UIManager.hideLoading();
            UIManager.showError('업로드 오류', APIManager.handleApiError(error, '라이센스 업로드'));
        }
    }    
    /**
     * 파일 유효성 검사
     */
    validateFile(file) {
        if (!Utils.validateFileSize(file, CONFIG.FILE_LIMITS.MAX_SIZE)) {
            UIManager.showError('파일 크기 초과', `파일 크기는 ${Utils.formatFileSize(CONFIG.FILE_LIMITS.MAX_SIZE)} 이하여야 합니다.`);
            return false;
        }
        
        if (!Utils.validateFileType(file, CONFIG.FILE_LIMITS.ALLOWED_TYPES)) {
            UIManager.showError('지원하지 않는 파일 형식', 'JPG, PNG, PDF 파일만 업로드 가능합니다.');
            return false;
        }
        
        return true;
    }
    
    /**
     * 라이센스 OCR 분석
     */
    async analyzeLicense(file) {
        try {
            debugLog('🔍 라이센스 OCR 분석 시작');
            
            const result = await APIManager.analyzeDocument(file, 'license');
            
            if (result.result && result.result.success) {
                this.apiResult = result.result;
                await this.extractLicenseData(result.result);
                
                UIManager.hideLoading();
                this.showDataForm();
                
                debugLog('✅ 라이센스 분석 완료', this.data);
            } else {
                throw new Error(result.result?.error || '라이센스 분석에 실패했습니다.');
            }
            
        } catch (error) {
            debugLog('❌ 라이센스 분석 오류', error);
            UIManager.hideLoading();
            UIManager.showError('분석 실패', APIManager.handleApiError(error, '라이센스 분석'));
        }
    }    
    /**
     * 라이센스 데이터 추출 및 주소 번역
     */
    async extractLicenseData(result) {
        try {
            const licenseData = result.license_data?.translated || result.license_data?.extracted || result.license_data?.original || {};
            
            debugLog('🔍 라이센스 원본 데이터 구조', licenseData);
            
            // 다양한 필드명으로 주소 추출 시도
            let originalAddress = '';
            
            // getValue 함수를 사용하여 배열 데이터 처리
            const addressFields = ['address', 'address1', 'homeAddress', 'residentialAddress', 'location'];
            
            for (const field of addressFields) {
                if (licenseData[field]) {
                    originalAddress = this.getValue(licenseData, [field]);
                    if (originalAddress && originalAddress !== '') {
                        debugLog(`✅ 주소 발견 (${field}):`, originalAddress);
                        break;
                    }
                }
            }
            
            // 주소가 비어있으면 전체 데이터에서 문자열 필드 검색
            if (!originalAddress || originalAddress === '[object Object]') {
                debugLog('⚠️ 표준 필드에서 주소 추출 실패, 전체 데이터 검색');
                
                // 모든 필드를 검사하여 일본어 주소로 보이는 텍스트 찾기
                for (const [key, value] of Object.entries(licenseData)) {
                    const stringValue = this.getValue(licenseData, [key]);
                    if (stringValue && typeof stringValue === 'string' && 
                        (stringValue.includes('県') || stringValue.includes('市') || 
                         stringValue.includes('区') || stringValue.includes('町') ||
                         stringValue.length > 10)) {
                        originalAddress = stringValue;
                        debugLog(`✅ 주소 추정 발견 (${key}):`, originalAddress);
                        break;
                    }
                }
            }
            
            debugLog('🏠 최종 추출 주소:', originalAddress);
            
            // 주소 번역 및 검증 실행
            let translatedAddress = '';
            let officialAddress = '';
            
            if (originalAddress && originalAddress !== '' && originalAddress !== '[object Object]') {
                try {
                    // 먼저 API 번역 시도
                    const translationResult = await APIManager.translateAddress(originalAddress);
                    
                    if (translationResult.result && translationResult.result.success) {
                        translatedAddress = translationResult.result.translatedText || '';
                        officialAddress = this.convertToOfficialRomanization(translatedAddress);
                        
                        debugLog('✅ API 주소 번역 완료', { 
                            original: originalAddress, 
                            translated: translatedAddress,
                            official: officialAddress 
                        });
                    } else {
                        throw new Error('API 번역 실패');
                    }
                } catch (translateError) {
                    debugLog('⚠️ API 번역 실패, 클라이언트 사이드 번역 사용', translateError);
                    
                    // 클라이언트 사이드 간단 번역
                    translatedAddress = this.translateAddressClientSide(originalAddress);
                    officialAddress = this.convertToOfficialRomanization(translatedAddress);
                    
                    debugLog('✅ 클라이언트 사이드 번역 완료', {
                        original: originalAddress,
                        translated: translatedAddress,
                        official: officialAddress
                    });
                }
            } else {
                debugLog('⚠️ 유효한 주소 정보를 찾을 수 없음');
                originalAddress = '주소 정보를 찾을 수 없습니다';
                translatedAddress = 'Address information not found';
                officialAddress = 'Address information not found';
            }
            
            this.data = {
                originalAddress: originalAddress,
                translatedAddress: translatedAddress,
                officialAddress: officialAddress
            };
            
            // AppState에 저장
            AppState.data.license = Utils.deepClone(this.data);
            AppState.files.license = this.file;
            AppState.apiResults.license = this.apiResult;
            
        } catch (error) {
            debugLog('❌ 라이센스 데이터 추출 오류', error);
            throw error;
        }
    }
    
    /**
     * IDAnalyzer API 응답에서 값 추출 (배열 처리)
     */
    getValue(data, fieldNames) {
        for (const fieldName of fieldNames) {
            if (data[fieldName]) {
                const value = data[fieldName];
                
                // 배열 처리: [{"value": "actual_data"}, {...}]
                if (Array.isArray(value) && value.length > 0) {
                    const item = value[0];
                    if (item?.value !== undefined) return item.value;
                    return item;
                }
                
                // 객체 처리: {"value": "actual_data"}
                if (typeof value === 'object' && value !== null && value.value !== undefined) {
                    return value.value;
                }
                
                // 문자열 처리
                if (typeof value === 'string') return value;
            }
        }
        return '';
    }    
    /**
     * 클라이언트 사이드 주소 번역 (개선된 버전)
     */
    translateAddressClientSide(japaneseAddress) {
        debugLog('🌍 클라이언트 사이드 번역 시작:', japaneseAddress);
        
        let translated = japaneseAddress;
        
        // 1단계: 전각 숫자를 반각으로 변환
        const numberMap = {
            '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
            '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
        };
        
        for (const [fullWidth, halfWidth] of Object.entries(numberMap)) {
            translated = translated.replace(new RegExp(fullWidth, 'g'), halfWidth);
        }
        
        // 2단계: 주요 현(県) 번역
        const prefectureMap = {
            '山口県': 'Yamaguchi Prefecture',
            '東京都': 'Tokyo',
            '大阪府': 'Osaka Prefecture',
            '京都府': 'Kyoto Prefecture',
            '神奈川県': 'Kanagawa Prefecture',
            '愛知県': 'Aichi Prefecture',
            '福岡県': 'Fukuoka Prefecture',
            '北海道': 'Hokkaido',
            '宮城県': 'Miyagi Prefecture',
            '埼玉県': 'Saitama Prefecture',
            '千葉県': 'Chiba Prefecture',
            '兵庫県': 'Hyogo Prefecture',
            '広島県': 'Hiroshima Prefecture',
            '熊本県': 'Kumamoto Prefecture'
        };
        
        for (const [japanese, english] of Object.entries(prefectureMap)) {
            translated = translated.replace(japanese, english);
        }
        
        // 3단계: 주요 시(市) 번역
        const cityMap = {
            '周南市': 'Shunan City',
            '下関市': 'Shimonoseki City',
            '山口市': 'Yamaguchi City',
            '宇部市': 'Ube City',
            '萩市': 'Hagi City',
            '防府市': 'Hofu City',
            '新宿区': 'Shinjuku',
            '渋谷区': 'Shibuya',
            '港区': 'Minato',
            '千代田区': 'Chiyoda',
            '中央区': 'Chuo',
            '台東区': 'Taito',
            '文京区': 'Bunkyo',
            '豊島区': 'Toshima',
            '品川区': 'Shinagawa',
            '目黒区': 'Meguro',
            '大田区': 'Ota',
            '世田谷区': 'Setagaya',
            '中野区': 'Nakano',
            '杉並区': 'Suginami',
            '練馬区': 'Nerima',
            '板橋区': 'Itabashi',
            '北区': 'Kita',
            '荒川区': 'Arakawa',
            '足立区': 'Adachi',
            '葛飾区': 'Katsushika',
            '江戸川区': 'Edogawa',
            '江東区': 'Koto'
        };
        
        for (const [japanese, english] of Object.entries(cityMap)) {
            translated = translated.replace(japanese, english);
        }
        
        // 4단계: 일반적인 지명 요소 번역
        const generalMap = {
            '存栗屋': 'Sonkuriya',  // 특정 지명 (정확한 읽기)
            '存栄屋': 'Soneiya',    // 다른 변형
            '町': ' Town',          // 공백 추가
            '村': ' Village',       // 공백 추가
            '丁目': ' Chome',       // 공백 추가
            '番地': '',
            '番': '',
            '号': '',
            '条': ' Jo',           // 공백 추가
            '通': ' Dori',         // 공백 추가
            '大字': ' Oaza',       // 공백 추가
            '字': ' Aza',          // 공백 추가
            'ー': '-',
            '－': '-',
            '　': ' '
        };
        
        for (const [japanese, english] of Object.entries(generalMap)) {
            translated = translated.replace(new RegExp(japanese, 'g'), english);
        }
        
        // 5단계: 남은 한자를 로마자로 변환 (기본적인 읽기)
        const kanjiToRomaji = {
            // 숫자
            '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
            '六': '6', '七': '7', '八': '8', '九': '9', '十': '10',
            
            // 방향
            '東': 'Higashi', '西': 'Nishi', '南': 'Minami', '北': 'Kita',
            '中': 'Naka', '上': 'Kami', '下': 'Shimo',
            
            // 일반적인 한자
            '新': 'Shin', '古': 'Furu', '大': 'Dai', '小': 'Ko',
            '本': 'Hon', '元': 'Moto', '平': 'Hira', '高': 'Taka',
            '田': 'Ta', '山': 'Yama', '川': 'Kawa', '島': 'Shima',
            '橋': 'Bashi', '木': 'Ki', '林': 'Hayashi', '森': 'Mori'
        };
        
        for (const [kanji, romaji] of Object.entries(kanjiToRomaji)) {
            translated = translated.replace(new RegExp(kanji, 'g'), romaji);
        }
        
        // 6단계: 공백과 구두점 정리
        translated = translated
            .replace(/\s+/g, ' ')                    // 연속 공백 제거 (먼저 실행)
            .replace(/\s*-\s*/g, '-')                // 하이픈 주변 공백 제거
            .replace(/\s*,\s*/g, ', ')               // 쉼표 정규화
            .replace(/([a-zA-Z])(City|Prefecture|Town|Village)/g, '$1 $2') // 단어 사이 공백 추가
            .replace(/(Prefecture)([A-Z])/g, '$1 $2') // Prefecture 뒤 공백
            .replace(/(City)([A-Z])/g, '$1 $2')      // City 뒤 공백
            .replace(/([0-9])\s+([0-9])/g, '$1-$2')  // 숫자 사이 공백을 하이픈으로
            .replace(/^\s+/, '')                     // 앞 공백 제거
            .replace(/\s+$/, '');                    // 끝 공백 제거
        
        debugLog('🌍 클라이언트 사이드 번역 완료:', translated);
        return translated;
    }
    
    /**
     * 일본 공식 로마자 표기법으로 변환 (개선된 버전)
     */
    convertToOfficialRomanization(translatedAddress) {
        if (!translatedAddress) return '';
        
        debugLog('🏛️ 일본 공식 표기법 변환 시작:', translatedAddress);
        
        let official = translatedAddress;
        
        // 1단계: Prefecture를 -ken으로 변환 (Tokyo 제외)
        official = official.replace(/Tokyo/g, 'Tokyo-to');
        official = official.replace(/(\w+)\s+Prefecture/g, '$1-ken');
        
        // 2단계: City를 -shi로 변환 (특별구 제외)
        const specialWards = ['Chiyoda', 'Chuo', 'Minato', 'Shinjuku', 'Bunkyo', 'Taito', 'Sumida', 'Koto', 'Shinagawa', 'Meguro', 'Ota', 'Setagaya', 'Shibuya', 'Nakano', 'Suginami', 'Toshima', 'Kita', 'Arakawa', 'Itabashi', 'Nerima', 'Adachi', 'Katsushika', 'Edogawa'];
        
        // 특별구는 -ku로 변환
        for (const ward of specialWards) {
            official = official.replace(new RegExp(`\\b${ward}\\b`, 'g'), `${ward}-ku`);
        }
        
        // 일반 City는 -shi로 변환
        official = official.replace(/(\w+)\s+City/g, '$1-shi');
        
        // 3단계: Town을 -machi 또는 -cho로 변환
        official = official.replace(/(\w+)\s+Town/g, '$1-machi');
        
        // 4단계: Village를 -mura로 변환
        official = official.replace(/(\w+)\s+Village/g, '$1-mura');
        
        // 5단계: Chome을 -chome으로 변환
        official = official.replace(/(\d+)\s*Chome/g, '$1-chome');
        
        // 6단계: 공백과 구두점 정리
        official = official
            .replace(/\s+/g, ' ')                    // 연속 공백 정리 (먼저 실행)
            .replace(/\s*-\s*/g, '-')                // 하이픈 주변 공백 제거
            .replace(/\s*,\s*/g, ', ')               // 쉼표 정규화
            .replace(/([a-zA-Z])-([a-zA-Z])/g, '$1 $2') // Prefecture-City 사이에 공백 추가
            .replace(/(-ken)([A-Z])/g, '$1 $2')      // -ken 뒤에 공백 추가
            .replace(/(-shi)([A-Z])/g, '$1 $2')      // -shi 뒤에 공백 추가
            .replace(/(-ku)([A-Z])/g, '$1 $2')       // -ku 뒤에 공백 추가
            .replace(/(-machi)([A-Z])/g, '$1 $2')    // -machi 뒤에 공백 추가
            .replace(/(-mura)([A-Z])/g, '$1 $2')     // -mura 뒤에 공백 추가
            .trim();                                 // 앞뒤 공백 제거
        
        debugLog('🏛️ 일본 공식 표기법 변환 완료:', official);
        return official;
    }
    
    /**
     * 데이터 입력 폼 표시
     */
    showDataForm() {
        const container = document.getElementById('license-data-form');
        if (!container) return;
        
        container.innerHTML = `
            <div class="data-form">                
                <h5><i class="bi bi-check-circle text-success"></i> 주소 정보를 확인해주세요</h5>
                
                <div class="row">
                    <div class="col-12">
                        <div class="mb-3">
                            <label class="form-label">원본 주소 (Original Address)</label>
                            <textarea class="form-control" id="license-originalAddress" rows="2" readonly 
                                style="background-color: #f8f9fa;">${this.data.originalAddress}</textarea>
                            <div class="form-text">문서에서 추출된 원본 주소 (OCR 결과)</div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">영문 번역 주소 (Translated Address) *</label>
                            <textarea class="form-control" id="license-translatedAddress" rows="2" 
                                required>${this.data.translatedAddress}</textarea>
                            <div class="form-text">Google API로 번역된 주소 (편집 가능)</div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">일본 공식 표기법 (Official Romanization)</label>
                            <textarea class="form-control" id="license-officialAddress" rows="2" readonly 
                                style="background-color: #e3f2fd;">${this.data.officialAddress}</textarea>
                            <div class="form-text">일본 공식 로마자 표기 (-shi, -ken 형식)</div>
                        </div>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-secondary" id="license-back-button">
                        <i class="bi bi-arrow-left"></i> 이전: 여권
                    </button>
                    <div>
                        <button type="button" class="btn btn-outline-secondary me-2" id="license-retry-button">
                            <i class="bi bi-arrow-clockwise"></i> 다시 업로드
                        </button>
                        <button type="button" class="btn btn-primary" id="license-next-button">
                            다음: 셀피 <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showElement('license-data-form');
        this.setupFormValidation();
    }    
    /**
     * 폼 유효성 검사 설정
     */
    setupFormValidation() {
        const translatedField = document.getElementById('license-translatedAddress');
        const nextButton = document.getElementById('license-next-button');
        
        if (translatedField) {
            translatedField.addEventListener('input', () => {
                const isValid = !Utils.isEmpty(translatedField.value);
                if (nextButton) {
                    nextButton.disabled = !isValid;
                }
            });
        }
    }
    
    /**
     * 사용자 입력 데이터 수집
     */
    collectFormData() {
        this.data = {
            originalAddress: document.getElementById('license-originalAddress')?.value || '',
            translatedAddress: document.getElementById('license-translatedAddress')?.value || '',
            officialAddress: document.getElementById('license-officialAddress')?.value || ''
        };
        
        AppState.data.license = Utils.deepClone(this.data);
        debugLog('📋 라이센스 폼 데이터 수집 완료', this.data);
    }
    
    /**
     * 다음 단계로 진행 (순차 워크플로우)
     */
    proceedToNext() {
        const translatedAddress = document.getElementById('license-translatedAddress')?.value;
        
        if (Utils.isEmpty(translatedAddress)) {
            UIManager.showAlert('error', '입력 확인', '번역된 주소를 입력해주세요.');
            return;
        }
        
        // 데이터 수집
        this.collectFormData();
        this.isCompleted = true;
        
        // AppState에 데이터 저장
        AppState.data.license = this.data;
        AppState.files.license = this.file;
        AppState.apiResults.license = this.apiResult;
        
        debugLog('✅ 라이센스 단계 완료', this.data);
        
        // 성공 메시지 표시 후 다음 단계로 이동
        UIManager.showAlert('success', '운전면허증 정보 확인 완료', '셀피 사진을 업로드해주세요.')
            .then(() => {
                if (window.workflowManager) {
                    window.workflowManager.goToStep(CONFIG.STEPS.SELFIE);
                }
            });
    }
    
    /**
     * 이전 단계로 돌아가기
     */
    goBack() {
        if (window.workflowManager) {
            window.workflowManager.goToStep(CONFIG.STEPS.PASSPORT);
        }
    }
    
    /**
     * 단계 초기화
     */
    resetStep() {
        this.data = {};
        this.file = null;
        this.apiResult = null;
        this.isCompleted = false;
        
        UIManager.clearContainer('license-data-form');
        UIManager.hideElement('license-data-form');
        this.setupUploadArea();
        
        debugLog('🔄 라이센스 단계 초기화');
    }
    
    /**
     * 단계 완료 여부 확인
     */
    isStepCompleted() {
        return this.isCompleted && !Utils.isEmpty(this.data.translatedAddress);
    }
}

// 전역으로 클래스 노출
window.LicenseStep = LicenseStep;