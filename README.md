# KYC Document Generator

여권, 운전면허증, 셀피를 업로드하면 AI가 자동으로 정보를 추출하고 번역하여 KYC 문서를 생성하는 웹 애플리케이션입니다.

## 🚀 Demo

**Live Demo**: [https://securil.github.io/kyc-document-generator](https://securil.github.io/kyc-document-generator)

## ✨ 주요 기능

- **3개 문서 동시 처리**: 여권 + 운전면허증 + 셀피 사진
- **AI 자동 분석**: IDAnalyzer API로 정확한 데이터 추출
- **고품질 번역**: Google Translate API 연동
- **교차 검증**: 여권과 면허증 정보 일치 확인
- **ZIP 파일 출력**: KYC 문서 + 모든 이미지 통합 패키지

## 🔧 기술 스택

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

## 📱 사용 방법

1. **파일 업로드**: 여권, 운전면허증, 셀피 사진을 업로드
2. **AI 분석**: 자동으로 문서에서 정보 추출
3. **정보 확인**: 추출된 정보 확인 및 수정
4. **ZIP 다운로드**: KYC 문서와 모든 이미지가 포함된 ZIP 파일 다운로드

## 🎯 지원 형식

- **입력**: JPG, PNG, PDF (여권/면허증), JPG, PNG (셀피)
- **출력**: ZIP 파일 (KYC 문서 + 3개 이미지)
- **언어**: 한국어, 일본어 → 영어 번역

## 🔒 보안

- 클라이언트 사이드 처리로 개인정보 보호
- HTTPS 통신으로 데이터 암호화
- 파일은 서버에 저장되지 않음

## 📈 개발 현황

### Phase 4 완료 (2025-06-16)
- ✅ 셀피 업로드 기능
- ✅ ZIP 파일 생성 시스템
- ✅ 6단계 워크플로우
- ✅ GitHub Pages 배포

### 예정 기능
- Word 문서 품질 개선
- 데이터 추출 정확도 향상
- 모바일 최적화

## 👨‍💻 개발자

**Chae Woong Seok**
- 전문 분야: 일본어/영어 번역, 웹 개발
- Native language user of Japanese & English
- Professional translator

## 📞 문의

프로젝트 관련 문의나 버그 리포트는 GitHub Issues를 이용해주세요.

---

*KYC Document Generator v2.0 - Phase 4*  
*Last updated: 2025-06-16*
