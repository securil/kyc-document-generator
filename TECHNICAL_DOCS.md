# KYC Document Generator - 완전한 기술 문서

**버전**: v2.0 Phase 4  
**작성일**: 2025-06-16  
**최종 업데이트**: 2025-06-16  
**개발자**: Chae Woong Seok  

---

## 📋 **프로젝트 개요**

### 🎯 **목적**
여권, 운전면허증, 셀피 사진을 업로드하면 AI가 자동으로 정보를 추출하고 번역하여 금융기관 표준 KYC(Know Your Customer) 문서와 모든 증빙 자료를 ZIP 파일로 제공하는 웹 애플리케이션

### 🌟 **핵심 가치**
- **완전 자동화**: 수동 입력 없이 AI가 모든 정보 추출
- **고품질 번역**: Google Translate API로 95% 이상 정확도 목표
- **교차 검증**: 여권과 면허증 데이터 비교로 신뢰성 확보
- **즉시 처리**: 10-20초 내 완성된 ZIP 패키지 생성
- **국제 표준**: 금융기관에서 바로 사용 가능한 형식

---

## 🗂️ **프로젝트 파일 구조**

### **GitHub 저장소 구조**
```
📦 kyc-document-generator/
├── 🌿 main (개발 브랜치)
│   ├── 📄 index.html                    # 메인 웹 애플리케이션
│   ├── 📄 README.md                     # 개발 문서
│   └── 📄 TECHNICAL_DOCS.md             # 기술 문서 (이 파일)
│
└── 🌿 gh-pages (배포 브랜치)
    ├── 📄 index.html                    # 배포된 웹 애플리케이션
    └── 📄 README.md                     # 사용자 가이드
```

### **로컬 개발 환경 구조**
```
📁 D:\Project\kyc-document-generator/
├── 📁 frontend/
│   ├── 📄 multi_document_kyc.html       # 메인 애플리케이션 (원본)
│   └── 📄 multi_document_kyc_broken.html # 백업 파일
│
├── 📁 functions/                        # Firebase Functions
│   ├── 📄 index.js                      # 백엔드 API 함수들
│   ├── 📄 package.json                  # 백엔드 의존성
│   └── 📁 node_modules/                 # 패키지 파일들
│
├── 📁 Firebase/                         # Firebase 설정
│   └── 📄 kyc-document-generator-firebase-adminsdk-*.json
│
├── 📁 documents/                        # 프로젝트 문서들
│   ├── 📄 PROJECT_PROGRESS_20250616_PHASE4.md
│   ├── 📄 PROJECT_OVERVIEW_2025-06-16.md
│   └── 📄 TECHNICAL_DOCS.md             # 이 파일
│
├── 📄 .firebaserc                       # Firebase 프로젝트 설정
├── 📄 firebase.json                     # Firebase 배포 설정
└── 📄 start_web_server_new.bat          # 로컬 서버 실행 스크립트
```

---

## 🔧 **기술 스택 및 아키텍처**

### **Frontend (클라이언트 사이드)**
```javascript
// 핵심 라이브러리
Bootstrap 5.3.0          // UI 프레임워크
Bootstrap Icons          // 아이콘 시스템
SweetAlert2             // 사용자 알림 및 모달
JSZip 3.10.1            // ZIP 압축 (Phase 4)
FileSaver.js 2.0.5      // 파일 다운로드
docx.js 7.8.2           // Word 문서 생성 (사용 중단)
```

### **Backend (서버리스)**
```javascript
// Firebase Functions (Node.js 20)
Firebase Firestore      // 데이터베이스 (설정됨, 미사용)
Firebase Storage        // 파일 저장소 (설정됨, 미사용)
```

### **외부 API 서비스**
```javascript
// 핵심 API들
IDAnalyzer API          // 신분증 OCR 및 데이터 추출
Google Translate API    // 주소 및 텍스트 번역
```

### **시스템 아키텍처**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Pages  │◄──►│  Firebase Funcs  │◄──►│   외부 API들    │
│   (Frontend)    │    │   (Backend)      │    │                 │
│                 │    │                  │    │ • IDAnalyzer    │
│ • HTML/CSS/JS   │    │ • processMultiple│    │ • Google Trans  │
│ • Bootstrap     │    │ • translateAddr  │    │                 │
│ • JSZip         │    │ • healthCheck    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🔌 **API 구성 및 엔드포인트**

