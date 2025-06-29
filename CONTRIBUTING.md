# 🤝 기여 가이드 (Contributing Guide)

KYC Document Generator 프로젝트에 기여해주셔서 감사합니다! 이 가이드는 효과적인 협업을 위한 규칙과 절차를 설명합니다.

---

## 📋 **기여 전 준비사항**

### **필수 확인사항**
- [ ] **SETUP_GUIDE.md** 읽고 개발 환경 구축 완료
- [ ] **TECHNICAL_DOCS.md** 읽고 프로젝트 구조 이해
- [ ] **PROJECT_STATUS.md** 읽고 현재 상황 파악
- [ ] 로컬 환경에서 정상 작동 확인

### **기여 가능한 영역**
1. **버그 수정** - 기존 기능의 오류 해결
2. **기능 개선** - 사용자 경험 향상
3. **새로운 기능** - Phase 5 로드맵 기반
4. **문서화** - 기술 문서 개선
5. **테스트** - 품질 향상

---

## 🔄 **개발 워크플로우**

### **1. 이슈 확인 및 생성**
```bash
# GitHub Issues에서 작업할 이슈 확인
https://github.com/securil/kyc-document-generator/issues

# 새로운 아이디어가 있다면 이슈 먼저 생성
```

### **2. 브랜치 생성 및 작업**
```bash
# 1. 최신 main 브랜치로 업데이트
git checkout main
git pull origin main

# 2. 새로운 브랜치 생성
git checkout -b feature/이슈번호-간단한설명
# 예: git checkout -b feature/23-address-extraction-fix

# 3. 개발 작업
# 코드 수정, 테스트, 문서 업데이트

# 4. 정기적으로 커밋
git add .
git commit -m "feat: 주소 추출 로직 개선"
```

### **3. 테스트 및 검증**
```bash
# 백엔드 테스트
cd functions
npm run serve

# 프론트엔드 테스트
cd ..
python -m http.server 9090

# 전체 기능 테스트
# 1. 파일 업로드
# 2. 문서 분석
# 3. ZIP 생성
# 4. 다운로드
```

### **4. Pull Request 생성**
```bash
# 1. 원격 저장소에 푸시
git push origin feature/이슈번호-간단한설명

# 2. GitHub에서 Pull Request 생성
# - 제목: [#이슈번호] 간단한 설명
# - 내용: 변경사항 상세 설명
# - 테스트 결과 포함
```

---

## 📝 **커밋 메시지 규칙**

### **커밋 메시지 형식**
```
타입: 간단한 설명

상세 설명 (선택사항)

관련 이슈: #이슈번호
```

### **타입 분류**
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅 (기능 변경 없음)
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 스크립트, 패키지 매니저 등

### **커밋 메시지 예시**
```bash
# 좋은 예시
feat: ZIP 파일 압축률 개선
fix: 일본어 주소 번역 오류 수정
docs: API 명세서 업데이트

# 나쁜 예시
update
수정
버그 고침
```

---

## 🐛 **버그 리포트 가이드**

### **이슈 템플릿**
```markdown
## 🐛 버그 설명
간단하고 명확한 버그 설명

## 🔄 재현 단계
1. '...' 클릭
2. '...' 입력
3. '...' 확인
4. 오류 발생

## 🎯 예상 결과
정상적으로 작동해야 하는 내용

## 💥 실제 결과
실제로 발생한 문제

## 🖥️ 환경 정보
- OS: [Windows 11]
- 브라우저: [Chrome 115]
- Node.js: [20.5.0]
- 기타: [...]

## 📸 스크린샷
(가능하면 스크린샷 첨부)
```

---

## ✨ **새로운 기능 제안**

### **Feature Request 템플릿**
```markdown
## 🚀 기능 설명
새로운 기능에 대한 간단하고 명확한 설명

## 💡 동기 및 배경
이 기능이 왜 필요한지, 어떤 문제를 해결하는지

## 📋 상세 요구사항
- [ ] 요구사항 1
- [ ] 요구사항 2
- [ ] 요구사항 3

## 🎯 사용 시나리오
실제 사용 예시나 시나리오

## 📊 우선순위
- [ ] 높음 (필수 기능)
- [ ] 중간 (개선 사항)
- [ ] 낮음 (nice to have)
```

---

## 🧪 **테스트 가이드**

### **테스트해야 할 기능들**
1. **파일 업로드**
   - 여권, 면허증, 셀피 업로드
   - 파일 크기 제한 (10MB)
   - 지원 형식 (JPG, PNG, PDF)

2. **문서 분석**
   - IDAnalyzer API 연동
   - 데이터 추출 정확도
   - 오류 처리

