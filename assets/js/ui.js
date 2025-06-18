/**
 * KYC Document Generator v3.0 - UI Manager
 * 모든 UI 조작을 담당하는 모듈
 */

class UIManager {
    /**
     * 단계 표시기 업데이트
     */
    static updateStepIndicator(currentStep) {
        const steps = document.querySelectorAll('.step');
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const stepCircle = step.querySelector('.step-circle');
            const stepText = step.querySelector('.step-text');
            
            // 현재 단계 이전은 완료 상태
            if (stepNumber < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
                stepCircle.innerHTML = '<i class="bi bi-check"></i>';
            }
            // 현재 단계는 활성 상태  
            else if (stepNumber === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
                stepCircle.innerHTML = stepNumber;
            }
            // 다음 단계들은 비활성 상태
            else {
                step.classList.remove('active', 'completed');
                stepCircle.innerHTML = stepNumber;
            }
        });
        
        AppState.currentStep = currentStep;
        debugLog(`📍 단계 변경: ${currentStep}`);
    }
    
    /**
     * 진행률 표시
     */
    static showProgress(percentage, message) {
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        const progressMessage = document.getElementById('progress-message');
        
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        if (progressMessage) {
            progressMessage.textContent = message;
        }
        
        debugLog(`📊 진행률: ${percentage}% - ${message}`);
    }
    
    /**
     * 진행률 숨기기
     */
    static hideProgress() {
        const progressContainer = document.getElementById('progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }
    
    /**
     * 범용 알림 표시 (여러 타입 지원)
     */
    static showAlert(type, title, message, options = {}) {
        const iconMap = {
            'success': 'success',
            'error': 'error', 
            'warning': 'warning',
            'info': 'info',
            'loading': 'info'
        };
        
        const colorMap = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107', 
            'info': '#17a2b8',
            'loading': '#007bff'
        };
        
        if (type === 'loading') {
            return Swal.fire({
                title: title,
                text: message,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                ...options
            });
        } else {
            return Swal.fire({
                icon: iconMap[type] || 'info',
                title: title,
                text: message,
                confirmButtonText: '확인',
                confirmButtonColor: colorMap[type] || '#007bff',
                ...options
            });
        }
    }
    
    /**
     * 성공 메시지 표시
     */
    static showSuccess(title, message, options = {}) {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            confirmButtonText: '확인',
            confirmButtonColor: '#28a745',
            ...options
        });
    }
    
    /**
     * 오류 메시지 표시
     */
    static showError(title, message, options = {}) {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonText: '확인',
            confirmButtonColor: '#dc3545',
            ...options
        });
    }
    
    /**
     * 경고 메시지 표시
     */
    static showWarning(title, message, options = {}) {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: message,
            confirmButtonText: '확인',
            confirmButtonColor: '#ffc107',
            ...options
        });
    }
    
    /**
     * 확인 대화상자 표시
     */
    static showConfirm(title, message, options = {}) {
        return Swal.fire({
            icon: 'question',
            title: title,
            text: message,
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#6c757d',
            ...options
        });
    }
    
    /**
     * 로딩 표시
     */
    static showLoading(title = '처리 중...', message = '잠시만 기다려주세요') {
        return Swal.fire({
            title: title,
            text: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
    
    /**
     * 로딩 숨기기
     */
    static hideLoading() {
        Swal.close();
    }
    
    /**
     * 파일 미리보기 표시
     */
    static showFilePreview(file, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const previewHtml = `
            <div class="file-preview">
                <div class="file-info">
                    <i class="bi bi-file-earmark-image text-primary"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${Utils.formatFileSize(file.size)})</span>
                </div>
                ${Utils.isImageFile(file) ? 
                    `<img src="${URL.createObjectURL(file)}" class="preview-image" alt="미리보기">` :
                    `<div class="pdf-preview"><i class="bi bi-file-pdf text-danger"></i><span>PDF 파일</span></div>`
                }
            </div>
        `;
        
        container.innerHTML = previewHtml;
    }
    
    /**
     * 컨테이너 내용 지우기
     */
    static clearContainer(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
    
    /**
     * 요소 표시/숨김
     */
    static showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }
    
    static hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }
    
    /**
     * 스크롤을 특정 요소로 이동
     */
    static scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }
}

// 전역 UIManager 인스턴스 생성
window.UIManager = new UIManager();