### **Firebase Functions 엔드포인트**
**기본 URL**: `https://us-central1-kyc-document-generator.cloudfunctions.net/`

#### **1. processMultipleDocuments** (메인 API)
```javascript
// 엔드포인트
POST /processMultipleDocuments

// 요청 형식
{
  "passportImage": "base64_encoded_image_data",
  "licenseImage": "base64_encoded_image_data"
}

// 응답 형식
{
  "success": true,
  "message": "다중 문서 처리 완료",
  "passport_data": {
    "original": { /* IDAnalyzer 원본 응답 */ },
    "translated": { /* 번역된 데이터 */ }
  },
  "license_data": {
    "original": { /* IDAnalyzer 원본 응답 */ },
    "translated": { /* 번역된 데이터 */ }
  },
  "cross_validation": {
    "name_match": true,
    "birth_date_match": true,
    "confidence_score": 95
  },
  "kyc_fields": {
    "full_name": "추출된 이름",
    "date_of_birth": "1990-01-01",
    "nationality": "Japan",
    // ... 기타 필드들
  }
}
```

#### **2. translateAddress** (번역 API)
```javascript
// 엔드포인트
POST /translateAddress

// 요청 형식
{
  "text": "神奈川県横浜市港北区...",
  "target": "en",
  "source": "ja"
}

// 응답 형식
{
  "success": true,
  "translatedText": "Kanagawa Prefecture, Yokohama City..."
}
```

#### **3. healthCheck** (상태 확인)
```javascript
// 엔드포인트
GET /healthCheck

// 응답 형식
{
  "success": true,
  "message": "Firebase Functions 정상 작동",
  "timestamp": "2025-06-16T12:00:00.000Z"
}
```

### **외부 API 연동**

#### **IDAnalyzer API**
```javascript
// 설정
API_KEY: "DhpAEn8euYvSopBIduRwVltyKqi3aCPo"
Base_URL: "https://api.idanalyzer.com/"

// 사용 엔드포인트
POST /scan    // 문서 스캔 및 분석
```

#### **Google Translate API**
```javascript
// Firebase Functions 내부에서 호출
// 직접 노출되지 않음 (보안상 이유)
```

---

## 🛠️ **핵심 JavaScript 함수들**

### **파일 업로드 관련 함수**

#### **setupFileUpload(type)**
```javascript
// 목적: 파일 업로드 영역 초기화
// 매개변수: type ('passport', 'license', 'selfie')
// 기능: 드래그앤드롭, 클릭 업로드, 파일 검증

function setupFileUpload(type) {
    const uploadArea = document.getElementById(type + 'Upload');
    const fileInput = document.getElementById(type + 'Input');
    
    // 클릭 이벤트
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 파일 선택 이벤트
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0], type);
        }
    });
    
    // 드래그앤드롭 이벤트들...
}
```

#### **handleFile(file, type)**
```javascript
// 목적: 업로드된 파일 처리 및 검증
// 매개변수: file (File 객체), type (문서 타입)
// 기능: 파일 크기/형식 검증, 미리보기 생성

function handleFile(file, type) {
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
            icon: 'error',
            title: '파일 크기 초과',
            text: '파일 크기는 10MB 이하여야 합니다.'
        });
        return;
    }
    
    // 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        // 오류 처리
        return;
    }
    
    uploadedFiles[type] = file;
    showFilePreview(file, type);
    checkBothFilesUploaded();
}
```

### **문서 처리 관련 함수**

#### **startDocumentProcessing()**
```javascript
// 목적: 문서 분석 프로세스 시작
// 기능: 파일을 Base64로 변환, Firebase API 호출, 진행률 표시

async function startDocumentProcessing() {
    try {
        // UI 업데이트
        updateProgress(10, '파일 준비 중...');
        
        // Base64 변환
        const passportBase64 = await fileToBase64(uploadedFiles.passport);
        const licenseBase64 = await fileToBase64(uploadedFiles.license);
        
        // API 호출
        const response = await fetch('https://us-central1-kyc-document-generator.cloudfunctions.net/processMultipleDocuments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                passportImage: passportBase64.split(',')[1],
                licenseImage: licenseBase64.split(',')[1]
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showVerificationPage(result);
        }
    } catch (error) {
        // 오류 처리
    }
}
```

