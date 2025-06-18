/**
 * KYC Document Generator v3.0 - Passport Step Component
 * 여권 처리 단계를 담당하는 컴포넌트
 */

class PassportStep {
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
        debugLog('🛂 여권 단계 초기화');
        this.setupEventListeners();
        this.setupUploadArea();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 파일 업로드 버튼
        const uploadArea = document.getElementById('passport-upload-area');
        const fileInput = document.getElementById('passport-file-input');
        
        if (uploadArea && fileInput) {
            // 클릭으로 파일 선택
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            // 파일 선택 시 처리
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
        
        // 다음 단계 버튼
        // 다음 단계 및 재업로드 버튼은 showDataForm()에서 동적으로 생성되므로
        // 여기서는 이벤트 위임(Event Delegation) 방식 사용
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'passport-next-button') {
                e.preventDefault();
                this.proceedToNext();
            }
            if (e.target && e.target.id === 'passport-retry-button') {
                e.preventDefault();
                this.resetStep();
            }
        });
    }    
    /**
     * 업로드 영역 설정
     */
    setupUploadArea() {
        const uploadArea = document.getElementById('passport-upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <i class="bi bi-cloud-upload upload-icon"></i>
                    <h5>여권 이미지를 업로드하세요</h5>
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
            debugLog('📁 여권 파일 업로드 시작', file.name);
            
            // 파일 유효성 검사
            if (!this.validateFile(file)) {
                return;
            }
            
            this.file = file;
            
            // 미리보기 표시
            UIManager.showFilePreview(file, 'passport-upload-area');
            
            // 로딩 표시
            UIManager.showLoading('여권 분석 중...', '잠시만 기다려주세요');
            
            // OCR 분석 실행
            await this.analyzePassport(file);
            
        } catch (error) {
            debugLog('❌ 여권 파일 업로드 오류', error);
            UIManager.hideLoading();
            UIManager.showError('업로드 오류', APIManager.handleApiError(error, '여권 업로드'));
        }
    }    
    /**
     * 파일 유효성 검사
     */
    validateFile(file) {
        // 파일 크기 검사
        if (!Utils.validateFileSize(file, CONFIG.FILE_LIMITS.MAX_SIZE)) {
            UIManager.showError(
                '파일 크기 초과', 
                `파일 크기는 ${Utils.formatFileSize(CONFIG.FILE_LIMITS.MAX_SIZE)} 이하여야 합니다.`
            );
            return false;
        }
        
        // 파일 형식 검사
        if (!Utils.validateFileType(file, CONFIG.FILE_LIMITS.ALLOWED_TYPES)) {
            UIManager.showError(
                '지원하지 않는 파일 형식', 
                'JPG, PNG, PDF 파일만 업로드 가능합니다.'
            );
            return false;
        }
        
        return true;
    }
    
    /**
     * 여권 OCR 분석
     */
    async analyzePassport(file) {
        try {
            debugLog('🔍 여권 OCR 분석 시작');
            debugLog('📁 파일 정보:', {
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                type: file.type
            });
            
            // API 호출
            debugLog('🌐 APIManager.analyzeDocument 호출 중...');
            const result = await APIManager.analyzeDocument(file, 'passport');
            
            debugLog('📥 API 응답 받음:', result);
            
            if (result.result && result.result.success) {
                this.apiResult = result.result;
                debugLog('📋 여권 데이터 구조:', {
                    passport_data: result.result.passport_data,
                    hasExtracted: !!result.result.passport_data?.extracted,
                    hasTranslated: !!result.result.passport_data?.translated
                });
                
                this.extractPassportData(result.result);
                
                UIManager.hideLoading();
                this.showDataForm();
                
                debugLog('✅ 여권 분석 완료', this.data);
            } else {
                const errorMsg = result.result?.error || '여권 분석에 실패했습니다.';
                debugLog('❌ 여권 분석 실패:', errorMsg);
                throw new Error(errorMsg);
            }
            
        } catch (error) {
            debugLog('❌ 여권 분석 오류', error);
            UIManager.hideLoading();
            UIManager.showError('분석 실패', APIManager.handleApiError(error, '여권 분석'));
        }
    }    
    /**
     * 값 추출 함수 (v2.2 호환)
     */
    getValue(data, fieldNames) {
        if (!data) return '';
        
        for (const fieldName of fieldNames) {
            if (data[fieldName]) {
                const value = data[fieldName];
                
                // 배열인 경우 첫 번째 값의 value 속성 또는 값 자체 반환
                if (Array.isArray(value) && value.length > 0) {
                    const item = value[0];
                    if (item && typeof item === 'object' && item.value !== undefined) {
                        return item.value;
                    }
                    if (item) {
                        return item;
                    }
                }
                
                // 객체인 경우 value 속성 확인
                if (typeof value === 'object' && value.value !== undefined) {
                    return value.value;
                }
                
                // 문자열인 경우 그대로 반환
                if (typeof value === 'string') {
                    return value;
                }
            }
        }
        return '';
    }
    
    /**
     * 여권 데이터 추출 (v2.2 호환 로직)
     */
    extractPassportData(result) {
        dataLog('🔄 여권 데이터 추출 시작');
        dataLog('📥 입력 result 전체:', result);
        
        const passportData = result.passport_data?.translated || result.passport_data?.extracted || result.passport_data?.original || {};
        
        dataLog('📊 사용할 데이터 소스:', {
            hasTranslated: !!result.passport_data?.translated,
            hasExtracted: !!result.passport_data?.extracted, 
            hasOriginal: !!result.passport_data?.original,
            usingData: passportData
        });
        
        // 원본 데이터 필드 확인
        dataLog('🔍 원본 데이터 필드들:', Object.keys(passportData));
        dataLog('📋 각 필드별 값 및 타입:', {
            documentName: { value: passportData.documentName, type: typeof passportData.documentName, isArray: Array.isArray(passportData.documentName) },
            fullName: { value: passportData.fullName, type: typeof passportData.fullName, isArray: Array.isArray(passportData.fullName) },
            firstName: { value: passportData.firstName, type: typeof passportData.firstName, isArray: Array.isArray(passportData.firstName) },
            dateOfBirth: { value: passportData.dateOfBirth, type: typeof passportData.dateOfBirth, isArray: Array.isArray(passportData.dateOfBirth) },
            dob: { value: passportData.dob, type: typeof passportData.dob, isArray: Array.isArray(passportData.dob) },
            birthDate: { value: passportData.birthDate, type: typeof passportData.birthDate, isArray: Array.isArray(passportData.birthDate) },
            sex: { value: passportData.sex, type: typeof passportData.sex, isArray: Array.isArray(passportData.sex) },
            gender: { value: passportData.gender, type: typeof passportData.gender, isArray: Array.isArray(passportData.gender) },
            nationality: { value: passportData.nationality, type: typeof passportData.nationality, isArray: Array.isArray(passportData.nationality) },
            country: { value: passportData.country, type: typeof passportData.country, isArray: Array.isArray(passportData.country) },
            issuingCountry: { value: passportData.issuingCountry, type: typeof passportData.issuingCountry, isArray: Array.isArray(passportData.issuingCountry) },
            documentNumber: { value: passportData.documentNumber, type: typeof passportData.documentNumber, isArray: Array.isArray(passportData.documentNumber) },
            passportNumber: { value: passportData.passportNumber, type: typeof passportData.passportNumber, isArray: Array.isArray(passportData.passportNumber) },
            issueDate: { value: passportData.issueDate, type: typeof passportData.issueDate, isArray: Array.isArray(passportData.issueDate) },
            issued: { value: passportData.issued, type: typeof passportData.issued, isArray: Array.isArray(passportData.issued) },
            dateOfIssue: { value: passportData.dateOfIssue, type: typeof passportData.dateOfIssue, isArray: Array.isArray(passportData.dateOfIssue) },
            expiryDate: { value: passportData.expiryDate, type: typeof passportData.expiryDate, isArray: Array.isArray(passportData.expiryDate) },
            expiry: { value: passportData.expiry, type: typeof passportData.expiry, isArray: Array.isArray(passportData.expiry) },
            dateOfExpiry: { value: passportData.dateOfExpiry, type: typeof passportData.dateOfExpiry, isArray: Array.isArray(passportData.dateOfExpiry) }
        });
        
        this.data = {
            fullName: this.getValue(passportData, ['documentName', 'fullName', 'firstName']),
            dateOfBirth: Utils.formatDate(this.getValue(passportData, ['dateOfBirth', 'dob', 'birthDate'])),
            gender: this.getValue(passportData, ['sex', 'gender']),
            nationality: this.getValue(passportData, ['nationality', 'country', 'countryFull', 'issuingCountry']) || 'JAPAN',
            issuingCountry: this.getValue(passportData, ['issuingCountry', 'nationality', 'country', 'countryFull']) || 'JAPAN',
            documentNumber: this.getValue(passportData, ['documentNumber', 'passportNumber']),
            issueDate: Utils.formatDate(this.getValue(passportData, ['issueDate', 'issued', 'dateOfIssue'])),
            expiryDate: Utils.formatDate(this.getValue(passportData, ['expiryDate', 'expiry', 'dateOfExpiry']))
        };
        
        dataLog('📝 최종 추출된 데이터:', this.data);
        
        // AppState에 저장
        AppState.data.passport = Utils.deepClone(this.data);
        AppState.files.passport = this.file;
        AppState.apiResults.passport = this.apiResult;
        
        dataLog('💾 AppState 저장 완료:', {
            passport: AppState.data.passport,
            hasFile: !!AppState.files.passport,
            hasApiResult: !!AppState.apiResults.passport
        });
    }
    
    /**
     * 데이터 입력 폼 표시
     */
    showDataForm() {
        const container = document.getElementById('passport-data-form');
        if (!container) return;
        
        container.innerHTML = `
            <div class="data-form">
                <h5><i class="bi bi-check-circle text-success"></i> 추출된 정보를 확인해주세요</h5>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">성명 (Full Name) *</label>
                            <input type="text" class="form-control" id="passport-fullName" value="${this.data.fullName}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">생년월일 (Date of Birth) *</label>
                            <input type="date" class="form-control" id="passport-dateOfBirth" value="${this.data.dateOfBirth}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">성별 (Gender) *</label>
                            <select class="form-select" id="passport-gender" required>
                                <option value="">선택하세요</option>
                                <option value="M" ${this.data.gender === 'M' ? 'selected' : ''}>남성 (Male)</option>
                                <option value="F" ${this.data.gender === 'F' ? 'selected' : ''}>여성 (Female)</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">국적 (Nationality) *</label>
                            <input type="text" class="form-control" id="passport-nationality" value="${this.data.nationality}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">발급 국가 (Issuing Country) *</label>
                            <input type="text" class="form-control" id="passport-issuingCountry" value="${this.data.issuingCountry}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">여권 번호 (Document Number)</label>
                            <input type="text" class="form-control" id="passport-documentNumber" value="${this.data.documentNumber}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">발급일 (Issue Date)</label>
                            <input type="date" class="form-control" id="passport-issueDate" value="${this.data.issueDate}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">만료일 (Expiry Date)</label>
                            <input type="date" class="form-control" id="passport-expiryDate" value="${this.data.expiryDate}">
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-secondary" id="passport-retry-button">
                        <i class="bi bi-arrow-clockwise"></i> 다시 업로드
                    </button>
                    <button type="button" class="btn btn-primary" id="passport-next-button">
                        다음: 운전면허증 <i class="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        UIManager.showElement('passport-data-form');
        this.setupFormValidation();
    }    
    /**
     * 폼 유효성 검사 설정
     */
    setupFormValidation() {
        const requiredFields = ['passport-fullName', 'passport-dateOfBirth', 'passport-gender', 'passport-nationality', 'passport-issuingCountry'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.validateForm();
                });
            }
        });
    }
    
    /**
     * 폼 유효성 검사
     */
    validateForm() {
        const requiredFields = ['passport-fullName', 'passport-dateOfBirth', 'passport-gender', 'passport-nationality', 'passport-issuingCountry'];
        const nextButton = document.getElementById('passport-next-button');
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && Utils.isEmpty(field.value)) {
                isValid = false;
            }
        });
        
        if (nextButton) {
            nextButton.disabled = !isValid;
        }
        
        return isValid;
    }
    
    /**
     * 사용자 입력 데이터 수집
     */
    collectFormData() {
        this.data = {
            fullName: document.getElementById('passport-fullName')?.value || '',
            dateOfBirth: document.getElementById('passport-dateOfBirth')?.value || '',
            gender: document.getElementById('passport-gender')?.value || '',
            nationality: document.getElementById('passport-nationality')?.value || '',
            issuingCountry: document.getElementById('passport-issuingCountry')?.value || '',
            documentNumber: document.getElementById('passport-documentNumber')?.value || '',
            issueDate: document.getElementById('passport-issueDate')?.value || '',
            expiryDate: document.getElementById('passport-expiryDate')?.value || ''
        };
        
        // AppState 업데이트
        AppState.data.passport = Utils.deepClone(this.data);
        
        debugLog('📋 여권 폼 데이터 수집 완료', this.data);
    }
    

    
    /**
     * 다음 단계로 진행 (순차 워크플로우)
     */
    proceedToNext() {
        if (!this.validateForm()) {
            UIManager.showAlert('error', '입력 확인', '필수 항목을 모두 입력해주세요.');
            return;
        }
        
        // 데이터 수집
        this.collectFormData();
        this.isCompleted = true;
        
        // AppState에 데이터 저장
        AppState.data.passport = this.data;
        AppState.files.passport = this.file;
        AppState.apiResults.passport = this.apiResult;
        
        debugLog('✅ 여권 단계 완료', this.data);
        
        // 성공 메시지 표시 후 다음 단계로 이동
        UIManager.showAlert('success', '여권 정보 확인 완료', '운전면허증을 업로드해주세요.')
            .then(() => {
                if (window.workflowManager) {
                    window.workflowManager.goToStep(CONFIG.STEPS.LICENSE);
                }
            });
    }
    
    /**
     * 단계 초기화
     */
    resetStep() {
        this.data = {};
        this.file = null;
        this.apiResult = null;
        this.isCompleted = false;
        
        UIManager.clearContainer('passport-data-form');
        UIManager.hideElement('passport-data-form');
        
        this.setupUploadArea();
        
        debugLog('🔄 여권 단계 초기화');
    }
    
    /**
     * 단계 완료 여부 확인
     */
    isStepCompleted() {
        return this.isCompleted && this.validateForm();
    }
}

// 전역으로 클래스 노출
window.PassportStep = PassportStep;