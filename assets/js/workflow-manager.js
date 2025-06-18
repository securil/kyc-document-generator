/**
 * KYC Document Generator v3.0 - Workflow Manager
 * 전체 워크플로우를 관리하는 메인 컨트롤러
 */

class WorkflowManager {
    constructor() {
        this.currentStep = CONFIG.STEPS.PASSPORT;
        this.components = {};
        
        this.init();
    }
    
    /**
     * 워크플로우 매니저 초기화
     */
    init() {
        debugLog('🚀 워크플로우 매니저 초기화');
        
        try {
            // 컴포넌트 인스턴스 생성
            this.components = {
                passport: new window.PassportStep(),
                license: new window.LicenseStep(),
                selfie: new window.SelfieStep(),
                review: new window.ReviewStep()
            };
            
            // 초기 상태 설정
            this.goToStep(CONFIG.STEPS.PASSPORT);
            
            // 전역에서 접근 가능하도록 설정
            window.workflowManager = this;
            
            debugLog('✅ 워크플로우 매니저 초기화 완료');
        } catch (error) {
            debugLog('❌ 워크플로우 초기화 오류', error);
            console.error('컴포넌트 초기화 실패:', error);
        }
    }
    
    /**
     * 특정 단계로 이동
     */
    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > 4) {
            debugLog('❌ 잘못된 단계 번호', stepNumber);
            return;
        }
        
        // 이전 단계 검증 (뒤로 가는 경우는 제외)
        if (stepNumber > this.currentStep) {
            if (!this.validatePreviousSteps(stepNumber)) {
                debugLog('❌ 이전 단계 미완료로 이동 불가', stepNumber);
                return;
            }
        }
        
        this.currentStep = stepNumber;
        
        // UI 업데이트
        this.updateUI(stepNumber);
        
        // 단계별 특수 처리
        this.handleStepSpecialActions(stepNumber);
        
        debugLog(`📍 단계 이동: ${stepNumber} (${CONFIG.STEP_TITLES[stepNumber]})`);
    }
    
    /**
     * 이전 단계들 완료 여부 검증
     */
    validatePreviousSteps(targetStep) {
        if (targetStep <= CONFIG.STEPS.PASSPORT) return true;
        
        if (targetStep >= CONFIG.STEPS.LICENSE) {
            if (!this.components.passport.isStepCompleted()) {
                UIManager.showWarning('단계 확인', '여권 정보를 먼저 완료해주세요.');
                return false;
            }
        }
        
        if (targetStep >= CONFIG.STEPS.SELFIE) {
            if (!this.components.license.isStepCompleted()) {
                UIManager.showWarning('단계 확인', '라이센스 정보를 먼저 완료해주세요.');
                return false;
            }
        }
        
        if (targetStep >= CONFIG.STEPS.REVIEW) {
            if (!this.components.selfie.isStepCompleted()) {
                UIManager.showWarning('단계 확인', '셀피 사진을 먼저 업로드해주세요.');
                return false;
            }
        }
        
        return true;
    }    
    /**
     * UI 업데이트 (누적 표시 방식)
     */
    updateUI(stepNumber) {
        // 단계 표시기 업데이트
        UIManager.updateStepIndicator(stepNumber);
        
        // 현재 단계까지 모든 컨테이너 표시하되, 완료된 단계는 읽기 전용으로 설정
        this.showStepsUpTo(stepNumber);
        
        // 현재 단계 컨테이너로 스크롤
        const containerIds = {
            [CONFIG.STEPS.PASSPORT]: 'passport-container',
            [CONFIG.STEPS.LICENSE]: 'license-container', 
            [CONFIG.STEPS.SELFIE]: 'selfie-container',
            [CONFIG.STEPS.REVIEW]: 'review-container'
        };
        
        const containerId = containerIds[stepNumber];
        if (containerId) {
            UIManager.scrollToElement(containerId, 100);
        }
    }
    
    /**
     * 현재 단계까지 모든 단계 표시 (누적 방식)
     */
    showStepsUpTo(currentStep) {
        const stepContainers = {
            [CONFIG.STEPS.PASSPORT]: 'passport-container',
            [CONFIG.STEPS.LICENSE]: 'license-container', 
            [CONFIG.STEPS.SELFIE]: 'selfie-container',
            [CONFIG.STEPS.REVIEW]: 'review-container'
        };
        
        // 1부터 현재 단계까지 모든 컨테이너 표시
        for (let step = 1; step <= currentStep; step++) {
            const containerId = stepContainers[step];
            if (containerId) {
                UIManager.showElement(containerId);
                
                // 완료된 단계는 읽기 전용으로 변경
                if (step < currentStep) {
                    this.makeStepReadOnly(containerId, step);
                }
            }
        }
        
        // 현재 단계보다 뒤의 컨테이너는 숨김
        for (let step = currentStep + 1; step <= 4; step++) {
            const containerId = stepContainers[step];
            if (containerId) {
                UIManager.hideElement(containerId);
            }
        }
    }
    
    /**
     * 완료된 단계를 읽기 전용으로 변경
     */
    makeStepReadOnly(containerId, stepNumber) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 카드 헤더에 완료 표시 추가
        const cardHeader = container.querySelector('.card-header h4');
        if (cardHeader && !cardHeader.innerHTML.includes('✅')) {
            cardHeader.innerHTML = `✅ ${cardHeader.innerHTML}`;
        }
        
        // 카드 스타일을 완료된 것으로 변경
        const card = container.querySelector('.card');
        if (card) {
            card.style.backgroundColor = '#f8f9fa';
            card.style.borderColor = '#28a745';
        }
        
        // 모든 입력 요소 비활성화
        const inputs = container.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            if (input.type !== 'file') { // 파일 입력은 숨김
                input.disabled = true;
            }
        });
        
        // 업로드 영역 비활성화
        const uploadArea = container.querySelector('.upload-area');
        if (uploadArea) {
            uploadArea.style.pointerEvents = 'none';
            uploadArea.style.opacity = '0.7';
        }
        
        // 파일 입력 숨김
        const fileInputs = container.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.style.display = 'none';
        });
    }
    
    /**
     * 단계별 특수 액션 처리
     */
    handleStepSpecialActions(stepNumber) {
        switch(stepNumber) {
            case CONFIG.STEPS.PASSPORT:
                // 여권 단계 - 특별한 액션 없음
                break;
                
            case CONFIG.STEPS.LICENSE:
                // 라이센스 단계 - 여권 데이터가 있는지 확인
                if (!AppState.data.passport) {
                    debugLog('⚠️ 여권 데이터 없음, 1단계로 이동');
                    this.goToStep(CONFIG.STEPS.PASSPORT);
                    return;
                }
                break;
                
            case CONFIG.STEPS.SELFIE:
                // 셀피 단계 - 이전 데이터 확인
                if (!AppState.data.passport || !AppState.data.license) {
                    debugLog('⚠️ 이전 단계 데이터 없음');
                    this.goToStep(CONFIG.STEPS.PASSPORT);
                    return;
                }
                break;
                
            case CONFIG.STEPS.REVIEW:
                // 검토 단계 - 검토 페이지 생성
                if (this.components.review) {
                    this.components.review.showReviewPage();
                }
                break;
        }
    }
    
    /**
     * 다음 단계로 이동
     */
    nextStep() {
        if (this.currentStep < 4) {
            this.goToStep(this.currentStep + 1);
        }
    }
    
    /**
     * 이전 단계로 이동
     */
    previousStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }
    
    /**
     * 처음부터 다시 시작
     */
    restart() {
        // 확인 대화상자
        UIManager.showConfirm(
            '처음부터 다시 시작',
            '모든 입력된 정보가 삭제됩니다. 계속하시겠습니까?',
            {
                confirmButtonText: '다시 시작',
                cancelButtonText: '취소'
            }
        ).then((result) => {
            if (result.isConfirmed) {
                this.resetAllData();
                this.goToStep(CONFIG.STEPS.PASSPORT);
                UIManager.showSuccess('초기화 완료', '처음부터 다시 시작합니다.');
            }
        });
    }
    
    /**
     * 모든 데이터 초기화
     */
    resetAllData() {
        // AppState 초기화
        AppState.currentStep = 1;
        AppState.data = {
            passport: null,
            license: null,
            selfie: null
        };
        AppState.files = {
            passport: null,
            license: null,
            selfie: null
        };
        AppState.apiResults = {
            passport: null,
            license: null
        };
        
        // 각 컴포넌트 초기화
        if (this.components.passport) this.components.passport.resetStep();
        if (this.components.license) this.components.license.resetStep();
        if (this.components.selfie) this.components.selfie.resetStep();
        
        debugLog('🔄 모든 데이터 초기화 완료');
    }
    
    /**
     * 현재 진행 상태 반환
     */
    getProgress() {
        const completedSteps = [];
        
        if (this.components.passport && this.components.passport.isStepCompleted()) {
            completedSteps.push('passport');
        }
        if (this.components.license && this.components.license.isStepCompleted()) {
            completedSteps.push('license');
        }
        if (this.components.selfie && this.components.selfie.isStepCompleted()) {
            completedSteps.push('selfie');
        }
        if (this.components.review && this.components.review.isCompleted) {
            completedSteps.push('review');
        }
        
        return {
            currentStep: this.currentStep,
            completedSteps: completedSteps,
            progressPercentage: (completedSteps.length / 4) * 100
        };
    }
}

// 전역으로 클래스 노출
window.WorkflowManager = WorkflowManager;