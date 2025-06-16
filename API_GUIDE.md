# 🔌 KYC Document Generator - API 가이드

**버전**: v2.0 Phase 4  
**업데이트**: 2025-06-16  
**대상**: 개발자, API 사용자  

---

## 📋 **API 개요**

KYC Document Generator는 Firebase Functions 기반의 서버리스 백엔드를 사용합니다. 현재 2개의 주요 API와 1개의 헬스체크 API를 제공합니다.

### **🔗 Base URL**
```
Production: https://us-central1-kyc-document-generator.cloudfunctions.net/
Local Dev:  http://localhost:5001/kyc-document-generator/us-central1/
```

### **🔐 인증**
현재 API는 공개 접근이 가능하지만, 향후 API 키 인증이 추가될 예정입니다.

---

## 🛠️ **API 엔드포인트**

### **1. processMultipleDocuments** (메인 API)

여권과 운전면허증을 분석하여 KYC 정보를 추출합니다.

#### **기본 정보**
```
Method: POST
Endpoint: /processMultipleDocuments
Content-Type: application/json
```

#### **요청 형식**
```json
{
  "passportImage": "base64_encoded_image_data",
  "licenseImage": "base64_encoded_image_data"
}
```

#### **요청 예시**
```javascript
// JavaScript 예시
const response = await fetch('https://us-central1-kyc-document-generator.cloudfunctions.net/processMultipleDocuments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    passportImage: "iVBORw0KGgoAAAANSUhEUgAA...", // Base64 데이터 (헤더 제외)
    licenseImage: "/9j/4AAQSkZJRgABAQAAAQABAAD..." // Base64 데이터 (헤더 제외)
  })
});
```

#### **응답 형식**
```json
{
  "success": true,
  "message": "다중 문서 처리 완료",
  "passport_data": {
    "original": {
      "success": true,
      "transactionId": "d46dbb1f05a8403bb72960656045253e",
      "data": {
        "documentName": [{"value": "TANAKA HANAKO"}],
        "dateOfBirth": [{"value": "1985-03-15"}],
        "sex": [{"value": "F"}],
        "nationality": [{"value": "Japan"}],
        "documentNumber": [{"value": "TM1234567"}]
      }
    },
    "translated": {
      // 번역된 데이터 (동일한 구조)
    }
  },
  "license_data": {
    "original": {
      // 면허증 원본 데이터
    },
    "translated": {
      // 면허증 번역 데이터
    }
  },
  "cross_validation": {
    "name_match": true,
    "birth_date_match": true,
    "gender_match": true,
    "conflicts": [],
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

#### **오류 응답**
```json
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "Base64 이미지 데이터가 제공되지 않았습니다",
  "details": {
    "passportImage": "missing",
    "licenseImage": "provided"
  }
}
```

---

### **2. translateAddress** (번역 API)

텍스트를 Google Translate API로 번역합니다.

#### **기본 정보**
```
Method: POST
Endpoint: /translateAddress
Content-Type: application/json
```

#### **요청 형식**
```json
{
  "text": "번역할 텍스트",
  "sourceLang": "ja",
  "targetLang": "en"
}
```

#### **요청 예시**
```javascript
const response = await fetch('https://us-central1-kyc-document-generator.cloudfunctions.net/translateAddress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: "神奈川県横浜市港北区新横浜2-5-10",
    sourceLang: "ja",
    targetLang: "en"
  })
});
```

#### **응답 형식**
```json
{
  "success": true,
  "originalAddress": "神奈川県横浜市港北区新横浜2-5-10",
  "translatedAddress": "2-5-10 Shin-Yokohama, Kohoku-ku, Yokohama-shi, Kanagawa, Japan",
  "translatedText": "2-5-10 Shin-Yokohama, Kohoku-ku, Yokohama-shi, Kanagawa, Japan",
  "sourceLang": "ja",
  "targetLang": "en",
  "timestamp": "2025-06-16T12:00:00.000Z"
}
```

---

### **3. healthCheck** (상태 확인)

서버 상태를 확인합니다.

#### **기본 정보**
```
Method: GET
Endpoint: /healthCheck
```

#### **요청 예시**
```javascript
const response = await fetch('https://us-central1-kyc-document-generator.cloudfunctions.net/healthCheck');
```

#### **응답 형식**
```json
{
  "status": "OK",
  "message": "Firebase Functions with Google Translate API 정상 작동",
  "timestamp": "2025-06-16T12:00:00.000Z",
  "functions": [
    "translateAddress - 구글 번역 API 주소 번역",
    "healthCheck - 상태 확인"
  ]
}
```

---

## 🔧 **클라이언트 구현 예시**

### **JavaScript (Frontend)**

#### **파일을 Base64로 변환**
```javascript
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// 사용 예시
const passportFile = document.getElementById('passportInput').files[0];
const licenseFile = document.getElementById('licenseInput').files[0];

