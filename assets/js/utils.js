/**
 * KYC Document Generator v3.0 - Utilities
 * 공통 유틸리티 함수들
 */

class Utils {
    /**
     * 파일 크기를 읽기 쉬운 형태로 변환
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 파일 확장자 추출
     */
    static getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    /**
     * 이미지 파일 여부 확인
     */
    static isImageFile(file) {
        return file.type.startsWith('image/');
    }
    
    /**
     * PDF 파일 여부 확인
     */
    static isPdfFile(file) {
        return file.type === 'application/pdf';
    }
    
    /**
     * 파일 형식 유효성 검사
     */
    static validateFileType(file, allowedTypes) {
        return allowedTypes.includes(file.type);
    }
    
    /**
     * 파일 크기 유효성 검사
     */
    static validateFileSize(file, maxSize) {
        return file.size <= maxSize;
    }
    
    /**
     * 날짜 형식 변환 (YYYY-MM-DD)
     */
    static formatDate(date) {
        if (!date) return '';
        if (typeof date === 'string') date = new Date(date);
        return date.toISOString().split('T')[0];
    }
    
    /**
     * 현재 날짜를 dd/mm/yyyy 형식으로 반환
     */
    static getCurrentDateFormatted() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    /**
     * 안전한 파일명 생성
     */
    static sanitizeFileName(name) {
        return name.replace(/[^a-zA-Z0-9._-]/g, '_');
    }
    
    /**
     * Base64로 파일 변환
     */
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * 딜레이 함수 (async/await 용)
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 깊은 복사
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * 빈 값 체크
     */
    static isEmpty(value) {
        return value === null || value === undefined || value === '';
    }
    
    /**
     * 문자열 안전 변환
     */
    static safeString(value) {
        return value ? String(value).trim() : '';
    }
}

// 전역으로 클래스 노출
window.Utils = Utils;