
/**
 * FrameInsight Persistence Layer (Production Bridge)
 * This module connects to your AWS PHP/MySQL Backend.
 * Replace API_BASE_URL with your actual AWS endpoint.
 */

const API_BASE_URL = 'https://your-aws-endpoint.com/api'; // AWS PHP 서버 주소 입력

// Fallback for demo purposes if API is not yet ready
const useLocalStorage = true; 

const getLocal = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocal = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const StorageService = {
  // Projects
  getProjects: async () => {
    if (useLocalStorage) return getLocal('fi_projects', [
      { 
          id: 1, 
          code: "PJ-26-001", 
          name: "LG 베스트샵 개편", 
          client: "LG CNS", 
          period: "2026.01 ~ 2026.06", 
          amt: 732000000, 
          execAmt: 658800000, 
          status: "진행중", 
          salesDept: "DX 사업본부", 
          salesRate: 10, 
          execDept: "플랫폼 개발팀", 
          execRate: 90, 
          profit: 109800000, 
          profitRate: 15.0, 
          isArchived: false,
          issues: [
              { id: 101, user: "김철수", content: "고객사 요구사항 변경으로 인한 2주 일정 지연 발생 가능성 있음.", date: "2026-02-15 14:00", type: "issue" },
              { id: 102, user: "박지민", content: "디자인 시안 A타입으로 확정됨. 퍼블리싱 착수 예정.", date: "2026-02-16 09:30", type: "reply" }
          ]
      },
      { id: 2, code: "PJ-24-005", name: "공공데이터 포털 고도화", client: "B공사", period: "2024.03 ~ 2024.09", amt: 850000000, execAmt: 765000000, status: "완료", salesDept: "공공사업 1팀", salesRate: 100, execDept: "공공사업 1팀", execRate: 100, profit: 153000000, profitRate: 18.0, isArchived: false, issues: [] },
      { id: 3, code: "PJ-23-011", name: "S전자 차세대 시스템", client: "S전자", period: "2023.01 ~ 2023.10", amt: 1200000000, execAmt: 1080000000, status: "완료", salesDept: "DX 사업본부", salesRate: 10, execDept: "플랫폼 개발팀", execRate: 90, profit: 240000000, profitRate: 20.0, isArchived: false, issues: [] },
      { id: 4, code: "PJ-23-025", name: "K-Bank 앱 리뉴얼", client: "K-Bank", period: "2023.05 ~ 2023.12", amt: 500000000, execAmt: 425000000, status: "완료", salesDept: "금융사업 2팀", salesRate: 50, execDept: "디자인팀", execRate: 50, profit: 75000000, profitRate: 15.0, isArchived: false, issues: [] },
      { id: 5, code: "PJ-24-020", name: "차세대 모바일 뱅킹 제안", client: "K-Bank", period: "2024.11 ~ 2024.12", amt: 50000000, execAmt: 50000000, status: "진행대기", salesDept: "금융사업 2팀", salesRate: 50, execDept: "금융사업 2팀", execRate: 50, profit: 0, profitRate: 0, isArchived: false, issues: [] }
    ]);
    
    const res = await fetch(`${API_BASE_URL}/projects.php`);
    return await res.json();
  },
  
  setProjects: async (projects: any[]) => {
    if (useLocalStorage) return setLocal('fi_projects', projects);
    
    await fetch(`${API_BASE_URL}/projects.php`, {
      method: 'POST',
      body: JSON.stringify({ projects })
    });
  },

  // Employees
  getEmployees: async () => {
    if (useLocalStorage) return getLocal('fi_employees', [
      // DX 사업본부
      { id: "EMP-2020-045", name: "김철수", dept: "DX 사업본부", rank: "수석", techGrade: "특급", hireYear: "2020", type: "정규직", salaries: { "2024": 85000000, "2025": 90000000, "2026": 95000000 } },
      { id: "EMP-2021-002", name: "이영희", dept: "DX 사업본부", rank: "책임", techGrade: "고급", hireYear: "2021", type: "정규직", salaries: { "2024": 75000000 } },
      { id: "EMP-2022-003", name: "박지민", dept: "DX 사업본부", rank: "선임", techGrade: "중급", hireYear: "2022", type: "정규직", salaries: { "2024": 65000000 } },
      { id: "EMP-2023-004", name: "최민수", dept: "DX 사업본부", rank: "전임", techGrade: "중급", hireYear: "2023", type: "정규직", salaries: { "2024": 55000000 } },
      { id: "EMP-2024-005", name: "정다은", dept: "DX 사업본부", rank: "사원", techGrade: "초급", hireYear: "2024", type: "정규직", salaries: { "2024": 45000000 } },

      // 플랫폼 개발팀
      { id: "EMP-2024-001", name: "홍길동", dept: "플랫폼 개발팀", rank: "사원", techGrade: "초급", hireYear: "2024", type: "정규직", salaries: { "2024": 50000000, "2025": 54000000, "2026": 58000000 } },
      { id: "EMP-2019-011", name: "강감찬", dept: "플랫폼 개발팀", rank: "팀장", techGrade: "특급", hireYear: "2019", type: "정규직", salaries: { "2024": 92000000 } },
      { id: "EMP-2020-012", name: "이순신", dept: "플랫폼 개발팀", rank: "수석", techGrade: "특급", hireYear: "2020", type: "정규직", salaries: { "2024": 82000000 } },
      
      // 디자인팀 (프리랜서 포함)
      { id: "EMP-2020-021", name: "송혜교", dept: "디자인팀", rank: "수석", techGrade: "특급", hireYear: "2020", type: "정규직", salaries: { "2024": 80000000 } },
      { id: "EMP-2021-022", name: "전지현", dept: "디자인팀", rank: "책임", techGrade: "고급", hireYear: "2021", type: "정규직", salaries: { "2024": 70000000 } },
      { id: "EMP-2024-025", name: "한가인", dept: "디자인팀", rank: "사원", techGrade: "중급", hireYear: "2024", type: "프리랜서", 
        contracts: [
            { id: 1, seq: 1, startDate: "2024-01-01", endDate: "2024-12-31", monthlyAmount: 4500000 },
            { id: 2, seq: 2, startDate: "2025-01-01", endDate: "2025-12-31", monthlyAmount: 5000000 }
        ] 
      },

      // AI 연구소
      { id: "EMP-2018-031", name: "이세돌", dept: "AI 연구소", rank: "소장", techGrade: "특급", hireYear: "2018", type: "정규직", salaries: { "2024": 120000000 } },
      { id: "EMP-2020-032", name: "데미스", dept: "AI 연구소", rank: "수석", techGrade: "특급", hireYear: "2020", type: "정규직", salaries: { "2024": 90000000 } },

      // 퇴사자
      { id: "EMP-2018-991", name: "나퇴사", dept: "CSG", rank: "책임", techGrade: "중급", hireYear: "2018", type: "정규직", salaries: { "2023": 68000000 }, isArchived: true },
      { id: "EMP-2020-992", name: "김과거", dept: "플랫폼 개발팀", rank: "선임", techGrade: "중급", hireYear: "2020", type: "프리랜서", contracts: [{ id: 1, seq: 1, startDate: "2020-01-01", endDate: "2021-12-31", monthlyAmount: 5500000 }], isArchived: true },
      { id: "EMP-2019-993", name: "박떠남", dept: "디자인팀", rank: "전임", techGrade: "중급", hireYear: "2019", type: "정규직", salaries: { "2023": 45000000 }, isArchived: true }
    ]);
    
    const res = await fetch(`${API_BASE_URL}/employees.php`);
    return await res.json();
  },

  setEmployees: async (employees: any[]) => {
    if (useLocalStorage) return setLocal('fi_employees', employees);
    
    await fetch(`${API_BASE_URL}/employees.php`, {
      method: 'POST',
      body: JSON.stringify({ employees })
    });
  },

  // Costs
  getCosts: async () => {
    if (useLocalStorage) return getLocal('fi_costs', [
      { id: 1, date: "2024-10-05", month: 10, pj: "차세대 금융 플랫폼", type: "외주용역비", vendor: "(주)데브솔루션", desc: "서버 개발 용역 1차", amt: 22000000 }
    ]);
    
    const res = await fetch(`${API_BASE_URL}/costs.php`);
    return await res.json();
  },

  setCosts: async (costs: any[]) => {
    if (useLocalStorage) return setLocal('fi_costs', costs);
    
    await fetch(`${API_BASE_URL}/costs.php`, {
      method: 'POST',
      body: JSON.stringify({ costs })
    });
  },

  // Settings
  getSettings: async () => {
    if (useLocalStorage) return getLocal('fi_settings', {
      targetMargin: 20,
      totalCommonCost: 120000000
    });
    
    const res = await fetch(`${API_BASE_URL}/settings.php`);
    return await res.json();
  },

  setSettings: async (settings: any) => {
    if (useLocalStorage) return setLocal('fi_settings', settings);
    
    await fetch(`${API_BASE_URL}/settings.php`, {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }
};