const passportBase64 = await fileToBase64(passportFile);
const licenseBase64 = await fileToBase64(licenseFile);

// "data:image/jpeg;base64," 제거
const passportData = passportBase64.split(',')[1];
const licenseData = licenseBase64.split(',')[1];
```

#### **API 호출 및 결과 처리**
```javascript
async function processDocuments(passportData, licenseData) {
  try {
    const response = await fetch('https://us-central1-kyc-document-generator.cloudfunctions.net/processMultipleDocuments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        passportImage: passportData,
        licenseImage: licenseData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('KYC 정보:', result.kyc_fields);
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
}
```

### **Node.js (Backend)**
```javascript
import fetch from 'node-fetch';
import fs from 'fs';

async function processKYCDocuments(passportPath, licensePath) {
  // 파일을 Base64로 읽기
  const passportBuffer = fs.readFileSync(passportPath);
  const licenseBuffer = fs.readFileSync(licensePath);
  
  const passportBase64 = passportBuffer.toString('base64');
  const licenseBase64 = licenseBuffer.toString('base64');

  const response = await fetch('https://us-central1-kyc-document-generator.cloudfunctions.net/processMultipleDocuments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      passportImage: passportBase64,
      licenseImage: licenseBase64
    })
  });

  return await response.json();
}
```

### **Python**
```python
import requests
import base64

def process_kyc_documents(passport_path, license_path):
    # 파일을 Base64로 인코딩
    with open(passport_path, 'rb') as f:
        passport_base64 = base64.b64encode(f.read()).decode('utf-8')
    
    with open(license_path, 'rb') as f:
        license_base64 = base64.b64encode(f.read()).decode('utf-8')
    
    # API 호출
    response = requests.post(
        'https://us-central1-kyc-document-generator.cloudfunctions.net/processMultipleDocuments',
        json={
            'passportImage': passport_base64,
            'licenseImage': license_base64
        }
    )
    
    return response.json()

# 사용 예시
result = process_kyc_documents('passport.jpg', 'license.jpg')
print(result['kyc_fields'])
```

---

## 📊 **API 응답 데이터 구조**

### **IDAnalyzer 원시 데이터 구조**
```json
{
  "success": true,
  "transactionId": "unique_transaction_id",
  "data": {
    "documentName": [{"value": "FULL NAME", "confidence": 0.95}],
    "dateOfBirth": [{"value": "1990-01-01", "confidence": 0.92}],
    "sex": [{"value": "M", "confidence": 0.98}],
    "nationality": [{"value": "Japan", "confidence": 0.96}],
    "documentNumber": [{"value": "AB1234567", "confidence": 0.94}],
    "address1": [{"value": "주소 정보", "confidence": 0.88}]
  }
}
```

### **교차 검증 결과**
```json
{
  "name_match": true,
  "birth_date_match": true,
  "gender_match": false,
  "conflicts": [
    {
      "field": "gender",
      "passport_value": "M",
      "license_value": "F",
      "confidence": "low"
    }
  ],
  "confidence_score": 85
}
```

---

## ⚠️ **제한사항 및 주의사항**

### **파일 크기 제한**
- **최대 파일 크기**: 10MB per 이미지
- **총 요청 크기**: 20MB (2개 이미지 합계)
- **타임아웃**: 60초

### **지원 파일 형식**
- **이미지**: JPEG, PNG
- **문서**: PDF (이미지 PDF만)
- **권장 해상도**: 1000x1000 픽셀 이상

### **API 사용량 제한**
- **현재**: 제한 없음 (개발/테스트용)
- **향후**: 사용량 기반 제한 예정

### **보안 고려사항**
- Base64 인코딩으로 이미지 전송
- HTTPS 통신 필수
- 개인정보는 서버에 저장되지 않음
- 처리 후 즉시 메모리에서 삭제

---

## 🐛 **오류 코드 및 해결방법**

### **클라이언트 오류 (4xx)**

#### **400 Bad Request**
```json
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "요청 데이터가 올바르지 않습니다"
}
```
**해결방법**: 요청 형식과 필수 필드 확인

#### **413 Payload Too Large**
```json
{
  "success": false,
  "error": "FILE_TOO_LARGE",
  "message": "파일 크기가 10MB를 초과합니다"
}
```
**해결방법**: 이미지 압축 또는 해상도 조정

### **서버 오류 (5xx)**

#### **500 Internal Server Error**
```json
{
  "success": false,
  "error": "PROCESSING_ERROR",
  "message": "문서 처리 중 오류가 발생했습니다"
}
```
**해결방법**: 잠시 후 재시도, 지속시 GitHub Issues 신고

#### **503 Service Unavailable**
```json
{
  "success": false,
  "error": "SERVICE_UNAVAILABLE",
  "message": "서비스가 일시적으로 사용할 수 없습니다"
}
```
**해결방법**: 몇 분 후 재시도

---

## 🧪 **테스트 및 디버깅**

### **API 테스트 도구**

#### **cURL 예시**
```bash
# Health Check
curl https://us-central1-kyc-document-generator.cloudfunctions.net/healthCheck

