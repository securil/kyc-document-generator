/**
 * KYC Document Generator v3.0 - Selfie Step Component
 * 셀피 업로드 단계를 담당하는 컴포넌트
 */

class SelfieStep {
    constructor() {
        this.file = null;
        this.isCompleted = false;
        
        this.init();
    }
    
    /**
     * 컴포넌트 초기화
     */
    init() {
        debugLog('📸 셀피 단계 초기화');
        this.setupEventListeners();
        this.setupUploadArea();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const uploadArea = document.getElementById('selfie-upload-area');
        const fileInput = document.getElementById('selfie-file-input');
        
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
        // 버튼 이벤트
        const nextButton = document.getElementById('selfie-next-button');
        if (nextButton) {
            nextButton.addEventListener('click', () => this.proceedToNext());
        }
        
        const retryButton = document.getElementById('selfie-retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => this.resetStep());
        }
        
        const backButton = document.getElementById('selfie-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.goBack());
        }
    }
    
    /**
     * 업로드 영역 설정
     */
    setupUploadArea() {
        const uploadArea = document.getElementById('selfie-upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <i class="bi bi-person-circle upload-icon"></i>
                    <h5>셀피 사진을 업로드하세요</h5>
                    <p class="text-muted">드래그 앤 드롭 또는 클릭하여 파일 선택</p>
                    <small class="text-muted">지원 형식: JPG, PNG (최대 5MB)</small>
                </div>
            `;
        }
    }
    
    /**
     * 파일 업로드 처리
     */
    async handleFileUpload(file) {
        try {
            debugLog('📁 셀피 파일 업로드 시작', file.name);
            
            if (!this.validateFile(file)) {
                return;
            }
            
            this.file = file;
            UIManager.showFilePreview(file, 'selfie-upload-area');
            this.showCompletionForm();
            
        } catch (error) {
            debugLog('❌ 셀피 파일 업로드 오류', error);
            UIManager.showError('업로드 오류', APIManager.handleApiError(error, '셀피 업로드'));
        }
    }    
    /**
     * 파일 유효성 검사
     */
    validateFile(file) {
        // 셀피는 이미지만 허용
        if (!Utils.validateFileType(file, CONFIG.FILE_LIMITS.SELFIE_TYPES)) {
            UIManager.showError('지원하지 않는 파일 형식', 'JPG, PNG 파일만 업로드 가능합니다.');
            return false;
        }
        
        // 셀피는 5MB 제한
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!Utils.validateFileSize(file, maxSize)) {
            UIManager.showError('파일 크기 초과', `파일 크기는 ${Utils.formatFileSize(maxSize)} 이하여야 합니다.`);
            return false;
        }
        
        return true;
    }
    
    /**
     * 완료 폼 표시
     */
    showCompletionForm() {
        const container = document.getElementById('selfie-completion-form');
        if (!container) return;
        
        // 이전 단계 데이터 요약 표시
        const passportData = AppState.data.passport || {};
        const licenseData = AppState.data.license || {};
        
        container.innerHTML = `
            <div class="completion-form">
                <h5><i class="bi bi-check-circle text-success"></i> 모든 정보가 수집되었습니다!</h5>
                
                <div class="summary-card">
                    <h6>수집된 정보 요약</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <strong>개인정보 (여권)</strong>
                            <ul class="list-unstyled mt-2">
                                <li>• 성명: ${passportData.fullName || 'N/A'}</li>
                                <li>• 생년월일: ${passportData.dateOfBirth || 'N/A'}</li>
                                <li>• 성별: ${passportData.gender || 'N/A'}</li>
                                <li>• 국적: ${passportData.nationality || 'N/A'}</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <strong>주소정보 (라이센스)</strong>
                            <ul class="list-unstyled mt-2">
                                <li>• 영문 주소: ${licenseData.translatedAddress ? licenseData.translatedAddress.substring(0, 50) + '...' : 'N/A'}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    <strong>다음 단계:</strong> 모든 정보를 확인한 후 KYC 문서와 이미지들이 포함된 ZIP 파일을 생성합니다.
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-secondary" id="selfie-back-button">
                        <i class="bi bi-arrow-left"></i> 이전: 라이센스
                    </button>
                    <div>
                        <button type="button" class="btn btn-outline-secondary me-2" id="selfie-retry-button">
                            <i class="bi bi-arrow-clockwise"></i> 다시 업로드
                        </button>
                        <button type="button" class="btn btn-success" id="selfie-next-button">
                            문서 생성 및 다운로드 <i class="bi bi-download"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showElement('selfie-completion-form');
        this.isCompleted = true;
        
        // 이벤트 리스너 추가
        this.setupCompletionButtons();
    }
    
    /**
     * 완료 폼 버튼 이벤트 리스너 설정
     */
    setupCompletionButtons() {
        // 이전 버튼
        const backButton = document.getElementById('selfie-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.goBack();
            });
        }
        
