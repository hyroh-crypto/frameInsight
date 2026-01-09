
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserPlus, Save, UserCheck, ChevronLeft, Search, Users, Calculator, Info, CheckCircle, Briefcase, BadgeCheck, AlertCircle, Trash2, Edit3, Filter, FileSpreadsheet, Plus, X, Calendar, History, Clock, Archive, RotateCcw, UserX, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle, AlertTriangle, Layers, Mail, AtSign } from 'lucide-react';
import { formatNumber } from './utils';
import { StorageService } from './persistence';

interface ContractHistory {
    id: number;
    seq: number;
    startDate: string;
    endDate: string;
    monthlyAmount: number;
}

interface Employee {
  id: string;
  name: string;
  email: string; 
  dept: string;
  rank: string;
  techGrade: string; 
  hireYear: string;
  type: string;
  salaries: Record<string, number>; 
  contracts?: ContractHistory[]; 
  isArchived?: boolean; 
}

export const MockupForm = () => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived'>('active');
  
  const currentYear = new Date().getFullYear().toString();
  const DEFAULT_DOMAIN = "frameout.co.kr";
  const [emailUsername, setEmailUsername] = useState("");

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: "",
    email: "",
    dept: "플랫폼 개발팀",
    rank: "사원",
    techGrade: "초급",
    hireYear: currentYear,
    type: "정규직",
    salaries: { [currentYear]: 0 },
    contracts: [],
    isArchived: false
  });

  const [activeSalaryYear, setActiveSalaryYear] = useState(currentYear);

  const departments = ["플랫폼 개발팀", "DX 사업본부", "디자인팀", "AI 연구소", "금융사업 2팀", "공공사업 1팀", "CSG"];
  const ranks = ["사원", "매니저", "대리", "과장", "차장", "파트장", "팀장", "본부장", "이사", "부사장"];
  const techGrades = ["초급", "중급", "고급", "특급"];

  useEffect(() => {
    const loadEmployees = async () => {
      const data = await StorageService.getEmployees();
      setEmployees(data || []);
    };
    loadEmployees();
  }, []);

  const calculateEmployeeCost = (emp: Employee) => {
    const COMMON_COST = 850000;
    let monthlyBase = 0;
    if (emp.type === '정규직') {
        const annualSal = emp.salaries[currentYear] || Object.values(emp.salaries)[0] || 0;
        monthlyBase = annualSal / 12;
    } else {
        const latest = emp.contracts && emp.contracts.length > 0 ? emp.contracts[emp.contracts.length - 1] : null;
        monthlyBase = latest ? latest.monthlyAmount : 0;
    }
    const insurance = emp.type === "정규직" ? monthlyBase * 0.204 : monthlyBase * 0.05;
    return Math.round((monthlyBase + insurance + COMMON_COST) * 1.05);
  };

  const getDisplayAmount = (emp: Employee) => {
      if (emp.type === '정규직') {
          return emp.salaries[currentYear] || Object.values(emp.salaries)[0] || 0;
      } else {
          const latest = emp.contracts && emp.contracts.length > 0 ? emp.contracts[emp.contracts.length - 1] : null;
          return latest ? latest.monthlyAmount : 0;
      }
  };

  const handleSave = async () => {
    if (!formData.name) { alert("직원 성명을 입력해주세요."); return; }
    const newEmp: Employee = { ...formData, id: `EMP-${formData.hireYear}-${Math.floor(100 + Math.random() * 899)}`, email: emailUsername ? `${emailUsername}@${DEFAULT_DOMAIN}` : "" } as Employee;
    const updated = [newEmp, ...employees];
    setEmployees(updated);
    await StorageService.setEmployees(updated);
    setToastMessage("직원 정보가 성공적으로 등록되었습니다.");
    setShowToast(true);
    setTimeout(() => { setShowToast(false); setViewMode('list'); }, 1200);
  };

  const handleArchive = async (id: string, archive: boolean) => {
    const updated = employees.map(emp => emp.id === id ? { ...emp, isArchived: archive } : emp);
    setEmployees(updated);
    await StorageService.setEmployees(updated);
    setToastMessage(`직원 상태가 변경되었습니다.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const processedEmployees = useMemo(() => {
    let list = employees.filter(e => filterStatus === 'active' ? !e.isArchived : e.isArchived);
    if (searchTerm.trim()) {
       const lowerTerm = searchTerm.toLowerCase();
       list = list.filter(e => e.name.toLowerCase().includes(lowerTerm) || e.dept.toLowerCase().includes(lowerTerm));
    }
    return list;
  }, [employees, searchTerm, filterStatus]);

  const totalMonthlyCostSum = useMemo(() => processedEmployees.reduce((sum, emp) => sum + calculateEmployeeCost(emp), 0), [processedEmployees]);

  if (viewMode === 'list') {
    return (
      <div className="h-full flex flex-col bg-slate-50 p-6 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2"><Users className="text-orange-500" size={24} /><h2 className="text-xl font-bold text-slate-800 tracking-tight">직원 정보 관리</h2></div>
                <button onClick={() => setViewMode('form')} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md active:scale-95 transition-all"><Plus size={16} className="mr-2" /> 신규 등록</button>
            </div>
            <div className="p-6 pb-2 shrink-0">
                <div className="flex justify-between items-end mb-4">
                     <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setFilterStatus('active')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${filterStatus === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>재직자</button>
                        <button onClick={() => setFilterStatus('archived')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${filterStatus === 'archived' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}>퇴사자</button>
                     </div>
                     <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-lg flex flex-col items-end"><span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Total Monthly Cost</span><span className="font-black text-orange-600 text-lg leading-none">₩ {formatNumber(totalMonthlyCostSum)}</span></div>
                </div>
                <div className="relative w-full"><Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /><input className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 shadow-sm" placeholder="직원 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            </div>
            <div className="flex-1 overflow-auto px-6 pb-6 mt-4">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-t border-b border-gray-200 sticky top-0 z-10">
                        <tr><th className="px-6 py-4">성명 / 이메일</th><th className="px-6 py-4">소속 부서</th><th className="px-6 py-4">직급</th><th className="px-6 py-4">고용 형태</th><th className="px-6 py-4 text-right">급여 정보</th><th className="px-6 py-4 text-right text-orange-600">월 원가</th><th className="px-6 py-4 text-center">작업</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                        {processedEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50 group">
                                <td className="px-6 py-4"><div className="font-bold text-slate-800">{emp.name}</div><div className="text-[10px] text-slate-400 mt-0.5">{emp.email || "미등록"}</div></td>
                                <td className="px-6 py-4 text-slate-600">{emp.dept}</td>
                                <td className="px-6 py-4"><span className="px-2 py-0.5 border border-gray-200 rounded text-slate-600 text-[11px] font-bold">{emp.rank}</span></td>
                                <td className="px-6 py-4"><span className={`font-bold text-xs ${emp.type === '정규직' ? 'text-blue-600' : 'text-purple-600'}`}>{emp.type}</span></td>
                                <td className="px-6 py-4 text-right font-mono text-slate-500">₩ {formatNumber(getDisplayAmount(emp))}</td>
                                <td className="px-6 py-4 text-right font-black text-orange-600 font-mono">₩ {formatNumber(calculateEmployeeCost(emp))}</td>
                                <td className="px-6 py-4 text-center">
                                   <div className="flex items-center justify-center space-x-1 opacity-60 group-hover:opacity-100">
                                      {emp.isArchived ? <button onClick={() => handleArchive(emp.id, false)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><UserPlus size={16}/></button> : <button onClick={() => handleArchive(emp.id, true)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg"><Archive size={16}/></button>}
                                   </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fadeIn overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2"><button onClick={() => setViewMode('list')} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft size={20} /></button><h2 className="text-lg font-bold text-slate-800 tracking-tight">직원 정보 상세 등록</h2></div>
        <div className="flex space-x-2"><button onClick={() => setViewMode('list')} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded text-sm">취소</button><button onClick={handleSave} className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-bold flex items-center shadow-sm hover:bg-orange-700 transition-all active:scale-95"><Save size={14} className="mr-2" /> 저장</button></div>
      </div>
      <div className="p-8 flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 pb-4">
                <h3 className="text-sm font-bold text-slate-800 mb-6 border-l-4 border-slate-800 pl-3">기본 인적 사항</h3>
                <div className="grid grid-cols-2 gap-6 mb-5">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">성명</label><input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="성명 입력" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">이메일 ID</label><div className="flex items-center"><input type="text" className="flex-1 border border-r-0 border-gray-300 rounded-l px-3 py-2 text-sm outline-none focus:border-orange-500" value={emailUsername} onChange={(e) => setEmailUsername(e.target.value)} /><span className="bg-slate-50 border border-l-0 border-gray-300 rounded-r px-3 py-2 text-xs font-bold text-slate-400">@frameout.co.kr</span></div></div>
                </div>
            </div>
            <div className="p-8 pt-0">
                <div className="grid grid-cols-2 gap-8 items-start">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col items-end"><label className="text-xs font-bold text-slate-500 mb-2">월 인건비 원가 (시뮬레이션)</label><div className="text-right font-mono font-black text-orange-600 text-xl">₩ {formatNumber(calculateEmployeeCost(formData as any))}</div></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const MockupAllocation = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    
    useEffect(() => {
      const loadData = async () => {
        const [pj, emp] = await Promise.all([StorageService.getProjects(), StorageService.getEmployees()]);
        setProjects(pj || []);
        setEmployees(emp || []);
      };
      loadData();
    }, []);

    const allocationData = useMemo(() => {
        if (!employees.length) return [];
        return employees.filter(e => !e.isArchived).map((emp, i) => {
            const items = [];
            if (i % 4 === 0) { items.push({ name: "Project Alpha", pct: 0.7 }); items.push({ name: "Project Beta", pct: 0.3 }); } 
            else if (i % 4 === 1) { items.push({ name: "Project Gamma", pct: 1.0 }); }
            else { items.push({ name: "Idle (유휴)", pct: 1.0, idle: true }); }
            const usedRate = items.reduce((acc, cur) => cur.idle ? acc : acc + cur.pct, 0);
            return { ...emp, allocations: items, usedRate };
        });
    }, [employees]);

    const groupedData = useMemo(() => {
        const g: Record<string, any[]> = {};
        allocationData.forEach(p => { const key = p.dept; if (!g[key]) g[key] = []; g[key].push(p); });
        return Object.keys(g).sort().map(title => ({ title, items: g[title] }));
    }, [allocationData]);

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fadeIn overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center space-x-2"><UserCheck size={20} className="text-orange-500" /><h2 className="text-lg font-bold text-slate-800">부서별 인력 배정 및 가동률</h2></div>
          </div>
          <div className="p-6 space-y-8">
             {groupedData.map((group, gIdx) => (
                <div key={gIdx}>
                    <h3 className="text-xs font-black text-slate-500 mb-4 flex items-center uppercase tracking-widest bg-slate-100 w-fit px-3 py-1 rounded-full border border-slate-200">{group.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {group.items.map((person: any, i: number) => (
                            <div key={i} className={`bg-white border rounded-2xl p-6 shadow-sm transition-all hover:shadow-lg relative overflow-hidden ${person.usedRate > 1.0 ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-4">
                                   <div><div className="flex items-baseline space-x-2"><div className="font-black text-slate-800 text-lg">{person.name}</div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{person.rank}</span></div></div>
                                   <div className="text-right"><div className={`text-2xl font-black ${person.usedRate > 1.0 ? 'text-red-600' : 'text-slate-700'}`}>{(person.usedRate * 100).toFixed(0)}<span className="text-sm">%</span></div></div>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    {person.allocations.map((pj: any, j: number) => (
                                        <div key={j}>
                                            <div className="flex justify-between text-[11px] mb-1.5 font-bold tracking-tight">
                                                <span className={`truncate pr-2 ${pj.idle ? 'text-slate-300 italic' : 'text-slate-700'}`}>{pj.name}</span>
                                                <span className={pj.idle ? 'text-slate-300' : 'text-orange-600'}>
                                                  {(pj.pct * 100).toFixed(0)}% <span className="text-[9px] opacity-70">({pj.pct} M/M)</span>
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full ${pj.idle ? 'bg-slate-200' : 'bg-orange-500'}`} style={{width: `${pj.pct * 100}%`}}></div></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             ))}
          </div>
        </div>
    );
};