# 번역 API 테스트
curl -X POST \
  https://us-central1-kyc-document-generator.cloudfunctions.net/translateAddress \
  -H "Content-Type: application/json" \
  -d '{"text": "東京都渋谷区", "sourceLang": "ja", "targetLang": "en"}'
```

#### **Postman 설정**
```json
{
  "method": "POST",
  "url": "https://us-central1-kyc-document-generator.cloudfunctions.net/processMultipleDocuments",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "passportImage": "{{base64_passport_data}}",
    "licenseImage": "{{base64_license_data}}"
  }
}
```

### **디버깅 팁**
1. **Base64 인코딩 확인**: 데이터 URL 헤더 제거 확인
2. **파일 크기**: 10MB 이하인지 확인
3. **네트워크**: CORS 설정 및 HTTPS 사용
4. **응답 시간**: 대용량 파일은 처리 시간이 길어질 수 있음

---

## 📚 **SDK 및 라이브러리**

### **JavaScript SDK (예정)**
```javascript
import KYCClient from 'kyc-document-generator-sdk';

const client = new KYCClient({
  baseURL: 'https://us-central1-kyc-document-generator.cloudfunctions.net'
});

const result = await client.processDocuments({
  passport: passportFile,
  license: licenseFile
});
```

### **Python SDK (예정)**
```python
from kyc_document_generator import KYCClient

client = KYCClient(
    base_url='https://us-central1-kyc-document-generator.cloudfunctions.net'
)

result = client.process_documents(
    passport_path='passport.jpg',
    license_path='license.jpg'
)
```

---

## 🔮 **향후 API 개발 계획**

### **Phase 5 예정 기능**
- **배치 처리**: 여러 문서 동시 처리
- **웹훅**: 처리 완료 알림
- **API 키 인증**: 보안 강화
- **사용량 모니터링**: 사용 통계 제공

### **새로운 엔드포인트 (예정)**
- `POST /batch-process`: 배치 처리
- `GET /status/{job_id}`: 작업 상태 조회
- `POST /webhook`: 웹훅 등록
- `GET /usage`: 사용량 조회

---

## 📞 **지원 및 문의**

### **기술 지원**
- **GitHub Issues**: https://github.com/securil/kyc-document-generator/issues
- **문서**: TECHNICAL_DOCS.md 참조
- **예시**: 이 API 가이드의 코드 예시 활용

### **버그 리포트**
API 오류 발생 시 다음 정보를 포함하여 Issues에 신고해주세요:
- 요청 URL 및 메서드
- 요청 데이터 (개인정보 제외)
- 응답 코드 및 메시지
- 브라우저/환경 정보

---

**API 가이드 버전**: v2.0  
**마지막 업데이트**: 2025-06-16  
**다음 업데이트**: Phase 5 새로운 API 추가시
