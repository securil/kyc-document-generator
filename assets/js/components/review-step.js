/**
 * KYC Document Generator v3.0 - Review Step Component
 * 최종 검토 및 다운로드 단계를 담당하는 컴포넌트
 */

// 디버그 로그 함수
function debugLog(message, data) {
    if (window.DEBUG || window.debugLog !== debugLog) {
        if (data) {
            console.log(`[ReviewStep] ${message}`, data);
        } else {
            console.log(`[ReviewStep] ${message}`);
        }
    }
}

class ReviewStep {
    constructor() {
        this.isGenerating = false;
        this.isCompleted = false;
        
        this.init();
    }
    
    /**
     * 컴포넌트 초기화
     */
    init() {
        debugLog('📋 검토 단계 초기화');
        this.setupEventListeners();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const generateButton = document.getElementById('review-generate-button');
        if (generateButton) {
            generateButton.addEventListener('click', () => this.generateDocuments());
        }
        
        const backButton = document.getElementById('review-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.goBack());
        }
        
        const restartButton = document.getElementById('review-restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restart());
        }
        
        // 서명 업로드 이벤트 리스너 (이벤트 위임 방식)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#signature-upload-area')) {
                document.getElementById('signature-file-input')?.click();
            }
            if (e.target.id === 'remove-signature') {
                this.removeSignature();
            }
        });
        
        document.addEventListener('change', (e) => {
            if (e.target.id === 'signature-file-input') {
                this.handleSignatureUpload(e.target.files[0]);
            }
        });
    }
    
    /**
     * 서명 이미지 업로드 처리
     */
    handleSignatureUpload(file) {
        if (!file) return;
        
        debugLog('📝 서명 이미지 업로드:', file.name);
        
        // 파일 유효성 검사
        if (!file.type.startsWith('image/')) {
            UIManager.showWarning('파일 형식 오류', '이미지 파일만 업로드 가능합니다.');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB 제한
            UIManager.showWarning('파일 크기 오류', '파일 크기는 5MB 이하여야 합니다.');
            return;
        }
        
        // AppState에 서명 파일 저장
        AppState.files.signature = file;
        
        // 미리보기 표시
        const reader = new FileReader();
        reader.onload = (e) => {
            const signatureImage = document.getElementById('signature-image');
            const signaturePreview = document.getElementById('signature-preview');
            const uploadArea = document.getElementById('signature-upload-area');
            
            if (signatureImage && signaturePreview && uploadArea) {
                signatureImage.src = e.target.result;
                signaturePreview.style.display = 'block';
                uploadArea.classList.add('has-file');
            }
        };
        reader.readAsDataURL(file);
        
        debugLog('✅ 서명 이미지 업로드 완료');
    }
    
    /**
     * 서명 이미지 제거
     */
    removeSignature() {
        AppState.files.signature = null;
        
        const signaturePreview = document.getElementById('signature-preview');
        const uploadArea = document.getElementById('signature-upload-area');
        const fileInput = document.getElementById('signature-file-input');
        
        if (signaturePreview) signaturePreview.style.display = 'none';
        if (uploadArea) uploadArea.classList.remove('has-file');
        if (fileInput) fileInput.value = '';
        
        debugLog('🗑️ 서명 이미지 제거됨');
    }
    
    /**
     * 검토 페이지 표시
     */
    showReviewPage() {
        const container = document.getElementById('review-container');
        if (!container) return;
        
        const passportData = AppState.data.passport || {};
        const licenseData = AppState.data.license || {};
        
        container.innerHTML = `
            <div class="review-content">
                <h4><i class="bi bi-clipboard-check"></i> 최종 검토</h4>
                <p class="text-muted">모든 정보를 확인한 후 KYC 문서를 생성합니다.</p>
                
                <!-- 개인정보 섹션 -->
                <div class="review-section">
                    <h5><i class="bi bi-person"></i> 개인정보 (여권)</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>성명 (Full Name)</label>
                                <div class="info-value">${passportData.fullName || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <label>생년월일 (Date of Birth)</label>
                                <div class="info-value">${passportData.dateOfBirth || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <label>성별 (Gender)</label>
                                <div class="info-value">${passportData.gender || 'N/A'}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>국적 (Nationality)</label>
                                <div class="info-value">${passportData.nationality || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <label>발급 국가 (Issuing Country)</label>
                                <div class="info-value">${passportData.issuingCountry || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <label>여권 번호 (Document Number)</label>
                                <div class="info-value">${passportData.documentNumber || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 주소정보 섹션 -->
                <div class="review-section">
                    <h5><i class="bi bi-geo-alt"></i> 주소정보 (라이센스)</h5>
                    <div class="row">
                        <div class="col-12">
                            <div class="info-item">
                                <label>원본 주소 (Original)</label>
                                <div class="info-value">${licenseData.originalAddress || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <label>영문 번역 주소 (Translated)</label>
                                <div class="info-value">${licenseData.translatedAddress || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <label>일본 공식 표기법 (Official Romanization)</label>
                                <div class="info-value">${licenseData.officialAddress || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 파일 정보 섹션 -->
                <div class="review-section">
                    <h5><i class="bi bi-files"></i> 업로드된 파일</h5>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="file-item">
                                <i class="bi bi-airplane text-primary"></i>
                                <span>여권: ${AppState.files.passport?.name || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="file-item">
                                <i class="bi bi-credit-card text-success"></i>
                                <span>라이센스: ${AppState.files.license?.name || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="file-item">
                                <i class="bi bi-person-circle text-warning"></i>
                                <span>셀피: ${AppState.files.selfie?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 번역자 서명 섹션 -->
                <div class="review-section">
                    <h5><i class="bi bi-pen"></i> 번역자 서명 (Translator's Signature)</h5>
                    <div class="row">
                        <div class="col-12">
                            <div class="signature-upload-area ${AppState.files.signature ? 'has-file' : ''}" id="signature-upload-area">
                                <div class="signature-upload-content">
                                    <i class="bi bi-file-earmark-image"></i>
                                    <p><strong>서명 이미지 업로드 (선택사항)</strong></p>
                                    <p class="text-muted">PNG 파일을 업로드하면 문서에 실제 서명이 삽입됩니다.<br>
                                    업로드하지 않으면 서명란이 공란으로 남겨집니다.</p>
                                    <button type="button" class="btn btn-outline-primary">
                                        <i class="bi bi-upload"></i> 서명 이미지 선택
                                    </button>
                                </div>
                                <input type="file" id="signature-file-input" accept=".png,.jpg,.jpeg" style="display: none;">
                            </div>
                            <div id="signature-preview" class="signature-preview" style="display: none;">
                                <h6>업로드된 서명:</h6>
                                <img id="signature-image" src="" alt="서명 미리보기" style="max-width: 200px; max-height: 100px; border: 1px solid #ddd; padding: 5px;">
                                <button type="button" class="btn btn-sm btn-outline-danger ms-2" id="remove-signature">
                                    <i class="bi bi-trash"></i> 제거
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 생성될 문서 정보 -->
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    <strong>생성될 파일:</strong> Translation Certification Form (DOCX) + 3개 이미지가 포함된 ZIP 파일
                </div>
                
                <!-- 액션 버튼 -->
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-secondary" id="review-back-button">
                        <i class="bi bi-arrow-left"></i> 이전: 셀피
                    </button>
                    <div>
                        <button type="button" class="btn btn-outline-danger me-2" id="review-restart-button">
                            <i class="bi bi-arrow-clockwise"></i> 처음부터 다시
                        </button>
                        <button type="button" class="btn btn-success btn-lg" id="review-generate-button">
                            <i class="bi bi-download"></i> ZIP 파일 생성 및 다운로드
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showElement('review-container');
        this.setupEventListeners(); // 버튼 이벤트 재설정
    }
    
    /**
     * 문서 생성 및 다운로드
     */
    async generateDocuments() {
        if (this.isGenerating) return;
        
        try {
            this.isGenerating = true;
            
            debugLog('📄 문서 생성 시작');
            
            // 로딩 표시
            UIManager.showAlert('loading', 'ZIP 파일 생성 중...', 'Word 문서와 이미지를 압축하고 있습니다.');
            
            // 최종 데이터 구성
            const finalData = this.prepareFinalData();
            
            // Word 문서 생성
            const wordBlob = await this.createWordDocument(finalData);
            
            // ZIP 파일 생성
            const zipBlob = await this.createZipFile(wordBlob, finalData);
            
            // 다운로드
            this.downloadFile(zipBlob, finalData.fileName);
            
            // 완료 메시지
            setTimeout(() => {
                UIManager.showAlert('success', '다운로드 완료!', 'KYC 문서와 이미지들이 포함된 ZIP 파일이 다운로드되었습니다.');
            }, 500);
            
            this.isCompleted = true;
            debugLog('✅ 문서 생성 및 다운로드 완료');
            
        } catch (error) {
            debugLog('❌ 문서 생성 오류', error);
            UIManager.showAlert('error', '생성 실패', `문서 생성 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            this.isGenerating = false;
        }
    }
    
    /**
     * 최종 데이터 준비
     */
    prepareFinalData() {
        const passportData = AppState.data.passport || {};
        const licenseData = AppState.data.license || {};
        const currentDate = new Date().toISOString().slice(0, 10);
        
        // 안전한 파일명 생성
        const safeName = (passportData.fullName || 'KYC_Document').replace(/[^a-zA-Z0-9가-힣]/g, '_');
        const fileName = `KYC_${safeName}_${currentDate.replace(/-/g, '')}.zip`;
        
        return {
            // 개인정보
            full_name: passportData.fullName || '',
            date_of_birth: passportData.dateOfBirth || '',
            gender: passportData.gender || '',
            nationality: passportData.nationality || '',
            type_of_id: 'Passport + Driver\'s License',
            issuing_country: passportData.issuingCountry || '',
            unique_identification_number: '', // 관리자가 별도 입력
            
            // 주소정보 (3가지 형식)
            original_address: licenseData.originalAddress || '',
            address: licenseData.translatedAddress || '',
            official_address: licenseData.officialAddress || '',
            
            // 날짜정보
            date_of_issue: {
                passport: passportData.issueDate || '',
                license: ''
            },
            date_of_expiry: {
                passport: passportData.expiryDate || '',
                license: ''
            },
            
            // 기타
            email: '',
            additional_notes: `Generated by KYC Document Generator v3.0 on ${currentDate}`,
            
            // 파일 정보
            fileName: fileName,
            generatedDate: currentDate
        };
    }
    
    /**
     * Word 문서 생성
     */
    async createWordDocument(finalData) {
        debugLog('📄 Word 문서 생성 시작', finalData);
        
        try {
            // 현재 날짜를 dd/mm/yyyy 형식으로 생성
            const currentDate = new Date();
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = currentDate.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;
            
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        // 제목
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Translation Certification Form",
                                    bold: true,
                                    size: 32,
                                    color: "0066CC"
                                })
                            ],
                            alignment: docx.AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),
                        
                        // 문서 정보
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Type of Document: ",
                                    bold: true
                                }),
                                new docx.TextRun({
                                    text: "[Identity Documents - Passport & Driver's License]"
                                })
                            ],
                            spacing: { after: 100 }
                        }),
                        
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Language of Document: ",
                                    bold: true
                                }),
                                new docx.TextRun({
                                    text: "[Japanese]"
                                })
                            ],
                            spacing: { after: 100 }
                        }),
                        
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Hash ID of user: ",
                                    bold: true
                                }),
                                new docx.TextRun({
                                    text: "[N/A]"
                                })
                            ],
                            spacing: { after: 100 }
                        }),
                        
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Program: ",
                                    bold: true
                                }),
                                new docx.TextRun({
                                    text: "[KYC Document Generator System]"
                                })
                            ],
                            spacing: { after: 200 }
                        }),
                        
                        // 날짜
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `Date: ${formattedDate}`,
                                    bold: true
                                })
                            ],
                            alignment: docx.AlignmentType.RIGHT,
                            spacing: { after: 300 }
                        }),
                        
                        // Section 1 제목
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Section 1: Personal Data of the Individual",
                                    bold: true,
                                    size: 24,
                                    color: "0066CC"
                                })
                            ],
                            spacing: { before: 200, after: 200 }
                        }),
                        
                        // 테이블 생성
                        new docx.Table({
                            rows: this.createTableRows(finalData)
                        }),
                        
                        // Section 2 제목
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Section 2: Translator Certification",
                                    bold: true,
                                    size: 24,
                                    color: "0066CC"
                                })
                            ],
                            spacing: { before: 400, after: 200 }
                        }),
                        
                        // 인증 문구
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "I, Chae Woong Seok, certify that I am fluent in the English language and have accurately translated the above document from Japanese.",
                                    italic: true
                                })
                            ],
                            spacing: { after: 200 }
                        }),
                        
                        // 서명란 - 동적 생성
                        ...(await this.createSignatureSection())
                    ]
                }]
            });
            
            // Word 파일을 Blob으로 변환
            const blob = await docx.Packer.toBlob(doc);
            debugLog('✅ Word 문서 생성 완료');
            return blob;
            
        } catch (error) {
            debugLog('❌ Word 문서 생성 오류', error);
            throw error;
        }
    }
    
    /**
     * 서명 섹션 생성 (이미지 또는 텍스트)
     */
    async createSignatureSection() {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // 서명 이미지가 있는 경우
        if (AppState.files.signature) {
            try {
                // 파일을 ArrayBuffer로 변환
                const arrayBuffer = await AppState.files.signature.arrayBuffer();
                
                return [
                    // 서명 레이블
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Translator's Signature:",
                                bold: true
                            })
                        ],
                        spacing: { before: 300, after: 100 }
                    }),
                    
                    // 서명 이미지
                    new docx.Paragraph({
                        children: [
                            new docx.ImageRun({
                                data: arrayBuffer,
                                transformation: {
                                    width: 150,
                                    height: 75
                                }
                            })
                        ],
                        spacing: { after: 200 }
                    }),
                    
                    // 날짜
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Date: ${currentDate}`,
                                bold: true
                            })
                        ]
                    })
                ];
                
            } catch (error) {
                debugLog('❌ 서명 이미지 처리 오류, 텍스트로 대체', error);
                // 오류 시 텍스트 서명란으로 대체
                return this.createTextSignatureSection();
            }
        } else {
            // 서명 이미지가 없는 경우 텍스트 서명란
            return this.createTextSignatureSection();
        }
    }
    
    /**
     * 텍스트 서명란 생성
     */
    createTextSignatureSection() {
        return [
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: "Translator's Signature: ________________________     Date: _______________",
                        bold: true
                    })
                ],
                spacing: { before: 300 }
            })
        ];
    }
    
    /**
     * 테이블 행 생성
     */
    createTableRows(data) {
        const rows = [
            // 헤더 행
            new docx.TableRow({
                children: [
                    new docx.TableCell({
                        children: [new docx.Paragraph({
                            children: [new docx.TextRun({ text: "#", bold: true, color: "0066CC" })]
                        })],
                        width: { size: 5, type: docx.WidthType.PERCENTAGE }
                    }),
                    new docx.TableCell({
                        children: [new docx.Paragraph({
                            children: [new docx.TextRun({ text: "Attributes", bold: true, color: "0066CC" })]
                        })],
                        width: { size: 47, type: docx.WidthType.PERCENTAGE }
                    }),
                    new docx.TableCell({
                        children: [new docx.Paragraph({
                            children: [new docx.TextRun({ text: "English - Translation", bold: true, color: "0066CC" })]
                        })],
                        width: { size: 48, type: docx.WidthType.PERCENTAGE }
                    })
                ]
            })
        ];
        
        // 데이터 행들
        const tableData = [
            ["1", "Full name including any aliases", data.full_name],
            ["2", "Unique Identification number", ""], // 관리자가 추가
            ["3", "Type of identification card", "Passport + Driver's License"],
            ["4", "Issued Country", data.issuing_country],
            ["5", "Date of birth", data.date_of_birth],
            ["6", "Gender", data.gender],
            ["7", "Nationality", data.nationality],
            ["8", "Residential address", data.address],
            ["9", "Date of issue", data.date_of_issue.passport],
            ["10", "Date of expiry", data.date_of_expiry.passport],
            ["11", "Any other personal information", ""]
        ];
        
        tableData.forEach(([num, attribute, translation]) => {
            rows.push(new docx.TableRow({
                children: [
                    new docx.TableCell({
                        children: [new docx.Paragraph({
                            children: [new docx.TextRun({ text: num })]
                        })]
                    }),
                    new docx.TableCell({
                        children: [new docx.Paragraph({
                            children: [new docx.TextRun({ text: attribute })]
                        })]
                    }),
                    new docx.TableCell({
                        children: [new docx.Paragraph({
                            children: [new docx.TextRun({ text: translation || "" })]
                        })]
                    })
                ]
            }));
        });
        
        return rows;
    }
    
    /**
     * ZIP 파일 생성
     */
    async createZipFile(wordBlob, finalData) {
        debugLog('📦 ZIP 파일 생성 시작');
        
        try {
            const zip = new JSZip();
            const safeName = (finalData.full_name || 'KYC_Document').replace(/[^a-zA-Z0-9가-힣]/g, '_');
            const currentDate = new Date().toISOString().slice(0, 10);
            
            // 1. Word 문서 추가
            const wordFileName = `KYC_${safeName}_${currentDate}.docx`;
            zip.file(wordFileName, wordBlob);
            
            // 2. 이미지들 추가
            if (AppState.files.passport) {
                const passportExt = AppState.files.passport.name.split('.').pop();
                const passportFileName = `passport_${safeName}.${passportExt}`;
                zip.file(passportFileName, AppState.files.passport);
            }
            
            if (AppState.files.license) {
                const licenseExt = AppState.files.license.name.split('.').pop();
                const licenseFileName = `license_${safeName}.${licenseExt}`;
                zip.file(licenseFileName, AppState.files.license);
            }
            
            if (AppState.files.selfie) {
                const selfieExt = AppState.files.selfie.name.split('.').pop();
                const selfieFileName = `selfie_${safeName}.${selfieExt}`;
                zip.file(selfieFileName, AppState.files.selfie);
            }
            
            // 3. ZIP 파일 생성
            const zipBlob = await zip.generateAsync({type: "blob"});
            debugLog('✅ ZIP 파일 생성 완료');
            return zipBlob;
            
        } catch (error) {
            debugLog('❌ ZIP 파일 생성 오류', error);
            throw error;
        }
    }
    
    /**
     * 파일 다운로드
     */
    downloadFile(blob, fileName) {
        debugLog('💾 파일 다운로드 시작', fileName);
        
        try {
            // 브라우저 기본 다운로드
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            debugLog('✅ 파일 다운로드 완료');
        } catch (error) {
            debugLog('❌ 파일 다운로드 오류', error);
            throw error;
        }
    }
    
    /**
     * 이전 단계로 이동
     */
    goBack() {
        debugLog('⬅️ 이전 단계로 이동');
        if (window.workflowManager) {
            window.workflowManager.goToStep(CONFIG.STEPS.SELFIE);
        }
    }
    
    /**
     * 처음부터 다시 시작
     */
    restart() {
        UIManager.showConfirm(
            '처음부터 다시 시작하시겠습니까?',
            '모든 입력 데이터가 초기화됩니다.',
            {
                confirmButtonText: '다시 시작',
                cancelButtonText: '취소',
                confirmButtonColor: '#dc3545'
            }
        ).then((result) => {
            if (result.isConfirmed) {
                debugLog('🔄 처음부터 다시 시작');
                window.location.reload();
            }
        });
    }
}

// 전역으로 클래스 노출
window.ReviewStep = ReviewStep;