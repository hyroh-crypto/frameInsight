
import { Feature, Permission, Screen, Inquiry } from './types';

export const featuresData: Feature[] = [
  { id: "F001", name: "월별 기준정보 관리", desc: "월별 목표 매출/이익률/1인당 공통비 설정. 마감 상태(대기/진행/완료) 관리 기능 포함", auth: "관리자", required: "필수", priority: "높음" },
  { id: "F002", name: "프로젝트 등록 및 시뮬레이션", desc: "견적 기반 등록, 영업/수행 기여율 설정 및 예상 수익률(Profitability) 시뮬레이션 기능", auth: "관리자, 부서장", required: "필수", priority: "높음" },
  { id: "F003", name: "비용 집행 및 증빙 관리", desc: "외주 용역비, SW 구입비 등 비목별 상세 집행 내역 관리 및 파일 증빙(File Attachment) 연결", auth: "관리자, 부서장", required: "필수", priority: "높음" },
  { id: "F004", name: "월별 매출 기성 및 정산", desc: "부서별 매출 배분 반영 및 월간 손익 리포트(S007) 자동 생성", auth: "관리자, 부서장", required: "필수", priority: "높음" },
  { id: "F005", name: "직원 정보 관리 및 일괄 등록", desc: "개별 등록 외 Excel/CSV 파일을 통한 대량 인원 업로드 기능 지원", auth: "관리자", required: "필수", priority: "높음" },
  { id: "F006", name: "인건비 원가 자동 시뮬레이터", desc: "고용 형태(정규직/프리랜서)별 보험료, 퇴직금, 공통비를 포함한 실제 원가 실시간 계산", auth: "시스템(자동)", required: "필수", priority: "높음" },
  { id: "F007", name: "인력 배정(Allocation) 관리", desc: "월별/직원별 투입 프로젝트 매핑 및 100% 가동률 체크 로직", auth: "관리자, 부서장", required: "필수", priority: "높음" },
  { id: "F008", name: "공통비 배분 로직 적용", desc: "CSG 부서 인건비 및 전사 운영비를 부서별 Headcount 기준으로 자동 배분", auth: "시스템(자동)", required: "필수", priority: "높음" },
  { id: "F009", name: "부서별 이익 기여도 분석", desc: "전사 이익 대비 기여 비중 시각화 및 부서별 랭킹/성적(Grade) 부여", auth: "전체", required: "필수", priority: "중간" },
  { id: "F010", name: "유휴 비용(Idle Cost) 시각화", desc: "미배정 인력의 원가를 부서별 손실 항목으로 대시보드 및 리포트에 반영", auth: "시스템(자동)", required: "필수", priority: "높음" },
  { id: "F011", name: "인텔리전트 대시보드", desc: "주요 KPI 조회 및 지표 아이콘(?) 클릭 시 계산 수식/정의 팝업 가이드 제공", auth: "전체", required: "필수", priority: "높음" },
  { id: "F012", name: "부서 간 인력 대여 정산", desc: "타 부서 인력 지원 시 원가 이동 처리(대여 부서 수익+, 차용 부서 비용+)", auth: "시스템(자동)", required: "필수", priority: "높음" },
  { id: "F013", name: "제안 프로젝트 리뷰 및 정산", desc: "RFP 기반 제안 등록, 인력 배정 및 담당 부서 비용 차감/소속 부서 매출 인정 정산 로직 적용", auth: "관리자, 부서장", required: "필수", priority: "높음" },
  { id: "F014", name: "개인 정보 및 비밀번호 관리", desc: "본인의 기본 정보 조회 및 보안을 위한 주기적 비밀번호 변경 기능", auth: "전체", required: "필수", priority: "중간" },
];

export const permissionsData: Permission[] = [
  { id: "P001", name: "최고 관리자 (Admin)", desc: "전사 기준정보, 인력 관리, 마감", menus: "전체 메뉴 접근", actions: "기준정보 수정, 직원 등록/삭제, 아카이브 관리, 전체 마감" },
  { id: "P002", name: "부서장 (Director)", desc: "소속 부서 손익 및 프로젝트 관리", menus: "대시보드, 프로젝트 관리, 인력 배정, 리포트", actions: "부서원 배정, 프로젝트 시뮬레이션, 비용 입력" },
  { id: "P003", name: "일반 직원 (Staff)", desc: "본인 투입 정보 및 전사 성과 조회", menus: "대시보드(요약), 개인 투입 현황, 내 정보", actions: "데이터 조회(Read-only), 비밀번호 변경" },
];