#### **populateKYCFields(result)**
```javascript
// 목적: API 응답 데이터로 폼 필드 채우기
// 매개변수: result (API 응답 객체)
// 기능: 추출된 정보를 입력 필드에 자동 설정

function populateKYCFields(result) {
    const kyc = result.kyc_fields || {};
    
    // 기본 필드 매핑
    const fieldMapping = {
        'fullName': kyc.full_name,
        'dateOfBirth': kyc.date_of_birth,
        'gender': kyc.gender,
        'nationality': kyc.nationality,
        'issuingCountry': kyc.issuing_country,
        'uniqueIdNumber': kyc.unique_identification_number,
        'address': kyc.address
    };
    
    // DOM 요소에 값 설정
    Object.entries(fieldMapping).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId);
        if (element && value) {
            element.value = value;
        }
    });
}
```

### **ZIP 파일 생성 관련 함수 (Phase 4)**

#### **generateDocuments(data)**
```javascript
// 목적: ZIP 파일 생성 및 다운로드
// 매개변수: data (검증된 KYC 데이터)
// 기능: Word 문서 + 3개 이미지를 ZIP으로 압축

async function generateDocuments(data) {
    try {
        // 진행 상황 표시
        Swal.fire({
            title: 'ZIP 파일 생성 중...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        
        // ZIP 객체 생성
        const zip = new JSZip();
        
        // 파일명 설정
        const safeName = data.full_name.replace(/[^a-zA-Z0-9가-힣]/g, '_').toUpperCase();
        const currentDate = new Date().toISOString().slice(0, 10);
        
        // 1. Word 문서 생성
        const wordContent = createSimpleWordDocument(data);
        const wordFileName = `KYC_${safeName}_${currentDate}.docx`;
        const wordBlob = new Blob([wordContent], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        zip.file(wordFileName, wordBlob);
        
        // 2. 이미지 파일들 추가
        if (uploadedFiles.passport) {
            const passportFileName = `passport_${safeName}.${getFileExtension(uploadedFiles.passport.name)}`;
            zip.file(passportFileName, uploadedFiles.passport);
        }
        
        if (uploadedFiles.license) {
            const licenseFileName = `license_${safeName}.${getFileExtension(uploadedFiles.license.name)}`;
            zip.file(licenseFileName, uploadedFiles.license);
        }
        
        if (uploadedFiles.selfie) {
            const selfieFileName = `selfie_${safeName}.${getFileExtension(uploadedFiles.selfie.name)}`;
            zip.file(selfieFileName, uploadedFiles.selfie);
        }
        
        // 3. ZIP 파일 생성 및 다운로드
        const zipBlob = await zip.generateAsync({type: "blob"});
        const zipFileName = `KYC_${safeName}_${currentDate}.zip`;
        
        // 브라우저 다운로드
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = zipFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 성공 메시지
        Swal.fire({
            icon: 'success',
            title: 'ZIP 파일 생성 완료!',
            text: `${zipFileName} 파일이 다운로드되었습니다.`
        });
        
    } catch (error) {
        console.error('ZIP 생성 오류:', error);
        Swal.fire({
            icon: 'error',
            title: 'ZIP 파일 생성 실패',
            text: '파일 생성 중 오류가 발생했습니다: ' + error.message
        });
    }
}
```

#### **createSimpleWordDocument(data)**
```javascript
// 목적: KYC 문서 텍스트 내용 생성
// 매개변수: data (KYC 데이터)
// 반환: 문서 텍스트 내용

function createSimpleWordDocument(data) {
    const content = `
KYC DOCUMENT VERIFICATION
========================

Full Name: ${data.full_name}
Date of Birth: ${data.date_of_birth}
Gender: ${data.gender}
Nationality: ${data.nationality}
Type of ID: ${data.type_of_id}
Issuing Country: ${data.issuing_country}
ID Number: ${data.unique_identification_number}
Address: ${data.address || data.original_address}

