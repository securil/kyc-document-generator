# KYC Document Generator - 개발 브랜치

**🎉 Phase 5 완료! Translation Certification Form 구현**

여권, 운전면허증, 셀피를 업로드하면 AI가 자동으로 정보를 추출하고 번역하여 전문적인 KYC 문서를 생성하는 웹 애플리케이션입니다.

## 🌐 **라이브 데모**

**배포 사이트**: [https://securil.github.io/kyc-document-generator](https://securil.github.io/kyc-document-generator)

> 위 링크는 `gh-pages` 브랜치에서 배포되는 안정된 버전입니다.

## 🔧 **브랜치 전략**

- **`main` 브랜치**: 개발용 (현재 위치)
  - 새로운 기능 개발
  - 버그 수정
  - 테스트 및 실험

- **`gh-pages` 브랜치**: 배포용
  - 안정된 버전만 배포
  - 실제 사용자가 접근하는 사이트

## ✨ **최신 상태 (Phase 5 완료)**

### 🆕 Phase 5 신규 기능
- ✅ **Translation Certification Form**: 전문적인 번역 인증서 생성
- ✅ **주소 자동 번역**: 일본어 주소 → 영어 주소 (Google Translate API)
- ✅ **고유 번호 공란 처리**: SMB 정책에 따른 별도 번호 부여 대응
- ✅ **실제 .docx 파일**: Microsoft Word 완벽 호환 문서 생성

### 완료된 기능
- ✅ **3개 문서 동시 처리**: 여권 + 운전면허증 + 셀피 사진
- ✅ **AI 자동 분석**: IDAnalyzer API로 정확한 데이터 추출
- ✅ **고품질 번역**: Google Translate API 연동
- ✅ **교차 검증**: 여권과 면허증 정보 일치 확인
- ✅ **ZIP 파일 출력**: KYC 문서 + 모든 이미지 통합 패키지

### 개발 중인 기능
- 🔧 Word 문서 품질 개선
- 🔧 데이터 추출 정확도 향상
- 🔧 모바일 최적화

## 🛠️ **개발 환경 설정**

### 로컬 테스트
```bash
# 로컬 서버 실행 (포트 9090)
python -m http.server 9090

# 브라우저에서 접속
http://localhost:9090
```

### 배포 프로세스
```bash
# 1. main 브랜치에서 개발 및 테스트
git add .
git commit -m "새로운 기능 추가"
git push origin main

# 2. 안정된 버전을 gh-pages로 배포
git checkout gh-pages
git merge main
git push origin gh-pages
```

## 🔧 **기술 스택**

### Frontend
- HTML5 + CSS3 + JavaScript (Vanilla)
- Bootstrap 5.3.0
- SweetAlert2
- JSZip (Phase 4)
- FileSaver.js

### Backend
- Firebase Functions (Node.js)
- IDAnalyzer API
- Google Translate API

## 📱 **사용 방법**

1. **파일 업로드**: 여권, 운전면허증, 셀피 사진을 업로드
2. **AI 분석**: 자동으로 문서에서 정보 추출
3. **정보 확인**: 추출된 정보 확인 및 수정
4. **ZIP 다운로드**: KYC 문서와 모든 이미지가 포함된 ZIP 파일 다운로드

## 🎯 **지원 형식**

- **입력**: JPG, PNG, PDF (여권/면허증), JPG, PNG (셀피)
- **출력**: ZIP 파일 (KYC 문서 + 3개 이미지)
- **언어**: 한국어, 일본어 → 영어 번역

## 🔒 **보안**

- 클라이언트 사이드 처리로 개인정보 보호
- HTTPS 통신으로 데이터 암호화
- 파일은 서버에 저장되지 않음

## 📈 **개발 일정**

### Phase 4 완료 (2025-06-16)
- ✅ 셀피 업로드 기능
- ✅ ZIP 파일 생성 시스템
- ✅ 6단계 워크플로우
- ✅ GitHub Pages 배포 (main + gh-pages 브랜치)

### Phase 5 예정
- Word 문서 품질 개선
- 데이터 추출 정확도 향상
- 모바일 최적화
- 다국어 UI 지원

## 👨‍💻 **개발자**

**Chae Woong Seok**
- 전문 분야: 일본어/영어 번역, 웹 개발
- Native language user of Japanese & English
- Professional translator

## 📞 **개발 관련 문의**

- **Issues**: GitHub Issues 탭 활용
- **Bug Reports**: 상세한 재현 단계와 함께 제보
- **Feature Requests**: 새로운 기능 제안

## 🔄 **배포 히스토리**

- **v2.0 (2025-06-16)**: Phase 4 완성 - 셀피 + ZIP 기능
- **v1.5 (2025-06-14)**: Phase 3 완성 - Word 문서 생성
- **v1.0 (2025-06-03)**: 기본 기능 완성 - 다중 문서 처리

---

*KYC Document Generator v2.0 - Development Branch*  
*Last updated: 2025-06-16*