export const screensData: Screen[] = [
  { id: "S000", name: "로그인", desc: "FrameInsight 인증 및 세션 관리", features: ["-"], data: "사용자 ID, 비밀번호", roleAccess: ["P001", "P002", "P003"] },
  { id: "S001", name: "메인 대시보드", desc: "전사 KPI(매출, 이익, UCM) 및 도움말 툴팁", features: ["F009", "F011"], data: "KPI 데이터, 부서별 랭킹, 비용 구성비", roleAccess: ["P001", "P002", "P003"] },
  { id: "S002", name: "기준정보 설정", desc: "월별 목표 관리 및 부서 삭제/인원이동 로직", features: ["F001", "F005"], data: "월별 목표, 부서 목록, 부서별 인원 원가", roleAccess: ["P001"] },
  { id: "S003", name: "프로젝트 관리", desc: "프로젝트 등록, 아카이브 및 수익률 관리 연결", features: ["F002"], data: "프로젝트 코드, 계약 정보, 기여도 설정", roleAccess: ["P001", "P002"] },
  { id: "S004", name: "비용 집행 관리", desc: "증빙 파일 연동 및 비목별 비용 상세", features: ["F003"], data: "집행일자, 거래처, 금액, 증빙 유무", roleAccess: ["P001", "P002"] },
  { id: "S005", name: "인사 정보 관리", desc: "직원 상세 등록 및 엑셀 일괄 업로드", features: ["F005", "F006"], data: "사번, 연봉계약, 원가 계산식", roleAccess: ["P001"] },
  { id: "S006", name: "인력 배정 현황", desc: "월별 가동률(100%) 관리 및 프로젝트 매핑", features: ["F007"], data: "투입 M/M, 유휴 상태", roleAccess: ["P001", "P002"] },
  { id: "S007", name: "손익 리포트", desc: "전사/부서별 상세 손익 및 Excel 다운로드", features: ["F004", "F008", "F010", "F012"], data: "매출, 직접비, 공통비, 영업이익", roleAccess: ["P001", "P002"] },
  { id: "S008", name: "제안 리뷰 및 정산", desc: "제안 작성 시 인력 배정에 따른 부서 간 정산 및 RFP 관리", features: ["F013"], data: "제안 예산, 제안 마감일, 인력 배정 내역", roleAccess: ["P001", "P002"] },
  { id: "S009", name: "내 정보 관리", desc: "개인 프로필 확인 및 비밀번호 변경 (급여 정보 제외)", features: ["F014"], data: "이름, 이메일, 비밀번호", roleAccess: ["P001", "P002", "P003"] },
];

export const inquiriesData: Inquiry[] = [
  { 
    id: 1, 
    category: "Logic", 
    question: "[F008] 공통비 배분 시 중도 입사/퇴사자 처리는 어떻게 합니까?", 
    implication: "당월 재직 일수 비례(Pro-rata) 배분 여부 결정 필요", 
    status: "pending",
    answer: "확인 중 (재직 일수 비례 검토 권장)"
  },
  { 
    id: 2, 
    category: "Data", 
    question: "[F005] 엑셀 일괄 등록용 표준 템플릿(Excel Sample)이 준비되어 있습니까?", 
    implication: "파싱 로직 고정 및 업로드 실패 예외 처리 기준", 
    status: "pending",
    answer: "확인 중 (시스템에서 다운로드 가능한 템플릿 제공 필요)"
  },
  { 
    id: 3, 
    category: "UX/UI", 
    question: "[S001] 대시보드의 도움말(?) 툴팁 수식은 관리자가 직접 수정 가능해야 합니까?", 
    implication: "DB화 필요성 또는 하드코딩 여부 결정", 
    status: "resolved",
    answer: "하드코딩 (시스템 로직이 변경되지 않는 한 고정 문구 사용)"
  },
  { 
    id: 4, 
    category: "Security", 
    question: "[F002] 아카이브된 프로젝트의 데이터를 대시보드 과거 추이에 포함합니까?", 
    implication: "통계 쿼리 시 Filter 조건 영향", 
    status: "resolved",
    answer: "포함 (목록에서만 숨겨지며, 모든 통계 수치에는 반영)"
  },
  { 
    id: 5, 
    category: "Logic", 
    question: "[F012] 부서 간 인력 지원 시 매출 기여도는 어떻게 정산합니까?", 
    implication: "영업 기여도 vs 수행 기여도 배분 공식 영향", 
    status: "resolved",
    answer: "수행 부서의 매출로 인식하되, 지원 인력의 원가를 지원 받은 부서가 부담"
  },
];