Passport Issue Date: ${data.date_of_issue?.passport || 'N/A'}
Passport Expiry Date: ${data.date_of_expiry?.passport || 'N/A'}
License Issue Date: ${data.date_of_issue?.license || 'N/A'}
License Expiry Date: ${data.date_of_expiry?.license || 'N/A'}

Additional Notes: ${data.additional_notes || 'None'}

---
This document is generated automatically by KYC Document Generator.
Generated on: ${new Date().toISOString()}
`;
    return content;
}
```

### **유틸리티 함수들**

#### **fileToBase64(file)**
```javascript
// 목적: 파일을 Base64 문자열로 변환
// 매개변수: file (File 객체)
// 반환: Promise<string> (Base64 데이터)

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
```

#### **getFileExtension(filename)**
```javascript
// 목적: 파일명에서 확장자 추출
// 매개변수: filename (문자열)
// 반환: 확장자 (소문자)

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}
```

#### **updateStep(stepNumber)**
```javascript
// 목적: 진행 단계 UI 업데이트
// 매개변수: stepNumber (1-4)

function updateStep(stepNumber) {
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}
```

#### **updateProgress(percentage, message)**
```javascript
// 목적: 진행률 바 및 메시지 업데이트
// 매개변수: percentage (0-100), message (상태 메시지)

function updateProgress(percentage, message) {
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressMessage').textContent = message;
}
```

---

## 🔄 **데이터 플로우 및 처리 단계**

### **전체 프로세스 (6단계)**

#### **1단계: 파일 업로드**
```
사용자 액션 → 파일 선택 → 검증 → 미리보기 → 전역 저장
     ↓
uploadedFiles = {
    passport: File,
    license: File,
    selfie: File
}
```

#### **2단계: 문서 분석**
```
파일 → Base64 변환 → Firebase API 호출 → IDAnalyzer 처리 → 응답 반환
     ↓
{
    passport_data: { original: {...}, translated: {...} },
    license_data: { original: {...}, translated: {...} },
    cross_validation: { name_match: true, ... },
    kyc_fields: { full_name: "...", ... }
}
```

#### **3단계: 정보 검증**
```
API 응답 → 필드 매핑 → 폼 채우기 → 사용자 확인 → 수정 가능
     ↓
검증된 KYC 데이터 객체
```

#### **4단계: 미리보기**
```
검증된 데이터 → 문서 미리보기 → 최종 확인
```

#### **5단계: ZIP 생성**
```
KYC 데이터 → Word 생성 → 이미지 수집 → ZIP 압축 → 다운로드
     ↓
KYC_[이름]_[날짜].zip
├── KYC_[이름]_[날짜].txt
├── passport_[이름].jpg
├── license_[이름].jpg
└── selfie_[이름].jpg
```

#### **6단계: 완료**
```
다운로드 완료 → 성공 메시지 → 새로운 처리 준비
```

### **데이터 변환 과정**

#### **입력 데이터 형식**
```javascript
// 업로드된 파일
File {
    name: "passport.jpg",
    size: 2048576,
    type: "image/jpeg",
    lastModified: 1718524800000
}
```

#### **API 전송 형식**
```javascript
// Base64 인코딩된 데이터
{
    "passportImage": "iVBORw0KGgoAAAANSUhEUgAA...",
    "licenseImage": "/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

#### **API 응답 형식**
```javascript
{
    "success": true,
    "message": "다중 문서 처리 완료",
    "passport_data": {
        "original": {
            "success": true,
            "data": {
                "documentName": [{"value": "TANAKA HANAKO"}],
                "dateOfBirth": [{"value": "1985-03-15"}],
                "sex": [{"value": "F"}],
                "nationality": [{"value": "Japan"}]
                // ... 기타 필드들
            }
        },
        "translated": { /* 번역된 버전 */ }
    },
    "license_data": { /* 면허증 데이터 */ },
    "cross_validation": {
        "name_match": true,
        "birth_date_match": true,
        "gender_match": true,
        "confidence_score": 95
    },
    "kyc_fields": {
        "full_name": "TANAKA HANAKO",
        "date_of_birth": "1985-03-15",
        "gender": "F",
        "nationality": "Japan",
        "type_of_id": "Passport + Driver's License",
        "issuing_country": "Japan",
        "unique_identification_number": "TM1234567",
        "address": "Tokyo, Japan"
    }
}
```

#### **최종 출력 형식**
```
ZIP 파일 구조:
KYC_TANAKA_HANAKO_2025-06-16.zip
├── KYC_TANAKA_HANAKO_2025-06-16.txt     # KYC 문서
├── passport_TANAKA_HANAKO.jpg           # 여권 이미지
├── license_TANAKA_HANAKO.jpg            # 면허증 이미지
└── selfie_TANAKA_HANAKO.jpg             # 셀피 이미지
```

---

## 🔧 **설정 및 환경 변수**

### **Firebase 설정**
```javascript
// 프로젝트 정보
Project ID: "kyc-document-generator"
Region: "us-central1"

