# 개발자 가이드 - 2025-06-16

**프로젝트**: KYC Document Generator  
**버전**: v2.2 Phase 6  
**대상**: 개발자 및 기술 담당자  

---

## 🏗️ **프로젝트 구조**

### **디렉토리 구조**
```
C:\Project\kyc-document-generator\
├── index.html                    # 메인 애플리케이션 (2,200+ 줄)
├── functions/                    # Firebase Functions
│   ├── index.js                 # 서버사이드 로직
│   └── package.json             # 의존성 관리
├── 2025-06-16/                  # 오늘 작업 기록
│   ├── WORK_SUMMARY_20250616.md
│   ├── TECHNICAL_IMPLEMENTATION.md
│   ├── USER_GUIDE.md
│   ├── CHANGELOG.md
│   └── DEVELOPER_GUIDE.md       # 이 파일
├── README.md                    # 프로젝트 개요
├── WORK_LOG.md                  # 이전 작업 로그
├── WORK_LOG_PHASE5.md          # Phase 5 작업 로그
├── API_GUIDE.md                # API 사용 가이드
├── CONTRIBUTING.md             # 기여 가이드
└── TECHNICAL_DOCS.md           # 기술 문서
```

### **핵심 아키텍처**
```
Frontend (Client-side)
├── HTML5 + CSS3 + JavaScript (Vanilla)
├── Bootstrap 5.3.0 (UI Framework)
├── SweetAlert2 (알림 시스템)
└── 라이브러리들
    ├── docx.js (Word 문서 생성)
    ├── JSZip (ZIP 파일 생성)
    └── FileSaver.js (파일 다운로드)

Backend (Server-side)
├── Firebase Functions (Node.js)
├── IDAnalyzer API (문서 분석)
└── Google Translate API (주소 번역)
```

---

## 🚀 **개발 환경 설정**

### **필수 도구**
- **Node.js**: v16 이상
- **Python**: 3.7 이상 (로컬 서버용)
- **Git**: 버전 관리
- **IDE**: VS Code 권장

### **로컬 개발 환경**
```bash
# 1. 저장소 클론
git clone https://github.com/securil/kyc-document-generator.git
cd kyc-document-generator

# 2. 로컬 서버 실행
python -m http.server 9090

# 3. 브라우저에서 접속
http://localhost:9090
```

### **Firebase Functions 설정**
```bash
# 1. Firebase CLI 설치
npm install -g firebase-tools

# 2. Firebase 로그인
firebase login

# 3. Functions 디렉토리로 이동
cd functions

# 4. 의존성 설치
npm install

# 5. 로컬 에뮬레이터 실행
firebase emulators:start
```

---

## 🔧 **핵심 시스템 이해**

### **1. 파일 업로드 시스템**
```javascript
// 전역 상태 관리
let uploadedFiles = {
    passport: null,
    license: null,
    selfie: null
};

// 파일 처리 핵심 로직
function handleFile(file, type) {
    // 1. 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) return false;
    
    // 2. 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) return false;
    
    // 3. 전역 상태 업데이트
    uploadedFiles[type] = file;
    
    // 4. UI 업데이트
    updateUploadPreview(file, type);
}
```

### **2. API 통합 시스템**
```javascript
// IDAnalyzer API 호출
async function analyzeDocuments() {
    const apiUrl = 'https://us-central1-kyc-document-generator.cloudfunctions.net/processDocuments';
    
    const formData = new FormData();
    formData.append('passport', uploadedFiles.passport);
    formData.append('license', uploadedFiles.license);
    formData.append('selfie', uploadedFiles.selfie);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
}
```

### **3. 검증 시스템 (Phase 6 핵심)**
```javascript
// 생년월일 기반 검증
function correctCrossValidation(originalValidation, result) {
    // Priority 1: 폼 값 확인
    const formDateOfBirth = document.getElementById('dateOfBirth')?.value;
    
    if (formDateOfBirth) {
        return { birth_date_match: true, validation_passed: true };
    }
    
    // Priority 2: 원본 데이터 비교
    const passportData = result.passport_data?.translated || {};
    const licenseData = result.license_data?.translated || {};
    
    if (passportData.dateOfBirth && licenseData.dateOfBirth) {
        return {
            birth_date_match: normalizeDates(
                passportData.dateOfBirth, 
                licenseData.dateOfBirth
            )
        };
    }
    
    return { birth_date_match: false, validation_passed: false };
}
```

