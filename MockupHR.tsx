
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserPlus, Save, UserCheck, ChevronLeft, Search, Users, Plus, Archive, UserX, FileSpreadsheet, HelpCircle, Calendar, AlertCircle, RotateCcw, UserMinus, ArrowUpDown, ArrowUp, ArrowDown, X, Mail, BarChart3, AlertTriangle, CheckCircle2, Filter, Briefcase, Layers } from 'lucide-react';
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
  salaries?: Record<string, number>; 
  contracts?: ContractHistory[]; 
  isArchived?: boolean; 
}

// --- S005: Employee Management ---
export const MockupForm = () => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived'>('active');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Tooltip State
  const [showCostHelp, setShowCostHelp] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear().toString();
  const DEFAULT_DOMAIN = "frameout.co.kr";

  // Form State
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: "",
    email: "",
    dept: "플랫폼 개발팀",
    rank: "사원",
    techGrade: "초급",
    hireYear: "2026",
    type: "정규직",
    salaries: { "2026": 0 },
    contracts: [],
    isArchived: false
  });
  
  // Local state for Email Split
  const [emailLocal, setEmailLocal] = useState({ id: "", domain: DEFAULT_DOMAIN });

  const [activeSalaryYear, setActiveSalaryYear] = useState("2026");
  const [activeContractIndex, setActiveContractIndex] = useState(0);

  const departments = ["DX 사업본부", "플랫폼 개발팀", "디자인팀", "AI 연구소", "금융사업 2팀", "공공사업 1팀", "CSG"];
  const ranks = ["사원", "전임", "선임", "책임", "수석", "팀장", "소장", "본부장", "이사"];
  const techGrades = ["초급", "중급", "고급", "특급"];

  useEffect(() => {
    const loadEmployees = async () => {
      const data = await StorageService.getEmployees();
      setEmployees(data || []);
    };
    loadEmployees();

    const handleClickOutside = (event: MouseEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
            setShowCostHelp(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const COMMON_COST = 850000;

  const calculateEmployeeCost = (emp: Employee | typeof formData, specificYear?: string) => {
    let monthlyBase = 0;
    const yearToUse = specificYear || activeSalaryYear;
    
    if (emp.type === '정규직') {
        const salaries = emp.salaries || {};
        let annualSal = 0;
        if (specificYear) {
             const years = Object.keys(salaries).sort();
             annualSal = salaries[years[years.length - 1]] || 0;
        } else {
             annualSal = salaries[yearToUse] || 0;
        }

        monthlyBase = annualSal / 12;
        const insurance = monthlyBase * 0.12;
        const severance = monthlyBase * 0.083333; // ~ 1/12
        return Math.round((monthlyBase + insurance + severance + COMMON_COST) * 1.05);
    } else {
        const contracts = emp.contracts || [];
        let currentContract;
        
        if (emp === formData) {
             currentContract = contracts[activeContractIndex];
        } else {
             currentContract = contracts.length > 0 ? contracts[contracts.length - 1] : undefined;
        }
        
        monthlyBase = currentContract ? currentContract.monthlyAmount : 0;
        const insurance = monthlyBase * 0.05;
        return Math.round((monthlyBase + insurance + COMMON_COST) * 1.05);
    }
  };

  const getDisplayAmount = (emp: Employee) => {
      if (emp.type === '정규직') {
          const salaries = emp.salaries || {};
          const years = Object.keys(salaries).sort();
          const latestYear = years[years.length - 1];
          return salaries[latestYear] || 0;
      } else {
          const latest = emp.contracts && emp.contracts.length > 0 ? emp.contracts[emp.contracts.length - 1] : null;
          return latest ? latest.monthlyAmount : 0;
      }
  };

  const handleSave = async () => {
    if (!formData.name) { alert("직원 성명을 입력해주세요."); return; }
    
    if (!window.confirm("직원 정보를 저장하시겠습니까?")) return;

    // Auto-generate ID logic
    let newId = selectedEmpId;
    if (!newId) {
        newId = `EMP-${formData.hireYear}-${Math.floor(100 + Math.random() * 899)}`;
    }

    // Combine Email
    const fullEmail = emailLocal.id ? `${emailLocal.id}@${emailLocal.domain}` : "";

    const newEmp: Employee = { 
        ...formData, 
        id: newId, 
        email: fullEmail
    } as Employee;

    let updatedEmployees;
    if (selectedEmpId) {
        updatedEmployees = employees.map(e => e.id === selectedEmpId ? newEmp : e);
    } else {
        updatedEmployees = [newEmp, ...employees];
    }

    setEmployees(updatedEmployees);
    await StorageService.setEmployees(updatedEmployees);
    
    setToastMessage("직원 정보가 성공적으로 저장되었습니다.");
    setShowToast(true);
    setTimeout(() => { setShowToast(false); setViewMode('list'); setSelectedEmpId(null); }, 1200);
  };

  const handleArchive = async (emp: Employee, archive: boolean) => {
      const actionName = archive ? "퇴사(보관)" : "복구(재직)";
      if (!window.confirm(`'${emp.name}' 직원을 ${actionName} 처리하시겠습니까?`)) return;

      const updatedEmployees = employees.map(e => e.id === emp.id ? { ...e, isArchived: archive } : e);
      setEmployees(updatedEmployees);
      await StorageService.setEmployees(updatedEmployees);

      setToastMessage(`직원 정보가 ${actionName} 되었습니다.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
  };

  const handleEdit = (emp: Employee) => {
      setSelectedEmpId(emp.id);
      const salaries = emp.salaries || {};
      const latestYear = Object.keys(salaries).sort().pop() || currentYear;
      
      // Parse Email
      let eId = "";
      let eDomain = DEFAULT_DOMAIN;
      if (emp.email && emp.email.includes('@')) {
          const parts = emp.email.split('@');
          eId = parts[0];
          eDomain = parts[1];
      } else {
          eId = emp.email || "";
      }

      setFormData({
          name: emp.name,
          email: emp.email,
          dept: emp.dept,
          rank: emp.rank,
          techGrade: emp.techGrade || "초급",
          hireYear: emp.hireYear,
          type: emp.type,
          salaries: { ...salaries },
          contracts: emp.contracts ? [...emp.contracts] : [],
          isArchived: emp.isArchived
      });
      setEmailLocal({ id: eId, domain: eDomain });
      setActiveSalaryYear(latestYear);
      setActiveContractIndex(0);
      setViewMode('form');
  };

  const handleNew = () => {
      setSelectedEmpId(null);
      setFormData({
        name: "",
        email: "",
        dept: "플랫폼 개발팀",
        rank: "사원",
        techGrade: "초급",
        hireYear: "2026",
        type: "정규직",
        salaries: { "2026": 0 },
        contracts: [],
        isArchived: false
      });
      setEmailLocal({ id: "", domain: DEFAULT_DOMAIN });
      setActiveSalaryYear("2026");
      setActiveContractIndex(0);
      setViewMode('form');
  };

  const handleSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  // --- Sorting & Filtering ---
  const processedEmployees = useMemo(() => {
    let list = employees.filter(e => filterStatus === 'active' ? !e.isArchived : e.isArchived);
    
    if (searchTerm.trim()) {
       const lowerTerm = searchTerm.toLowerCase();
       list = list.filter(e => e.name.toLowerCase().includes(lowerTerm) || e.dept.toLowerCase().includes(lowerTerm) || e.rank.toLowerCase().includes(lowerTerm));
    }

    if (sortConfig) {
        list.sort((a, b) => {
            let valA: any = a[sortConfig.key as keyof Employee];
            let valB: any = b[sortConfig.key as keyof Employee];

            if (sortConfig.key === 'salary') {
                valA = getDisplayAmount(a);
                valB = getDisplayAmount(b);
            } else if (sortConfig.key === 'cost') {
                valA = calculateEmployeeCost(a, 'sort');
                valB = calculateEmployeeCost(b, 'sort');
            } else if (sortConfig.key === 'name_id') {
                valA = a.name;
                valB = b.name;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return list;
  }, [employees, searchTerm, filterStatus, sortConfig]);

  const totalMonthlyCostSum = useMemo(() => {
      return processedEmployees.reduce((sum, emp) => sum + calculateEmployeeCost(emp, 'latest'), 0);
  }, [processedEmployees]);

  const SortIcon = ({ column }: { column: string }) => {
      if (sortConfig?.key !== column) return <ArrowUpDown size={12} className="ml-1 text-slate-300 opacity-50 group-hover:opacity-100 transition-opacity" />;
      return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 text-orange-500" /> : <ArrowDown size={12} className="ml-1 text-orange-500" />;
  };

  const handleAddYear = () => {
      const salaries = formData.salaries || {};
      const years = Object.keys(salaries).map(Number);
      const maxYear = years.length > 0 ? Math.max(...years, parseInt(currentYear)) : parseInt(currentYear);
      const nextYear = (maxYear + 1).toString();
      setFormData(prev => ({
          ...prev,
          salaries: { ...prev.salaries, [nextYear]: prev.salaries?.[maxYear.toString()] || 0 }
      }));
      setActiveSalaryYear(nextYear);
  };

  const handleAddContract = () => {
      const nextSeq = (formData.contracts?.length || 0) + 1;
      const newContract: ContractHistory = {
          id: Date.now(),
          seq: nextSeq,
          startDate: `${parseInt(currentYear)+1}-01-01`,
          endDate: `${parseInt(currentYear)+1}-12-31`,
          monthlyAmount: 0
      };
      const updatedContracts = [...(formData.contracts || []), newContract];
      setFormData(prev => ({ ...prev, contracts: updatedContracts }));
      setActiveContractIndex(updatedContracts.length - 1);
  };

  const updateContract = (index: number, field: keyof ContractHistory, value: any) => {
      const updated = [...(formData.contracts || [])];
      if (updated[index]) {
          updated[index] = { ...updated[index], [field]: value };
          setFormData({ ...formData, contracts: updated });
      }
  };

  if (viewMode === 'list') {
    return (
      <div className="h-full flex flex-col bg-slate-50 p-6 animate-fadeIn font-sans">
        {showToast && (
          <div className="absolute top-4 right-4 z-[100] animate-bounceIn bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 border border-slate-700">
            <UserCheck className="text-green-400" size={20} />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2"><Users className="text-orange-500" size={24} /><h2 className="text-xl font-bold text-slate-800 tracking-tight">직원 정보 관리</h2></div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg text-sm font-bold shadow-sm hover:bg-green-50 flex items-center transition-colors">
                        <FileSpreadsheet size={16} className="mr-2"/> 엑셀 일괄 등록
                    </button>
                    <button onClick={handleNew} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-700 active:scale-95 transition-all flex items-center">
                        <UserPlus size={16} className="mr-2" /> 신규 직원 등록
                    </button>
                </div>
            </div>
            
            <div className="p-6 pb-2 shrink-0">
                <div className="flex justify-between items-center mb-6">
                     <div className="bg-slate-100 p-1 rounded-lg flex">
                        <button onClick={() => setFilterStatus('active')} className={`flex items-center px-4 py-2 text-sm font-bold rounded-md transition-all ${filterStatus === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                            <UserCheck size={14} className="mr-2"/> 재직자 (Active)
                        </button>
                        <button onClick={() => setFilterStatus('archived')} className={`flex items-center px-4 py-2 text-sm font-bold rounded-md transition-all ${filterStatus === 'archived' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                            <UserX size={14} className="mr-2"/> 퇴사자 (Resigned)
                        </button>
                     </div>
                     <div className="flex space-x-4 bg-orange-50 border border-orange-100 px-6 py-3 rounded-xl shadow-sm">
                         <div className="border-r border-orange-200 pr-6 text-right">
                             <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">Total Employees</div>
                             <div className="font-black text-slate-800 text-xl">{processedEmployees.length}명</div>
                         </div>
                         <div className="text-right">
                             <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">Monthly Cost Sum</div>
                             <div className="font-black text-orange-600 text-xl tracking-tight">₩ {formatNumber(totalMonthlyCostSum)}</div>
                         </div>
                     </div>
                </div>
                <div className="relative w-full">
                    <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 shadow-sm transition-all" placeholder="이름, 부서, 직급 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="flex-1 overflow-auto px-6 pb-6 mt-2 relative">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-t border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('name_id')}>
                                <div className="flex items-center">성명 / 사번 <SortIcon column="name_id" /></div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('dept')}>
                                <div className="flex items-center">소속 부서 <SortIcon column="dept" /></div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('rank')}>
                                <div className="flex items-center">직급 / 등급 <SortIcon column="rank" /></div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('type')}>
                                <div className="flex items-center">고용 형태 <SortIcon column="type" /></div>
                            </th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('salary')}>
                                <div className="flex items-center justify-end">연봉(정규직) / 월지급(프리랜서) <SortIcon column="salary" /></div>
                            </th>
                            <th className="px-6 py-4 text-right text-orange-600 font-black cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-end group" onClick={() => handleSort('cost')}>
                                <div className="flex items-center justify-end relative">
                                    <span>월 인건비 원가 (Cost)</span> <SortIcon column="cost" />
                                    <button 
                                        className="ml-1.5 text-orange-400 hover:text-orange-600"
                                        onClick={(e) => { e.stopPropagation(); setShowCostHelp(!showCostHelp); }}
                                    >
                                        <HelpCircle size={14}/>
                                    </button>
                                    
                                    {showCostHelp && (
                                        <div ref={tooltipRef} className="absolute top-full right-0 mt-2 w-96 bg-slate-800 text-slate-100 p-5 rounded-xl shadow-2xl border border-slate-700 z-[100] cursor-default text-left animate-fadeIn">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-sm font-bold text-orange-400">월 인건비 원가 계산식</h4>
                                                <button onClick={() => setShowCostHelp(false)}><X size={14} className="text-slate-400 hover:text-white"/></button>
                                            </div>
                                            <div className="space-y-4 text-xs font-mono leading-relaxed">
                                                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                                                    <div className="font-bold text-blue-300 mb-1.5">정규직 (Regular)</div>
                                                    <p>(연봉 ÷ 12) + 4대보험(12%) + 퇴직금(8.4%) + 공통비(85만)</p>
                                                    <p className="mt-1 text-slate-400">× 1.05 (Risk Buffer)</p>
                                                </div>
                                                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                                                    <div className="font-bold text-purple-300 mb-1.5">프리랜서 (Freelancer)</div>
                                                    <p>월계약액 + 4대보험(5% 임의) + 공통비(85만)</p>
                                                    <p className="mt-1 text-slate-400">× 1.05 (Risk Buffer)</p>
                                                </div>
                                            </div>
                                            <div className="absolute -top-1.5 right-12 w-3 h-3 bg-slate-800 rotate-45 border-t border-l border-slate-700"></div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                        {processedEmployees.map((emp) => {
                            const cost = calculateEmployeeCost(emp, 'sort'); 
                            const displayAmt = getDisplayAmount(emp);
                            const isReg = emp.type === '정규직';
                            return (
                            <tr key={emp.id} onClick={() => handleEdit(emp)} className="hover:bg-orange-50/10 group transition-colors cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="font-black text-slate-800 text-base mb-0.5">{emp.name}</div>
                                    <div className="text-xs text-slate-400 font-mono">{emp.id}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 font-medium">{emp.dept}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 border border-slate-200 rounded text-slate-600 text-xs font-bold bg-white">{emp.rank}</span>
                                        {emp.techGrade && <span className="text-xs text-slate-400">{emp.techGrade}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-bold text-xs ${isReg ? 'text-blue-600' : 'text-purple-600'}`}>
                                        {emp.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-slate-600">
                                    ₩ {formatNumber(displayAmt)} {isReg ? '' : '/월'}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-orange-600 font-mono">
                                    ₩ {formatNumber(cost)}
                                </td>
                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                   {filterStatus === 'active' ? (
                                       <button 
                                            onClick={() => handleArchive(emp, true)} 
                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="퇴사 처리 (보관함 이동)"
                                       >
                                          <UserMinus size={18} />
                                       </button>
                                   ) : (
                                       <button 
                                            onClick={() => handleArchive(emp, false)} 
                                            className="p-2 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                            title="복구 (재직 처리)"
                                       >
                                          <RotateCcw size={18} />
                                       </button>
                                   )}
                                </td>
                            </tr>
                        )})}
                        {processedEmployees.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-20 text-gray-400 font-medium">데이터가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }

  // Form View Code (Same as before)
  const isRegular = formData.type === '정규직';
  const calculatedCost = calculateEmployeeCost(formData);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fadeIn overflow-y-auto font-sans">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-2">
            <button onClick={() => setViewMode('list')} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">직원 정보 상세 등록</h2>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => setViewMode('list')} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded text-sm font-bold hover:bg-gray-50 transition-colors">
                취소
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-bold flex items-center shadow-md hover:bg-orange-700 transition-all active:scale-95">
                <Save size={14} className="mr-2" /> 저장
            </button>
        </div>
      </div>

      <div className="p-8 flex justify-center pb-20">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section 1: Basic Info */}
            <div className="p-8 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-6 border-l-4 border-slate-800 pl-3 h-5">
                    <h3 className="text-sm font-bold text-slate-800">기본 인적 사항</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {/* Row 1 */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">성명 (Name)</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-orange-500 outline-none transition-colors" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="성명 입력" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">사번 (ID)</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm text-slate-500 outline-none" 
                            value={selectedEmpId || "EMP-2026-XXX"} 
                            readOnly 
                        />
                    </div>

                    {/* Row 2 - Email */}
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center"><Mail size={12} className="mr-1"/> 이메일 (Email)</label>
                        <div className="flex items-center">
                            <input 
                                type="text"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 transition-colors text-right pr-2"
                                placeholder="Email ID"
                                value={emailLocal.id}
                                onChange={(e) => setEmailLocal({...emailLocal, id: e.target.value})}
                            />
                            <span className="px-3 text-slate-400 font-bold">@</span>
                            <div className="flex-1 relative">
                                <input 
                                    type="text"
                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${isRegular ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:border-orange-500'}`}
                                    value={isRegular ? DEFAULT_DOMAIN : emailLocal.domain}
                                    onChange={(e) => !isRegular && setEmailLocal({...emailLocal, domain: e.target.value})}
                                    readOnly={isRegular}
                                />
                                {isRegular && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">회사 계정 고정</span>}
                            </div>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">소속 부서</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 bg-white"
                            value={formData.dept}
                            onChange={(e) => setFormData({...formData, dept: e.target.value})}
                        >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">직급</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 bg-white"
                                value={formData.rank}
                                onChange={(e) => setFormData({...formData, rank: e.target.value})}
                            >
                                {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-orange-600">기술 등급 (Skill Level)</label>
                            <select 
                                className="w-full border border-orange-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 bg-orange-50 text-slate-800 font-bold"
                                value={formData.techGrade}
                                onChange={(e) => setFormData({...formData, techGrade: e.target.value})}
                            >
                                {techGrades.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">입사 년도 (Hire Year)</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 bg-white"
                            value={formData.hireYear}
                            onChange={(e) => setFormData({...formData, hireYear: e.target.value})}
                        >
                            {Array.from({length: 10}, (_, i) => (parseInt(currentYear) - 5 + i).toString()).map(y => (
                                <option key={y} value={y}>{y}년</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2: Salary & Contract */}
            <div className="p-8 bg-slate-50/50">
                <div className="flex items-center space-x-2 mb-6 border-l-4 border-slate-800 pl-3 h-5">
                    <h3 className="text-sm font-bold text-slate-800">급여 및 계약 정보 (Security Level 2)</h3>
                </div>

                <div className="space-y-8">
                    {/* Employment Type Radio */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">고용 형태</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-colors ${isRegular ? 'border-orange-500' : 'border-gray-300 group-hover:border-orange-400'}`}>
                                    {isRegular && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                                </div>
                                <span className={`text-sm font-bold ${isRegular ? 'text-slate-800' : 'text-gray-500'}`}>정규직</span>
                                <input type="radio" className="hidden" checked={isRegular} onChange={() => {
                                    setFormData({...formData, type: '정규직'});
                                    setEmailLocal(prev => ({ ...prev, domain: DEFAULT_DOMAIN }));
                                }} />
                            </label>
                            <label className="flex items-center cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-colors ${!isRegular ? 'border-orange-500' : 'border-gray-300 group-hover:border-orange-400'}`}>
                                    {!isRegular && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                                </div>
                                <span className={`text-sm font-bold ${!isRegular ? 'text-slate-800' : 'text-gray-500'}`}>프리랜서</span>
                                <input type="radio" className="hidden" checked={!isRegular} onChange={() => {
                                    let contracts = formData.contracts || [];
                                    if(contracts.length === 0) {
                                        contracts = [{ id: Date.now(), seq: 1, startDate: `${currentYear}-01-01`, endDate: `${currentYear}-12-31`, monthlyAmount: 0 }];
                                    }
                                    setFormData({...formData, type: '프리랜서', contracts});
                                    setActiveContractIndex(0);
                                }} />
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        {isRegular ? (
                            // REGULAR EMPLOYEE UI
                            <div className="space-y-6 animate-fadeIn">
                                {/* Year Tabs */}
                                <div className="flex items-center space-x-1">
                                    {Object.keys(formData.salaries || {}).sort().map(year => (
                                        <button 
                                            key={year}
                                            onClick={() => setActiveSalaryYear(year)}
                                            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${activeSalaryYear === year ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500' : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                        >
                                            {year}년
                                        </button>
                                    ))}
                                    <button onClick={handleAddYear} className="px-3 py-1.5 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded flex items-center ml-2">
                                        <Plus size={12} className="mr-1"/> 연도 추가
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8 items-start">
                                    {/* Left: Input */}
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500">{activeSalaryYear}년 연봉 계약액</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">₩</span>
                                                <input 
                                                    type="text" 
                                                    className="w-full border border-gray-300 rounded-lg py-3 pl-8 pr-4 text-right font-mono text-lg font-bold text-slate-800 outline-none focus:border-orange-500 transition-all"
                                                    value={formatNumber(formData.salaries?.[activeSalaryYear] || 0)}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value.replace(/,/g, ''));
                                                        if(!isNaN(val)) setFormData({
                                                            ...formData, 
                                                            salaries: { ...formData.salaries, [activeSalaryYear]: val }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center text-orange-600 text-xs font-medium">
                                            <RotateCcw size={12} className="mr-1.5" />
                                            이 연봉은 {activeSalaryYear}년도 투입 프로젝트 원가에만 반영됩니다.
                                        </div>
                                    </div>

                                    {/* Right: Calc Card */}
                                    <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 flex flex-col justify-between h-full">
                                        <div className="text-xs font-bold text-slate-500 mb-4">월 인건비 원가 (자동계산)</div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-slate-800 tracking-tighter">
                                                {formatNumber(calculatedCost)}
                                            </span>
                                        </div>
                                        <div className="mt-4 text-[10px] text-slate-400 border-t border-slate-200 pt-3 leading-relaxed">
                                            (연봉÷12) + 4대보험(12%) + 퇴직금(8.3%) + 공통비 + 위험수당(5%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // FREELANCER UI
                            <div className="space-y-6 animate-fadeIn">
                                {/* Contract Tabs */}
                                <div className="flex items-center space-x-1 overflow-x-auto pb-2">
                                    {formData.contracts?.map((contract, index) => (
                                        <button 
                                            key={contract.id}
                                            onClick={() => setActiveContractIndex(index)}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border shrink-0 ${activeContractIndex === index ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {contract.seq}차 계약 <span className="font-normal text-[10px] ml-1 opacity-70">{contract.startDate}~</span>
                                        </button>
                                    ))}
                                    <button onClick={handleAddContract} className="px-3 py-1.5 text-xs text-purple-600 font-bold hover:bg-purple-50 rounded flex items-center ml-2 shrink-0">
                                        <Plus size={12} className="mr-1"/> 재계약(갱신)
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8 items-start">
                                    {/* Left: Input */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500">계약 시작일</label>
                                                <div className="relative">
                                                    <input 
                                                        type="date"
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-purple-500 font-mono"
                                                        value={formData.contracts?.[activeContractIndex]?.startDate || ""}
                                                        onChange={(e) => updateContract(activeContractIndex, 'startDate', e.target.value)}
                                                    />
                                                    <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500">계약 종료일</label>
                                                <div className="relative">
                                                    <input 
                                                        type="date"
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-purple-500 font-mono"
                                                        value={formData.contracts?.[activeContractIndex]?.endDate || ""}
                                                        onChange={(e) => updateContract(activeContractIndex, 'endDate', e.target.value)}
                                                    />
                                                    <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500">월 계약액 (Monthly Pay)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">₩</span>
                                                <input 
                                                    type="text" 
                                                    className="w-full border border-gray-300 rounded-lg py-3 pl-8 pr-4 text-right font-mono text-lg font-bold text-slate-800 outline-none focus:border-purple-500 transition-all"
                                                    value={formatNumber(formData.contracts?.[activeContractIndex]?.monthlyAmount || 0)}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value.replace(/,/g, ''));
                                                        if(!isNaN(val)) updateContract(activeContractIndex, 'monthlyAmount', val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center text-purple-600 text-xs font-medium">
                                            <RotateCcw size={12} className="mr-1.5" />
                                            해당 계약 기간 내 투입된 프로젝트에만 이 금액이 적용됩니다.
                                        </div>
                                    </div>

                                    {/* Right: Calc Card */}
                                    <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 flex flex-col justify-between h-full">
                                        <div className="text-xs font-bold text-slate-500 mb-4">월 인건비 원가 (자동계산)</div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-slate-800 tracking-tighter">
                                                {formatNumber(calculatedCost)}
                                            </span>
                                        </div>
                                        <div className="mt-4 text-[10px] text-slate-400 border-t border-slate-200 pt-3 leading-relaxed">
                                            월계약액 + 4대보험(5% 임의적용) + 공통비 + 위험수당(5%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- S006: Allocation Status ---
interface AllocationData {
    employeeId: string;
    name: string;
    dept: string;
    rank: string;
    techGrade: string; 
    type: string;
    assignments: {
        projectId: string;
        projectName: string;
        projectDept: string; // Used for coloring bars by executing department
        mm: number;
    }[];
}

interface ProjectViewData {
    projectId: string;
    projectName: string;
    client: string; 
    execDept: string; // Used for coloring rows
    assignedMembers: {
        name: string;
        rank: string;
        dept: string;
        mm: number;
    }[];
    totalMM: number;
}

const DEPARTMENTS = ["DX 사업본부", "플랫폼 개발팀", "디자인팀", "AI 연구소", "금융사업 2팀", "공공사업 1팀", "CSG"];

// Helper for colors: Returns background, text, border, ring classes for consistency
const getDeptColorInfo = (dept: string) => {
    switch(dept) {
        case '플랫폼 개발팀': return { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', ring: 'ring-orange-500', light: 'bg-orange-50' };
        case 'DX 사업본부': return { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', ring: 'ring-blue-500', light: 'bg-blue-50' };
        case '디자인팀': return { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200', ring: 'ring-pink-500', light: 'bg-pink-50' };
        case 'AI 연구소': return { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', ring: 'ring-indigo-500', light: 'bg-indigo-50' };
        case '금융사업 2팀': return { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', ring: 'ring-emerald-500', light: 'bg-emerald-50' };
        case '공공사업 1팀': return { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', ring: 'ring-cyan-500', light: 'bg-cyan-50' };
        default: return { bg: 'bg-slate-400', text: 'text-slate-500', border: 'border-slate-200', ring: 'ring-slate-400', light: 'bg-slate-50' };
    }
};

export const MockupAllocation = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(10); // Default October
    const [viewBy, setViewBy] = useState<'person' | 'project'>('person');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

    // Mock Allocation Logic: Assign projects randomly for demo
    const [allocationMap, setAllocationMap] = useState<AllocationData[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const empData = await StorageService.getEmployees();
            const projData = await StorageService.getProjects();
            setEmployees(empData || []);
            setProjects(projData || []);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (employees.length > 0 && projects.length > 0) {
            // Generate mock allocations based on existing data
            const allocations: AllocationData[] = employees.filter(e => !e.isArchived).map((emp, index) => {
                const assignments = [];
                let usedMM = 0;
                
                // Simulate some logic: Senior people are busy
                if (emp.rank === '수석' || emp.rank === '책임' || emp.rank === '선임') {
                    // Assign to 1-2 projects
                    const proj1 = projects[index % projects.length];
                    const mm1 = 0.5 + (Math.random() > 0.5 ? 0.5 : 0);
                    assignments.push({ 
                        projectId: proj1.code, 
                        projectName: proj1.name, 
                        projectDept: proj1.execDept || '플랫폼 개발팀', // Fallback to ensure color works
                        mm: mm1 
                    });
                    usedMM += mm1;

                    if (usedMM < 1.0 && Math.random() > 0.3) {
                        const proj2 = projects[(index + 1) % projects.length];
                        const mm2 = 1.0 - usedMM;
                        assignments.push({ 
                            projectId: proj2.code, 
                            projectName: proj2.name, 
                            projectDept: proj2.execDept || '플랫폼 개발팀',
                            mm: parseFloat(mm2.toFixed(1)) 
                        });
                        usedMM += mm2;
                    }
                } else {
                    // Juniors often 100% on one or idle
                    if (Math.random() > 0.2) {
                        const proj = projects[index % projects.length];
                        assignments.push({ 
                            projectId: proj.code, 
                            projectName: proj.name, 
                            projectDept: proj.execDept || '플랫폼 개발팀',
                            mm: 1.0 
                        });
                        usedMM = 1.0;
                    }
                }

                // Random overload for demo
                if (Math.random() > 0.9) {
                     const proj = projects[(index + 2) % projects.length];
                     assignments.push({ 
                         projectId: proj.code, 
                         projectName: proj.name, 
                         projectDept: proj.execDept || '플랫폼 개발팀',
                         mm: 0.2 
                     });
                     usedMM += 0.2;
                }

                return {
                    employeeId: emp.id,
                    name: emp.name,
                    dept: emp.dept,
                    rank: emp.rank,
                    techGrade: emp.techGrade || "초급",
                    type: emp.type || "정규직",
                    assignments
                };
            });
            setAllocationMap(allocations);
        }
    }, [employees, projects, selectedMonth]);

    // Available count logic: Exclude 'CSG' dept, but include all others (Regular/Freelance)
    const totalAvailableEmployees = useMemo(() => {
        return employees.filter(e => !e.isArchived && e.dept !== 'CSG').length;
    }, [employees]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // --- Person View Data ---
    const filteredAllocations = useMemo(() => {
        let list = allocationMap.filter(a => 
            (selectedDeptFilter === 'ALL' || a.dept === selectedDeptFilter) &&
            (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             a.dept.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortConfig) {
            list.sort((a, b) => {
                let valA: any = a[sortConfig.key as keyof typeof a];
                let valB: any = b[sortConfig.key as keyof typeof b];

                if (sortConfig.key === 'utilization') {
                    valA = a.assignments.reduce((sum, i) => sum + i.mm, 0);
                    valB = b.assignments.reduce((sum, i) => sum + i.mm, 0);
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }, [allocationMap, searchTerm, sortConfig, selectedDeptFilter]);

    // --- Project View Data Transformation ---
    const projectViewData = useMemo(() => {
        if (!projects.length || !allocationMap.length) return [];
        
        const projMap = new Map<string, ProjectViewData>();
        
        // Initialize from Projects DB
        projects.forEach(p => {
            projMap.set(p.code, {
                projectId: p.code,
                projectName: p.name,
                client: p.client,
                execDept: p.execDept,
                assignedMembers: [],
                totalMM: 0
            });
        });

        // Aggregate Allocations
        allocationMap.forEach(emp => {
            emp.assignments.forEach(assign => {
                const proj = projMap.get(assign.projectId);
                if (proj) {
                    proj.assignedMembers.push({
                        name: emp.name,
                        rank: emp.rank,
                        dept: emp.dept,
                        mm: assign.mm
                    });
                    proj.totalMM += assign.mm;
                }
            });
        });

        let list = Array.from(projMap.values()).filter(p => p.totalMM > 0); // Only active projects

        if (searchTerm) {
            list = list.filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (sortConfig) {
            list.sort((a, b) => {
                let valA: any = a[sortConfig.key as keyof typeof a];
                let valB: any = b[sortConfig.key as keyof typeof b];
                
                if (sortConfig.key === 'client') {
                    valA = a.client;
                    valB = b.client;
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return list;
    }, [projects, allocationMap, searchTerm, sortConfig]);

    const totalMM = filteredAllocations.reduce((acc, curr) => acc + curr.assignments.reduce((sum, a) => sum + a.mm, 0), 0);
    const idleEmployees = filteredAllocations.filter(a => a.assignments.reduce((sum, i) => sum + i.mm, 0) < 1.0).length;
    const overloadedEmployees = filteredAllocations.filter(a => a.assignments.reduce((sum, i) => sum + i.mm, 0) > 1.0).length;
    const avgUtilization = filteredAllocations.length > 0 ? ((totalMM / filteredAllocations.length) * 100).toFixed(1) : "0.0";

    const getUtilizationColor = (mm: number) => {
        if (mm > 1.0) return "bg-red-50 text-red-600 border-red-200 ring-2 ring-red-500/20";
        if (mm === 1.0) return "bg-green-50 text-green-600 border-green-200";
        if (mm >= 0.5) return "bg-yellow-50 text-yellow-600 border-yellow-200";
        return "bg-slate-50 text-slate-400 border-slate-200";
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig?.key !== column) return <ArrowUpDown size={12} className="ml-1 text-slate-300 opacity-50 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 text-orange-500" /> : <ArrowDown size={12} className="ml-1 text-orange-500" />;
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fadeIn font-sans">
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-20">
                <div className="flex items-center space-x-2"><BarChart3 className="text-orange-500" size={24} /><h2 className="text-xl font-bold text-slate-800 tracking-tight">인력 배정 현황 (Allocation)</h2></div>
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        {[9, 10, 11, 12].map(m => (
                            <button 
                                key={m} 
                                onClick={() => setSelectedMonth(m)}
                                className={`px-3 py-1 text-xs font-bold rounded transition-all ${selectedMonth === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {m}월
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 pb-2 shrink-0 grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-slate-500">총 가용 인원 (선택 범위 내)</div>
                    <div className="text-2xl font-black text-slate-800">{filteredAllocations.length}명</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-slate-500">총 투입 M/M (가동률)</div>
                    <div className="flex items-baseline space-x-2">
                        <div className="text-2xl font-black text-slate-800">{totalMM.toFixed(1)}</div>
                        <div className={`text-xs font-bold ${parseFloat(avgUtilization) >= 90 ? 'text-green-600' : 'text-orange-600'}`}>{avgUtilization}%</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-slate-500 flex items-center"><AlertTriangle size={12} className="mr-1 text-yellow-500"/> 유휴 인력 (Idle)</div>
                    <div className="text-2xl font-black text-yellow-600">{idleEmployees}명</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-slate-500 flex items-center"><AlertTriangle size={12} className="mr-1 text-red-500"/> 초과 투입 (Over)</div>
                    <div className="text-2xl font-black text-red-600">{overloadedEmployees}명</div>
                </div>
            </div>

            <div className="p-6 pt-2 flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 text-sm font-bold text-slate-700 bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setViewBy('person')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all ${viewBy === 'person' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}>
                            <Users size={14}/><span>인원별 보기</span>
                        </button>
                        <button onClick={() => setViewBy('project')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all ${viewBy === 'project' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                            <Briefcase size={14}/><span>프로젝트별 보기</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {viewBy === 'person' && (
                            <select 
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 shadow-sm text-slate-600 font-bold min-w-[140px]"
                                value={selectedDeptFilter}
                                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                            >
                                <option value="ALL">전체 부서</option>
                                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        )}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 w-64 shadow-sm" placeholder={viewBy === 'person' ? "이름, 부서 검색..." : "프로젝트명 검색..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-auto relative">
                    {viewBy === 'person' ? (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">성명 / 유형 <SortIcon column="name"/></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('dept')}>
                                        <div className="flex items-center">소속 부서 <SortIcon column="dept"/></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('techGrade')}>
                                        <div className="flex items-center">기술 등급 <SortIcon column="techGrade"/></div>
                                    </th>
                                    <th className="px-6 py-4 text-center w-32 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('utilization')}>
                                        <div className="flex items-center justify-center">가동률 (Total) <SortIcon column="utilization"/></div>
                                    </th>
                                    <th className="px-6 py-4 w-[45%]">프로젝트 배정 현황 (M/M)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-sans">
                                {filteredAllocations.map(alloc => {
                                    const totalUtilization = alloc.assignments.reduce((sum, a) => sum + a.mm, 0);
                                    const utilColor = getUtilizationColor(totalUtilization);
                                    const isOverloaded = totalUtilization > 1.0;
                                    const deptColors = getDeptColorInfo(alloc.dept);
                                    
                                    return (
                                        <tr key={alloc.employeeId} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 flex items-center">
                                                {/* Dept Identifier Marker */}
                                                <div className={`w-1.5 h-10 rounded-full mr-3 ${deptColors.bg}`} title={alloc.dept}></div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{alloc.name} <span className="text-xs text-slate-400 font-normal ml-1">{alloc.rank}</span></div>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold mt-1 inline-block ${alloc.type === '정규직' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {alloc.type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{alloc.dept}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <span className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">{alloc.techGrade}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="relative inline-block group/tooltip">
                                                    <span className={`px-2 py-1 rounded-md font-black text-xs border flex items-center justify-center space-x-1 ${utilColor}`}>
                                                        {isOverloaded && <AlertTriangle size={10} className="mr-1 animate-pulse"/>}
                                                        <span>{(totalUtilization * 100).toFixed(0)}%</span>
                                                    </span>
                                                    {isOverloaded && (
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                                            초과 투입 주의 ({(totalUtilization * 100).toFixed(0)}%)
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {alloc.assignments.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {alloc.assignments.map((assign, i) => {
                                                            const barColor = getDeptColorInfo(assign.projectDept).bg;
                                                            return (
                                                                <div key={i} className="flex items-center text-xs">
                                                                    <div className="w-24 font-bold text-slate-500 text-right mr-3 font-mono">
                                                                        {assign.mm.toFixed(1)} M/M
                                                                    </div>
                                                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden relative">
                                                                        <div 
                                                                            className={`h-full rounded-full ${barColor}`}
                                                                            style={{width: `${Math.min(assign.mm * 100, 100)}%`}}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="ml-3 font-medium text-slate-700 w-48 truncate flex items-center" title={assign.projectName}>
                                                                        {assign.projectName}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic">배정된 프로젝트 없음 (Idle)</div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredAllocations.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-20 text-gray-400">데이터가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('projectName')}>
                                        <div className="flex items-center">프로젝트명 <SortIcon column="projectName"/></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('client')}>
                                        <div className="flex items-center">고객사 <SortIcon column="client"/></div>
                                    </th>
                                    <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group w-40 whitespace-nowrap" onClick={() => handleSort('totalMM')}>
                                        <div className="flex items-center justify-center">총 투입 M/M <SortIcon column="totalMM"/></div>
                                    </th>
                                    <th className="px-6 py-4">투입 인원 (Members)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-sans">
                                {projectViewData.map((proj) => {
                                    const deptColors = getDeptColorInfo(proj.execDept);
                                    return (
                                    <tr key={proj.projectId} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 flex items-center">
                                            <div className={`w-1 h-8 rounded-full mr-3 ${deptColors.bg}`}></div>
                                            <div>
                                                <div className="font-bold text-slate-800">{proj.projectName}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{proj.projectId}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-xs font-bold whitespace-nowrap">{proj.client}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="font-black text-slate-800 text-base">{proj.totalMM.toFixed(1)}</span>
                                            <span className="text-xs text-slate-400 ml-1">M/M</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {proj.assignedMembers.map((mem, idx) => (
                                                    <div key={idx} className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                                                        <span className="font-bold text-xs text-slate-700 mr-1.5">{mem.name}</span>
                                                        <span className="text-[10px] text-slate-400 border-l border-gray-200 pl-1.5 mr-1.5">{mem.dept}</span>
                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 rounded">{mem.mm.toFixed(1)} M/M</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                                {projectViewData.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-20 text-gray-400">데이터가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
