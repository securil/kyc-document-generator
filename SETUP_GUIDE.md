# 🚀 KYC Document Generator - 개발 환경 구축 가이드

**대상**: 새로운 개발자, 기여자  
**목표**: 로컬 개발 환경 완전 구축  
**소요 시간**: 30-60분  

---

## 📋 **사전 요구사항**

### **필수 소프트웨어**
- **Node.js 20+**: https://nodejs.org/
- **Git**: https://git-scm.com/
- **Firebase CLI**: `npm install -g firebase-tools`
- **텍스트 에디터**: Visual Studio Code (권장)

### **필수 계정**
- **GitHub 계정**: 코드 접근용
- **Firebase 계정**: 백엔드 배포용 (Google 계정 사용)

---

## 🛠️ **1단계: 저장소 클론 및 설정**

### **1.1 저장소 복제**
```bash
# 1. 저장소 클론
git clone https://github.com/securil/kyc-document-generator.git
cd kyc-document-generator

# 2. main 브랜치 확인 (개발용)
git branch
# * main  ← 개발 브랜치
#   gh-pages  ← 배포 브랜치 (건드리지 말 것)
```

### **1.2 프로젝트 구조 확인**
```
📦 kyc-document-generator/
├── 📄 index.html                    # 메인 웹 애플리케이션
├── 📁 functions/                    # Firebase Functions (백엔드)
│   ├── 📄 index.js                  # API 함수들
│   └── 📄 package.json              # 백엔드 의존성
├── 📄 .firebaserc                   # Firebase 프로젝트 설정
├── 📄 firebase.json                 # Firebase 배포 설정
├── 📄 TECHNICAL_DOCS.md             # 기술 문서 (필독!)
├── 📄 PROJECT_STATUS.md             # 프로젝트 현황
└── 📄 SETUP_GUIDE.md                # 이 파일
```

---

## 🔧 **2단계: 백엔드 환경 구축**

### **2.1 Firebase Functions 설정**
```bash
# 1. functions 폴더로 이동
cd functions

# 2. Node.js 패키지 설치
npm install

# 3. 설치 확인
ls node_modules  # 패키지들이 설치되었는지 확인
```

### **2.2 Firebase CLI 로그인**
```bash
# 1. Firebase 로그인
firebase login

# 2. 프로젝트 확인
firebase projects:list

# 3. 현재 프로젝트 설정 확인
firebase use --add
# → kyc-document-generator 선택
```

### **2.3 로컬 개발 서버 실행**
```bash
# functions 폴더에서 실행
npm run serve

# 출력 예시:
# ┌─────────────────────────────────────────────────────────────┐
# │ ✔  All emulators ready! It is now safe to connect your app. │
# │ i  View Emulator UI at http://localhost:4000                │
# └─────────────────────────────────────────────────────────────┘
```

---

## 🌐 **3단계: 프론트엔드 환경 구축**

### **3.1 로컬 웹 서버 실행**
```bash
# 프로젝트 루트 폴더에서
cd ..  # functions에서 나가기

# Python이 설치된 경우
python -m http.server 9090

# 또는 Node.js가 설치된 경우
npx http-server -p 9090
```

### **3.2 브라우저에서 접속**
```
http://localhost:9090
```

### **3.3 정상 작동 확인**
1. **웹사이트 로딩**: 파란색 그라데이션 배경의 KYC 시스템
2. **3개 업로드 영역**: 여권, 운전면허증, 셀피
3. **파일 업로드 테스트**: 아무 이미지나 업로드해보기
4. **버튼 활성화**: 3개 파일 업로드 시 "문서 분석 시작" 버튼 활성화

---

## 🔑 **4단계: API 키 설정 (중요!)**

### **4.1 환경 변수 파일 생성**
```bash
# functions 폴더에 .env 파일 생성
cd functions
touch .env  # 또는 수동으로 파일 생성
```

### **4.2 필요한 API 키들**

#### **IDAnalyzer API** (문서 분석용)
```bash
# .env 파일에 추가
IDANALYZER_API_KEY=DhpAEn8euYvSopBIduRwVltyKqi3aCPo
```
> ⚠️ **주의**: 현재는 테스트용 키입니다. 실제 서비스에서는 새로운 키를 발급받으세요.

#### **Google Translate API** (자동 설정됨)
Firebase Functions에서 자동으로 인증되므로 별도 설정 불필요.

### **4.3 Firebase Admin SDK 키 (선택사항)**
현재 프로젝트는 Firebase Admin SDK를 기본 설정으로 사용하므로 별도 키 파일이 필요하지 않습니다.

---

## 🧪 **5단계: 개발 환경 테스트**

### **5.1 백엔드 API 테스트**
```bash
# Health Check API 테스트
curl http://localhost:5001/kyc-document-generator/us-central1/healthCheck

# 예상 응답:
# {
#   "status": "OK",
#   "message": "Firebase Functions with Google Translate API 정상 작동",
#   "timestamp": "2025-06-16T..."
# }
```