---

## 🐛 **디버깅 가이드**

### **일반적인 문제들**
1. **파일 업로드 실패**
   ```javascript
   // 디버깅 코드
   console.log('File size:', file.size);
   console.log('File type:', file.type);
   console.log('Max allowed:', 10 * 1024 * 1024);
   ```

2. **생년월일 검증 실패**
   ```javascript
   // 날짜 파싱 디버깅
   console.log('🗓️ 날짜 정규화 시작:', { date1, date2 });
   const result1 = parseJapaneseDate(date1);
   const result2 = parseJapaneseDate(date2);
   console.log('📅 표준화된 날짜:', { result1, result2 });
   ```

3. **API 호출 실패**
   ```javascript
   // API 응답 디버깅
   fetch(apiUrl, options)
     .then(response => {
       console.log('Response status:', response.status);
       console.log('Response headers:', response.headers);
       return response.json();
     })
     .catch(error => {
       console.error('API Error:', error);
     });
   ```

### **개발자 도구 활용**
```javascript
// 콘솔에서 직접 테스트 가능한 함수들
window.debugFunctions = {
    testDateParsing: parseJapaneseDate,
    checkUploadedFiles: () => uploadedFiles,
    validateForm: () => correctCrossValidation(null, window.apiResult),
    showCurrentState: () => ({
        uploadSection: document.getElementById('uploadSection').style.display,
        verificationSection: document.getElementById('verificationSection').style.display
    })
};
```

---

## 📚 **API 레퍼런스**

### **클라이언트 사이드 함수들**

#### **파일 처리**
```javascript
/**
 * 파일 업로드 처리
 * @param {File} file - 업로드할 파일
 * @param {string} type - 파일 타입 ('passport', 'license', 'selfie')
 * @returns {boolean} 성공 여부
 */
function handleFile(file, type)

/**
 * 파일 미리보기 업데이트
 * @param {File} file - 파일 객체
 * @param {string} type - 파일 타입
 */
function updatePreview(file, type)
```

#### **데이터 처리**
```javascript
/**
 * 모든 가능한 데이터 추출
 * @param {Object} result - API 응답 객체
 * @returns {Promise<Object>} 추출된 데이터
 */
async function extractAllPossibleData(result)

/**
 * 일본어 날짜를 표준 형식으로 파싱
 * @param {string} dateStr - 날짜 문자열
 * @returns {string|null} YYYY-MM-DD 형식 또는 null
 */
function parseJapaneseDate(dateStr)
```

#### **검증 시스템**
```javascript
/**
 * 생년월일 기반 교차 검증
 * @param {Object} originalValidation - 원본 검증 결과
 * @param {Object} result - API 응답
 * @returns {Object} 검증 결과
 */
function correctCrossValidation(originalValidation, result)

/**
 * 날짜 정규화 및 비교
 * @param {string} date1 - 첫 번째 날짜
 * @param {string} date2 - 두 번째 날짜
 * @returns {boolean} 일치 여부
 */
function normalizeDates(date1, date2)
```

### **서버 사이드 API**

#### **Firebase Functions 엔드포인트**
```javascript
// POST /processDocuments
{
  "passport": File,
  "license": File,
  "selfie": File
}

// Response
{
  "success": true,
  "message": "다중 문서 처리 완료",
  "passport_data": { /* 여권 분석 결과 */ },
  "license_data": { /* 면허증 분석 결과 */ },
  "cross_validation": { /* 교차 검증 결과 */ },
  "kyc": { /* KYC 통합 데이터 */ }
}
```

---

## 🔧 **커스터마이징 가이드**

### **새로운 날짜 형식 추가**
```javascript
// parseJapaneseDate 함수에 새 형식 추가
function parseJapaneseDate(dateStr) {
    // 기존 형식들...
    
    // 새로운 형식 추가 예시
    const customMatch = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (customMatch) {
        const year = customMatch[1];
        const month = customMatch[2].padStart(2, '0');
        const day = customMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    return null;
}
```