        // 다시 업로드 버튼
        const retryButton = document.getElementById('selfie-retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.resetStep();
            });
        }
        
        // 다음 단계 버튼
        const nextButton = document.getElementById('selfie-next-button');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.proceedToNext();
            });
        }
    }
    
    /**
     * 다음 단계로 진행 (최종 검토 단계)
     */
    proceedToNext() {
        if (!this.file) {
            UIManager.showAlert('error', '파일 오류', '셀피 사진을 먼저 업로드해주세요.');
            return;
        }
        
        // AppState에 셀피 파일 저장
        AppState.files.selfie = this.file;
        this.isCompleted = true;
        
        debugLog('✅ 셀피 단계 완료');
        
        // 성공 메시지 표시 후 최종 검토 단계로 이동
        UIManager.showAlert('success', '모든 파일 업로드 완료', '최종 검토 후 문서를 생성합니다.')
            .then(() => {
                if (window.workflowManager) {
                    window.workflowManager.goToStep(CONFIG.STEPS.REVIEW);
                }
            });
    }
    
    /**
     * 이전 단계로 돌아가기
     */
    goBack() {
        if (window.workflowManager) {
            window.workflowManager.goToStep(CONFIG.STEPS.LICENSE);
        }
        
        // AppState에 셀피 저장
        AppState.files.selfie = this.file;
        
        debugLog('✅ 셀피 업로드 완료');
    }    
    /**
     * 다음 단계로 진행 (문서 생성)
     */
    async proceedToNext() {
        if (!this.isCompleted || !this.file) {
            UIManager.showWarning('파일 확인', '셀피 사진을 업로드해주세요.');
            return;
        }
        
        // AppState에 셀피 저장 (중요!)
        AppState.files.selfie = this.file;
        
        debugLog('✅ 셀피 단계 완료, 문서 생성 시작');
        debugLog('💾 셀피 파일 저장됨:', this.file.name);
        
        if (window.workflowManager) {
            window.workflowManager.goToStep(CONFIG.STEPS.REVIEW);
        }
    }
    
    /**
     * 이전 단계로 돌아가기
     */
    goBack() {
        if (window.workflowManager) {
            window.workflowManager.goToStep(CONFIG.STEPS.LICENSE);
        }
        
        // AppState에 셀피 저장
        AppState.files.selfie = this.file;
        
        debugLog('✅ 이전 단계로 이동');
    }
    
    /**
     * 단계 초기화
     */
    resetStep() {
        this.file = null;
        this.isCompleted = false;
        
        UIManager.clearContainer('selfie-completion-form');
        UIManager.hideElement('selfie-completion-form');
        this.setupUploadArea();
        
        // AppState에서 셀피 제거
        AppState.files.selfie = null;
        
        debugLog('🔄 셀피 단계 초기화');
    }
    
    /**
     * 단계 완료 여부 확인
     */
    isStepCompleted() {
        return this.isCompleted && this.file !== null;
    }
}

// 전역으로 클래스 노출  
window.SelfieStep = SelfieStep;