3. **번역 기능**
   - Google Translate API
   - 일본어 → 영어 번역
   - 주소 특화 번역

4. **ZIP 생성**
   - 파일 압축
   - 다운로드 기능
   - 파일명 생성

### **테스트 시나리오**
```bash
# 1. 정상 시나리오
정상적인 여권/면허증/셀피 이미지 → 성공적인 ZIP 생성

# 2. 오류 시나리오
- 잘못된 파일 형식
- 파일 크기 초과
- 네트워크 오류
- API 오류

# 3. 경계값 테스트
- 최대 파일 크기
- 특수 문자가 포함된 이름
- 다양한 언어의 주소
```

---

## 📚 **코딩 스타일 가이드**

### **JavaScript 스타일**
```javascript
// 1. ES6+ 모던 문법 사용
const uploadedFiles = {
    passport: null,
    license: null,
    selfie: null
};

// 2. 함수명은 camelCase
function handleFileUpload(file, type) {
    // 함수 내용
}

// 3. 상수는 UPPER_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 4. 주석은 한국어로 상세히
// 파일 크기를 검증하고 미리보기를 생성하는 함수
function validateAndPreview(file) {
    // 구현 내용
}
```

### **HTML/CSS 스타일**
```html
<!-- 1. 의미 있는 클래스명 사용 -->
<div class="upload-area passport-upload">
    <!-- 내용 -->
</div>

<!-- 2. Bootstrap 클래스 활용 -->
<button class="btn btn-primary btn-lg">
    업로드
</button>
```

---

## 🔒 **보안 고려사항**

### **중요한 보안 규칙**
1. **API 키 노출 금지**
   - .env 파일은 Git에 커밋하지 않기
   - 코드에 API 키 하드코딩 금지

2. **개인정보 보호**
   - 업로드된 파일은 서버에 저장하지 않기
   - 로그에 개인정보 출력 금지

3. **입력 검증**
   - 모든 사용자 입력 검증
   - 파일 형식 및 크기 제한

### **보안 체크리스트**
- [ ] API 키가 코드에 노출되지 않았는가?
- [ ] 사용자 데이터가 로그에 출력되지 않는가?
- [ ] 파일 업로드 검증이 충분한가?
- [ ] CORS 설정이 적절한가?

---

## 🎯 **현재 우선순위 작업들**

### **Priority 1: 데이터 추출 정확도 개선**
- **문제**: 주소 정보 누락 (originalAddress = "")
- **원인**: IDAnalyzer API 응답 매핑 로직 문제
- **예상 작업 시간**: 2-4시간
- **담당자**: 모집 중

### **Priority 2: Word 문서 품질 개선**
- **문제**: 텍스트 파일로만 생성됨
- **목표**: 전문적인 .docx 형식
- **예상 작업 시간**: 3-6시간
- **담당자**: 모집 중

### **Priority 3: 사용자 경험 개선**
- **목표**: 오류 메시지 친화적 개선
- **예상 작업 시간**: 1-2시간
- **담당자**: 모집 중

---

## 📞 **소통 및 지원**

### **질문이나 도움이 필요할 때**
1. **GitHub Issues**: 기술적 질문, 버그 리포트
2. **Pull Request**: 코드 리뷰 요청
3. **GitHub Discussions**: 일반적인 토론

### **프로젝트 리더**
- **Chae Woong Seok**: 프로젝트 리드, 풀스택 개발
- **전문 분야**: 일본어/영어 번역, 웹 개발, AI 연동

### **커뮤니티 규칙**
1. **존중**: 모든 기여자를 존중합니다
2. **건설적**: 건설적인 피드백을 제공합니다
3. **협력**: 함께 더 나은 프로젝트를 만듭니다
4. **학습**: 서로에게서 배우고 성장합니다

---

## 🏆 **기여자 인정**

### **기여도에 따른 인정**
- **커밋 기여**: GitHub 프로필에 자동 반영
- **주요 기능**: README.md에 기여자 목록 추가
- **문서화**: 기술 문서에 작성자 크레딧
- **버그 수정**: 릴리즈 노트에 감사 인사

### **기여 유형별 가이드라인**
```
🐛 버그 수정: 1-3 커밋
✨ 새로운 기능: 3-10 커밋
📚 문서화: 1-2 커밋
🔧 리팩토링: 2-5 커밋
🧪 테스트: 1-3 커밋
```

---

**기여해주셔서 감사합니다! 🙏**

함께 더 나은 KYC Document Generator를 만들어 갑시다.

---

*이 가이드는 프로젝트 발전에 따라 지속적으로 업데이트됩니다.*  
*마지막 업데이트: 2025-06-16*