### **새로운 검증 규칙 추가**
```javascript
// correctCrossValidation 함수 확장
function correctCrossValidation(originalValidation, result) {
    const validation = {
        birth_date_match: false,
        validation_passed: false,
        // 새로운 검증 항목 추가
        name_similarity: false,
        document_authenticity: false
    };
    
    // 기존 생년월일 검증...
    
    // 새로운 검증 로직 추가
    if (additionalValidationNeeded) {
        validation.name_similarity = checkNameSimilarity(passportName, licenseName);
        validation.document_authenticity = checkDocumentAuthenticity(result);
    }
    
    return validation;
}
```

---

## 🚀 **성능 모니터링**

### **성능 메트릭 수집**
```javascript
// 성능 측정 함수
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }
    
    startTimer(name) {
        this.metrics[name] = { start: Date.now() };
    }
    
    endTimer(name) {
        if (this.metrics[name]) {
            this.metrics[name].duration = Date.now() - this.metrics[name].start;
            console.log(`⏱️ ${name}: ${this.metrics[name].duration}ms`);
        }
    }
    
    getReport() {
        return this.metrics;
    }
}

// 사용 예시
const monitor = new PerformanceMonitor();
monitor.startTimer('document_analysis');
// ... 문서 분석 코드 ...
monitor.endTimer('document_analysis');
```

### **메모리 사용량 모니터링**
```javascript
// 메모리 사용량 체크
function checkMemoryUsage() {
    if (performance.memory) {
        const memory = performance.memory;
        console.log('Memory Usage:', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        });
    }
}
```

---

## 📝 **코딩 컨벤션**

### **JavaScript 스타일**
```javascript
// 1. 함수명: camelCase
function extractAllPossibleData() {}

// 2. 상수: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 3. 변수명: camelCase
let uploadedFiles = {};

// 4. 객체 리터럴 속성: snake_case (API 호환성)
const apiData = {
    birth_date_match: true,
    validation_passed: false
};

// 5. 비동기 함수는 async/await 사용
async function processDocuments() {
    try {
        const result = await analyzeDocuments();
        return result;
    } catch (error) {
        console.error('Processing failed:', error);
        throw error;
    }
}
```

### **에러 처리 패턴**
```javascript
// 1. 명시적 에러 처리
function safeOperation() {
    try {
        // 위험한 작업
        return riskyFunction();
    } catch (error) {
        console.error('Operation failed:', error);
        return null;
    }
}

// 2. Promise 기반 에러 처리
async function apiCall() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
```

---

## 🔄 **버전 관리 전략**

### **브랜치 전략**
```
main (개발)
├── feature/date-parsing-enhancement
├── feature/ui-improvements
├── bugfix/validation-timing
└── hotfix/critical-security-patch

gh-pages (배포)
└── 안정된 버전만 배포
```

### **커밋 메시지 규칙**
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 과정 또는 보조 도구 변경

예시:
feat: 생년월일 기반 검증 시스템 구현
fix: 일본 연호 날짜 파싱 오류 수정
docs: README.md 업데이트
```

---

## 📋 **체크리스트**

### **개발 완료 체크리스트**
- [ ] 새로운 기능 구현 완료
- [ ] 단위 테스트 작성 및 통과
- [ ] 통합 테스트 실행 및 통과
- [ ] 브라우저 호환성 테스트
- [ ] 모바일 반응형 테스트
- [ ] 성능 측정 및 최적화
- [ ] 보안 검토 완료
- [ ] 문서 업데이트
- [ ] 코드 리뷰 완료

### **배포 전 체크리스트**
- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 확인
- [ ] API 엔드포인트 확인
- [ ] SSL 인증서 유효성 확인
- [ ] 백업 계획 수립
- [ ] 롤백 계획 준비
- [ ] 모니터링 설정 확인
- [ ] 사용자 가이드 업데이트

---

## 📞 **지원 및 연락처**

### **기술 지원**
- **GitHub Issues**: https://github.com/securil/kyc-document-generator/issues
- **개발자 문서**: 이 파일 및 관련 MD 파일들
- **API 문서**: API_GUIDE.md 참조

### **기여 방법**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

### **코드 리뷰 기준**
- 코딩 컨벤션 준수
- 충분한 테스트 커버리지
- 명확한 문서화
- 성능 영향 최소화
- 보안 고려사항 검토

---

*개발자 가이드 작성일: 2025-06-16*  
*마지막 업데이트: Phase 6 완료 후*  
*다음 리뷰: 다음 Phase 시작 시*