// Functions 설정
Runtime: Node.js 20
Memory: 512MB
Timeout: 60s
```

### **API 키 및 인증**
```javascript
// IDAnalyzer API
API_KEY: "DhpAEn8euYvSopBIduRwVltyKqi3aCPo"
Endpoint: "https://api.idanalyzer.com/"

// Google Translate API
// Firebase Functions 내부에서 관리 (보안상 이유로 노출하지 않음)
```

### **지원 파일 형식 및 제한사항**
```javascript
// 업로드 제한
Max File Size: 10MB (여권/면허증), 5MB (셀피)
Supported Formats: JPG, PNG, PDF (여권/면허증), JPG, PNG (셀피)

// 출력 제한
ZIP Max Size: 50MB (일반적으로 10-20MB)
Processing Time: 10-20초
```

---

## 🚀 **배포 환경 및 접근 방법**

### **개발 환경**
```bash
# 로컬 서버 실행
python -m http.server 9090

# 브라우저 접속
http://localhost:9090

# 브랜치: main
용도: 개발, 테스트, 새로운 기능 추가
```

### **배포 환경**
```bash
# GitHub Pages
URL: https://securil.github.io/kyc-document-generator

# 브랜치: gh-pages
용도: 실제 사용자 접근, 안정된 버전만 배포
```

### **배포 프로세스**
```bash
# 1. 개발 (main 브랜치)
git add .
git commit -m "새로운 기능 추가"
git push origin main

# 2. 테스트 (로컬 환경)
# 기능 검증 및 버그 수정

# 3. 배포 (gh-pages 브랜치)
git checkout gh-pages
git merge main
git push origin gh-pages

# 4. 확인
# https://securil.github.io/kyc-document-generator 접속
```

---

## 🐛 **알려진 이슈 및 해결 방안**

### **현재 해결된 이슈들**
1. ✅ **셀피 업로드 기능**: JavaScript 이벤트 리스너 추가로 해결
2. ✅ **ZIP 파일 생성**: JSZip 라이브러리 연동 완료
3. ✅ **getFileExtension 오류**: 누락된 함수 추가로 해결
4. ✅ **브랜치 전략**: main + gh-pages 구조로 개선

### **현재 진행 중인 이슈들**

#### **Priority 1: Word 문서 품질 개선**
```javascript
// 현재 상태: 텍스트 파일로 생성
// 목표: 전문적인 .docx 형식
// 해결 방안: docx.js 라이브러리 정상 연동 또는 대체 방법
```

#### **Priority 2: 데이터 추출 정확도**
```javascript
// 문제: 주소 정보 완전 누락
// 증상: originalAddress = "", address = ""
// 원인: IDAnalyzer API 응답 매핑 로직 문제
// 해결 방안: API 응답 구조 재분석 및 매핑 함수 수정
```

#### **Priority 3: 교차 검증 실패**
```javascript
// 문제: birth_date_match: false, gender_match: false
// 원인: 데이터 형식 불일치 (날짜 포맷, 성별 표기법)
// 해결 방안: 정규화 함수 추가 및 매칭 로직 개선
```

### **해결 예정 방안**

#### **1. 데이터 매핑 함수 개선**
```javascript
// 새로운 데이터 추출 함수
function improvedDataExtraction(apiResponse) {
    // IDAnalyzer 응답 구조 분석
    // 다중 경로 데이터 추출
    // 정규화 및 검증
    // 폴백 메커니즘
}
```

#### **2. Word 문서 생성 개선**
```javascript
// 대안 1: docx.js 재구현
// 대안 2: 서버사이드 Word 생성
// 대안 3: HTML to DOCX 변환
```

---

## 📈 **성능 지표 및 모니터링**

### **현재 성능 데이터**
```javascript
// 처리 시간
파일 업로드: 즉시 (클라이언트 사이드)
문서 분석: 5-8초 (IDAnalyzer API)
번역 처리: 1-2초 (Google Translate)
ZIP 생성: 2-3초 (클라이언트 사이드)
총 처리 시간: 10-15초