### **5.2 번역 API 테스트**
```bash
# 번역 API 테스트
curl -X POST http://localhost:5001/kyc-document-generator/us-central1/translateAddress \
  -H "Content-Type: application/json" \
  -d '{"text": "東京都渋谷区", "sourceLang": "ja", "targetLang": "en"}'

# 예상 응답:
# {
#   "success": true,
#   "translatedText": "Shibuya City, Tokyo, Japan"
# }
```

### **5.3 전체 시스템 테스트**
1. **프론트엔드 접속**: http://localhost:9090
2. **파일 업로드**: 테스트 이미지 3개 업로드
3. **문서 분석**: "문서 분석 시작" 버튼 클릭
4. **결과 확인**: 정보 추출 및 ZIP 다운로드

---

## 📚 **6단계: 개발 문서 숙지**

### **필독 문서들**
1. **TECHNICAL_DOCS.md** - 완전한 기술 문서 (895줄)
   - API 명세서
   - 함수별 상세 설명
   - 데이터 플로우
   - 아키텍처 설명

2. **PROJECT_STATUS.md** - 현재 프로젝트 상황
   - Phase 4 완료 상태
   - 해결해야 할 이슈들
   - 향후 개발 계획

### **주요 파일 이해**
```javascript
// index.html - 메인 웹 애플리케이션
- 1,800+ 줄의 Single Page Application
- Bootstrap 5.3.0 사용
- JSZip으로 ZIP 파일 생성

// functions/index.js - 백엔드 API
- translateAddress: Google Translate API
- healthCheck: 상태 확인
- Firebase Functions v2 사용
```

---

## 🚀 **7단계: 개발 워크플로우**

### **7.1 새로운 기능 개발**
```bash
# 1. 새로운 기능 브랜치 생성
git checkout -b feature/새로운-기능

# 2. 코드 수정 및 개발
# (Visual Studio Code 등에서 작업)

# 3. 로컬 테스트
npm run serve  # 백엔드 테스트
python -m http.server 9090  # 프론트엔드 테스트

# 4. 커밋 및 푸시
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/새로운-기능

# 5. Pull Request 생성
# GitHub 웹사이트에서 PR 생성
```

### **7.2 배포 프로세스**
```bash
# 개발 완료 후 main 브랜치에 병합
git checkout main
git merge feature/새로운-기능

# GitHub Pages는 자동으로 배포됨 (gh-pages 브랜치)
```

---

## 🐛 **문제 해결 가이드**

### **자주 발생하는 문제들**

#### **1. npm install 실패**
```bash
# Node.js 버전 확인 (20+ 필요)
node --version

# npm 캐시 정리
npm cache clean --force

# 재설치
rm -rf node_modules package-lock.json
npm install
```

#### **2. Firebase 로그인 실패**
```bash
# 로그아웃 후 재로그인
firebase logout
firebase login

# 프로젝트 재설정
firebase use kyc-document-generator
```

#### **3. CORS 오류**
```
브라우저에서 CORS 오류 발생 시:
- 로컬 서버가 정상 실행되고 있는지 확인
- http://localhost:9090 (HTTPS 아님)으로 접속
- 브라우저 캐시 삭제
```

#### **4. API 키 관련 오류**
```bash
# .env 파일 확인
cat functions/.env

# API 키가 올바른지 확인
# IDAnalyzer 웹사이트에서 키 상태 확인
```

---

## 📞 **지원 및 문의**

### **도움이 필요할 때**
1. **GitHub Issues**: https://github.com/securil/kyc-document-generator/issues
2. **기술 문서**: `TECHNICAL_DOCS.md` 파일 참조
3. **프로젝트 현황**: `PROJECT_STATUS.md` 파일 참조

### **기여 방법**
1. **Fork** 저장소
2. **Feature 브랜치** 생성
3. **개발 및 테스트**
4. **Pull Request** 제출

### **코딩 스타일**
- **JavaScript**: ES6+ 모던 문법 사용
- **주석**: 한국어로 상세히 작성
- **함수명**: camelCase 사용
- **커밋 메시지**: "feat:", "fix:", "docs:" 등 prefix 사용

---

## 🎯 **개발 환경 구축 체크리스트**

### **✅ 완료 확인**
- [ ] Node.js 20+ 설치 완료
- [ ] Git 설치 및 저장소 클론 완료
- [ ] Firebase CLI 설치 및 로그인 완료
- [ ] `npm install` 성공
- [ ] 로컬 서버 실행 가능 (프론트엔드 + 백엔드)
- [ ] http://localhost:9090 접속 가능
- [ ] API 테스트 성공 (healthCheck)
- [ ] 기술 문서 읽기 완료
- [ ] 첫 번째 테스트 커밋 성공

### **🎉 완료!**
모든 체크리스트가 완료되면 KYC Document Generator 개발에 참여할 준비가 끝났습니다!

---

**가이드 버전**: v1.0  
**작성일**: 2025-06-16  
**업데이트**: Phase 4 완료 기준