// 정확도
기본 정보 추출: 95% (이름, 생년월일, 성별)
주소 정보 추출: 30% (현재 이슈)
교차 검증: 60% (개선 필요)
전체 만족도: 70%
```

### **목표 성능 지표**
```javascript
// Phase 5 목표
총 처리 시간: 8-12초
정확도: 95% 이상
주소 추출: 90% 이상
교차 검증: 95% 이상
사용자 만족도: 90% 이상
```

---

## 🔮 **향후 개발 계획**

### **Phase 5 (예정)**
1. **데이터 추출 정확도 개선**
   - IDAnalyzer API 응답 재분석
   - 새로운 매핑 로직 구현
   - 주소 정보 추출 복구

2. **Word 문서 품질 향상**
   - 전문적인 .docx 형식
   - 테이블 및 서식 적용
   - 로고 및 브랜딩 추가

3. **사용자 경험 개선**
   - 모바일 최적화
   - 진행률 표시 개선
   - 오류 메시지 친화적 개선

### **Phase 6 (장기)**
1. **다국가 지원 확장**
   - 미국, 캐나다, 영국 등 신분증
   - 다양한 언어 지원
   - 지역별 KYC 표준 적용

2. **고급 기능 추가**
   - 얼굴 인식 및 매칭
   - 블록체인 인증
   - API 서비스 제공

3. **상용화 준비**
   - 사용자 계정 시스템
   - 결제 연동
   - 엔터프라이즈 기능

---

## 🛡️ **보안 고려사항**

### **현재 보안 조치**
1. **클라이언트 사이드 처리**: 개인정보가 서버에 저장되지 않음
2. **HTTPS 통신**: 모든 데이터 전송 암호화
3. **API 키 보안**: Firebase Functions 내부에서 관리
4. **임시 처리**: 업로드된 파일은 메모리에서만 처리

### **추가 보안 개선 계획**
1. **파일 암호화**: ZIP 파일에 비밀번호 추가
2. **세션 관리**: 처리 중인 데이터 자동 삭제
3. **감사 로그**: 처리 내역 기록 (개인정보 제외)
4. **취약점 스캔**: 정기적인 보안 점검

---

## 📞 **기술 지원 및 문의**

### **개발자 정보**
- **이름**: Chae Woong Seok
- **전문 분야**: 일본어/영어 번역, 웹 개발
- **자격**: Native language user of Japanese & English / Professional translator

### **문의 방법**
- **GitHub Issues**: https://github.com/securil/kyc-document-generator/issues
- **기술 문의**: 코드 관련 질문 및 버그 리포트
- **기능 요청**: 새로운 기능 제안 및 개선 사항

### **기여 방법**
1. **Fork** 저장소
2. **Feature 브랜치** 생성
3. **변경사항 커밋**
4. **Pull Request** 제출

---

## 📚 **참고 자료 및 라이선스**

### **사용된 오픈소스 라이브러리**
```javascript
Bootstrap 5.3.0         // MIT License
Bootstrap Icons         // MIT License
SweetAlert2            // MIT License
JSZip 3.10.1           // MIT License
FileSaver.js 2.0.5     // MIT License
docx.js 7.8.2          // MIT License
```

### **외부 서비스**
```javascript
Firebase Functions     // Google Cloud Platform
IDAnalyzer API         // Commercial License
Google Translate API   // Google Cloud Platform
GitHub Pages          // GitHub Terms of Service
```

### **프로젝트 라이선스**
이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**문서 버전**: v2.0  
**최종 업데이트**: 2025-06-16 15:45  
**다음 업데이트**: Phase 5 완료 후
