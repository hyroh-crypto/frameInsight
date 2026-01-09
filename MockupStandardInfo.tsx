
import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Save, Plus, Trash2, ChevronRight, Users, Briefcase, AlertCircle, Calendar, Calculator, Info, Crown, Target, TrendingUp, X, FileEdit, CheckCircle, AlertTriangle, ArrowRight, Lock, Unlock, Shield, PieChart, Layers, Sliders, ArrowLeftRight } from 'lucide-react';
import { formatNumber } from './utils';
import { StorageService } from './persistence';

interface SalesSource {
  id: number;
  client: string;
  amount: number;
}

interface MonthlyItem {
  id: number;
  plan: string;
  amount: number;
}

interface CostStandard {
    id: number;
    type: string;
    insuranceRate: number;
    severanceRate: number;
    commonCostRate: number; // Changed from Fixed Amount to Rate (%)
    riskBuffer: number;
}

interface CompanySettings {
    targetMargin: number;
    totalAnnualRevenueTarget: number;
    totalCommonCost: number; // This remains as total budget, but per-person calc uses rate
    interDeptBillingRate: number; // New: Rate for borrowing internal resources
}

export const MockupStandardInfo = () => {
  const [activeTab, setActiveTab] = useState<'common' | 'monthly' | 'dept'>('common');
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [departments, setDepartments] = useState<string[]>(["DX 사업본부", "플랫폼 개발팀", "디자인팀", "AI 연구소", "금융사업 2팀", "공공사업 1팀"]);
  const [selectedDept, setSelectedDept] = useState<string | null>("플랫폼 개발팀");
  const [newDeptName, setNewDeptName] = useState("");
  const [showToast, setShowToast] = useState(false);

  // For Deletion & Reassignment Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
  const [targetDeptForMove, setTargetDeptForMove] = useState<string>("");

  // Lock State for Monthly Targets
  const [lockedMonths, setLockedMonths] = useState<number[]>([]);

  // Common Tab States
  const [costStandards, setCostStandards] = useState<CostStandard[]>([
      { id: 1, type: "정규직 (Regular)", insuranceRate: 12.0, severanceRate: 8.33, commonCostRate: 15.0, riskBuffer: 5.0 },
      { id: 2, type: "프리랜서 (Freelancer)", insuranceRate: 3.5, severanceRate: 0, commonCostRate: 5.0, riskBuffer: 5.0 }
  ]);
  
  // Company Assigned Targets (Dept -> Amount)
  const [companyAllocations, setCompanyAllocations] = useState<Record<string, number>>({
      "DX 사업본부": 5000000000,
      "플랫폼 개발팀": 4000000000,
      "디자인팀": 1500000000,
      "AI 연구소": 2000000000,
      "금융사업 2팀": 3500000000,
      "공공사업 1팀": 3000000000
  });

  const [deptHeads, setDeptHeads] = useState<Record<string, string>>({
    "플랫폼 개발팀": "EMP-2024-001",
    "DX 사업본부": "EMP-2020-045"
  });

  const [annualPlans, setAnnualPlans] = useState<Record<string, SalesSource[]>>({
    "플랫폼 개발팀": [
      { id: 1, client: "L전자 GRS 시스템 개편", amount: 1500000000 },
      { id: 2, client: "S물산 운영 유지보수", amount: 800000000 },
    ]
  });

  const [deptMonthlyItems, setDeptMonthlyItems] = useState<Record<string, Record<number, MonthlyItem[]>>>({
    "플랫폼 개발팀": {
        10: [
            { id: 1, plan: "L전자 GRS 시스템 2차 고도화 수주", amount: 200000000 },
            { id: 2, plan: "S물산 유지보수 고정 매출", amount: 120000000 }
        ]
    },
    "DX 사업본부": {
        10: [
            { id: 1, plan: "차세대 금융 플랫폼 컨설팅", amount: 450000000 }
        ]
    }
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    targetMargin: 20,
    totalAnnualRevenueTarget: 20000000000, // 200억
    totalCommonCost: 120000000,
    interDeptBillingRate: 10.0 // Default 10% markup
  });

  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const settings = await StorageService.getSettings();
      const emps = await StorageService.getEmployees();
      // Merge with default/mock if missing
      setCompanySettings(prev => ({...prev, ...settings}));
      setEmployees(emps);
    };
    loadInitialData();
  }, []);

  // --- Logic: Calculate Monthly Labor Cost per Person ---
  // Updated to use costStandards state and percentages
  const getCalculatedMonthlyCost = (person: any): number => {
    if (!person || !person.salaries) return 0;
    
    const year = new Date().getFullYear().toString();
    const annualSal = person.salaries[year] || Object.values(person.salaries)[0] || 0;
    const monthlySalary = annualSal / 12;
    
    // Find matching standard
    const std = costStandards.find(s => {
        if (person.type === '정규직') return s.type.includes('정규직');
        return s.type.includes('프리랜서');
    }) || costStandards[0];

    // Rates from state (divide by 100)
    const insurance = monthlySalary * (std.insuranceRate / 100);
    const severance = monthlySalary * (std.severanceRate / 100);
    const overhead = monthlySalary * (std.commonCostRate / 100); // Fixed -> Rate
    
    const baseCost = monthlySalary + insurance + severance + overhead;
    const totalCost = baseCost * (1 + (std.riskBuffer / 100));

    return Math.round(totalCost);
  };

  // --- Logic: Get Total Department Cost ---
  const getDeptTotalCost = (deptName: string): number => {
    const deptEmployees = employees.filter(e => e.dept === deptName);
    return deptEmployees.reduce((acc: number, emp: any) => acc + getCalculatedMonthlyCost(emp), 0);
  };

  const handleSave = async () => {
    await StorageService.setSettings(companySettings);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddDept = () => {
    if (newDeptName.trim() && !departments.includes(newDeptName.trim())) {
      setDepartments([...departments, newDeptName.trim()]);
      setNewDeptName("");
      setSelectedDept(newDeptName.trim());
    }
  };

  // --- Logic: Delete Department & Reassign ---
  const handleDeleteDeptRequest = (deptName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const deptEmployees = employees.filter(e => e.dept === deptName);
    
    if (deptEmployees.length > 0) {
        setDeptToDelete(deptName);
        const firstAvailable = departments.find(d => d !== deptName);
        if (firstAvailable) setTargetDeptForMove(firstAvailable);
        setIsDeleteModalOpen(true);
    } else {
        if (window.confirm(`'${deptName}' 부서를 삭제하시겠습니까?`)) {
            const updatedDepts = departments.filter(d => d !== deptName);
            setDepartments(updatedDepts);
            if (selectedDept === deptName) setSelectedDept(null);
        }
    }
  };

  const executeDeleteWithMove = async () => {
    if (!deptToDelete || !targetDeptForMove) return;

    const updatedEmployees = employees.map(emp => 
        emp.dept === deptToDelete ? { ...emp, dept: targetDeptForMove } : emp
    );
    setEmployees(updatedEmployees);
    await StorageService.setEmployees(updatedEmployees);

    const updatedDepts = departments.filter(d => d !== deptToDelete);
    setDepartments(updatedDepts);

    if (selectedDept === deptToDelete) setSelectedDept(targetDeptForMove);
    setIsDeleteModalOpen(false);
    setDeptToDelete(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const addSalesSource = (dept: string) => {
    const newId = Date.now();
    setAnnualPlans(prev => ({
      ...prev,
      [dept]: [...(prev[dept] || []), { id: newId, client: "", amount: 0 }]
    }));
  };

  const updateSalesSource = (dept: string, id: number, field: keyof SalesSource, value: any) => {
    setAnnualPlans(prev => ({
      ...prev,
      [dept]: (prev[dept] || []).map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const deleteSalesSource = (dept: string, id: number) => {
    setAnnualPlans(prev => ({
      ...prev,
      [dept]: (prev[dept] || []).filter(s => s.id !== id)
    }));
  };

  const addMonthlyItem = (dept: string, month: number) => {
    const newItem: MonthlyItem = { id: Date.now(), plan: "", amount: 0 };
    setDeptMonthlyItems(prev => ({
        ...prev,
        [dept]: {
            ...(prev[dept] || {}),
            [month]: [...(prev[dept]?.[month] || []), newItem]
        }
    }));
  };

  const updateMonthlyItem = (dept: string, month: number, itemId: number, field: keyof MonthlyItem, value: any) => {
      setDeptMonthlyItems(prev => ({
          ...prev,
          [dept]: {
              ...(prev[dept] || {}),
              [month]: (prev[dept]?.[month] || []).map(item => item.id === itemId ? { ...item, [field]: value } : item)
          }
      }));
  };

  const deleteMonthlyItem = (dept: string, month: number, itemId: number) => {
      setDeptMonthlyItems(prev => ({
          ...prev,
          [dept]: {
              ...(prev[dept] || {}),
              [month]: (prev[dept]?.[month] || []).filter(item => item.id !== itemId)
          }
      }));
  };

  const getDeptMonthlyTotal = (dept: string, month: number): number => {
      const items: MonthlyItem[] = deptMonthlyItems[dept]?.[month] || [];
      return items.reduce((sum: number, item: MonthlyItem) => sum + item.amount, 0);
  };

  const totalTargetRevenue: number = departments.reduce((acc: number, dept: string) => {
    return acc + getDeptMonthlyTotal(dept, selectedMonth);
  }, 0);

  const getAnnualGoal = (dept: string): number => {
    return (annualPlans[dept] || []).reduce((acc: number, s: SalesSource) => acc + s.amount, 0);
  };

  const getCumulativeSum = (dept: string): number => {
      const months = deptMonthlyItems[dept] || {};
      let total = 0;
      (Object.values(months) as MonthlyItem[][]).forEach((items: MonthlyItem[]) => {
          total += items.reduce((sum: number, item: MonthlyItem) => sum + item.amount, 0);
      });
      return total;
  };

  // Cost Standard Handlers
  const addCostStandard = () => {
      setCostStandards([...costStandards, { id: Date.now(), type: "New Type", insuranceRate: 0, severanceRate: 0, commonCostRate: 0, riskBuffer: 0 }]);
  };
  const updateCostStandard = (id: number, field: keyof CostStandard, value: any) => {
      setCostStandards(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const deleteCostStandard = (id: number) => {
      setCostStandards(prev => prev.filter(s => s.id !== id));
  };

  // Update Allocation
  const updateCompanyAllocation = (dept: string, amount: number) => {
      setCompanyAllocations(prev => ({...prev, [dept]: amount}));
  };

  const isMonthLocked = lockedMonths.includes(selectedMonth);
  const handleLockToggle = () => {
    if (isMonthLocked) {
        if (window.confirm(`[관리자 권한] ${selectedMonth}월 목표 확정을 해제하시겠습니까?\n해제 후에는 부서장이 다시 수정할 수 있습니다.`)) {
            setLockedMonths(prev => prev.filter(m => m !== selectedMonth));
        }
    } else {
        if (window.confirm(`${selectedMonth}월 목표를 확정하시겠습니까?\n확정 후에는 부서장이 내용을 수정할 수 없습니다.`)) {
            setLockedMonths(prev => [...prev, selectedMonth]);
        }
    }
  };

  const filteredEmployees = selectedDept ? employees.filter((e: any) => e.dept === selectedDept) : [];
  const selectedDeptTotalCost = selectedDept ? getDeptTotalCost(selectedDept) : 0;

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      {showToast && (
        <div className="absolute top-4 right-4 z-[100] animate-bounceIn bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 border border-slate-700">
          <CheckCircle className="text-green-400" size={20} />
          <span className="text-sm font-bold">변경 사항이 안전하게 저장되었습니다.</span>
        </div>
      )}

      {/* Modal for Reassignment */}
      {isDeleteModalOpen && (
          <div className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] border border-gray-200">
                  <div className="flex items-center space-x-3 text-red-600 mb-4">
                      <AlertTriangle size={28} />
                      <h3 className="text-lg font-bold">부서 삭제 및 인원 이동</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      <span className="font-bold text-slate-800">{deptToDelete}</span> 부서에 소속된 인원이 있습니다.<br/>
                      삭제하기 전에 해당 인원들을 이동시킬 부서를 선택해주세요.
                  </p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex items-center space-x-3">
                      <div className="flex-1">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">현재 소속 (이동 대상)</div>
                          <div className="text-sm font-bold text-slate-800 line-through decoration-red-500">{deptToDelete}</div>
                      </div>
                      <ArrowRight size={20} className="text-slate-400"/>
                      <div className="flex-1">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">이동할 부서</div>
                          <select 
                            className="w-full text-sm font-bold text-orange-600 bg-white border border-gray-300 rounded p-1.5 focus:border-orange-500 outline-none"
                            value={targetDeptForMove}
                            onChange={(e) => setTargetDeptForMove(e.target.value)}
                          >
                              {departments.filter(d => d !== deptToDelete).map(d => (
                                  <option key={d} value={d}>{d}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => { setIsDeleteModalOpen(false); setDeptToDelete(null); }}
                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                      >
                          취소
                      </button>
                      <button 
                        onClick={executeDeleteWithMove}
                        className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                      >
                          인원 이동 및 삭제 확인
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Settings size={20} className="text-orange-500" />
          <h2 className="text-lg font-bold text-slate-800">기준정보 설정</h2>
        </div>
        <div className="flex space-x-2">
           <button onClick={() => setActiveTab('common')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'common' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>공통 기준 (Common)</button>
           <button onClick={() => setActiveTab('monthly')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'monthly' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>월별 목표 배분</button>
           <button onClick={() => setActiveTab('dept')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'dept' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>부서 및 연간 계획</button>
           <div className="w-px bg-gray-300 mx-2 h-6 self-center"></div>
           <button onClick={handleSave} className="px-3 py-1.5 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800 flex items-center shadow-sm transition-all active:scale-95"><Save size={14} className="mr-2" /> 설정 저장</button>
        </div>
      </div>

      {activeTab === 'common' && (
          <div className="p-6 overflow-y-auto flex-1 animate-fadeIn space-y-6">
              {/* Section 1 & 2 in Grid */}
              <div className="grid grid-cols-12 gap-6">
                  {/* Left: Labor Cost Standards */}
                  <div className="col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <h3 className="text-sm font-bold text-slate-800 flex items-center">
                              <Sliders size={16} className="mr-2 text-orange-500" /> 인건비 산정 기준 (Labor Cost Standards)
                          </h3>
                          <button onClick={addCostStandard} className="text-xs bg-slate-800 text-white px-2 py-1 rounded flex items-center hover:bg-slate-700"><Plus size={12} className="mr-1"/> 항목 추가</button>
                      </div>
                      <div className="p-0">
                          <table className="w-full text-xs text-left">
                              <thead className="bg-white text-slate-500 font-bold border-b border-slate-100">
                                  <tr>
                                      <th className="px-4 py-3">구분 (Type)</th>
                                      <th className="px-4 py-3 text-right">4대보험 (%)</th>
                                      <th className="px-4 py-3 text-right">퇴직금 (%)</th>
                                      <th className="px-4 py-3 text-right bg-orange-50/50">공통비율 (Overhead %)</th>
                                      <th className="px-4 py-3 text-right">Buffer (%)</th>
                                      <th className="px-4 py-3 w-10"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {costStandards.map((std) => (
                                      <tr key={std.id} className="hover:bg-slate-50">
                                          <td className="px-4 py-2">
                                              <input className="w-full bg-transparent border-b border-transparent focus:border-orange-500 outline-none font-bold text-slate-700" value={std.type} onChange={(e) => updateCostStandard(std.id, 'type', e.target.value)} />
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                              <input type="number" className="w-16 text-right bg-transparent border border-gray-200 rounded px-1 py-1 focus:border-orange-500 outline-none" value={std.insuranceRate} onChange={(e) => updateCostStandard(std.id, 'insuranceRate', parseFloat(e.target.value) || 0)} />
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                              <input type="number" className="w-16 text-right bg-transparent border border-gray-200 rounded px-1 py-1 focus:border-orange-500 outline-none" value={std.severanceRate} onChange={(e) => updateCostStandard(std.id, 'severanceRate', parseFloat(e.target.value) || 0)} />
                                          </td>
                                          <td className="px-4 py-2 text-right bg-orange-50/20">
                                              <div className="flex items-center justify-end">
                                                <input type="number" className="w-16 text-right bg-white border border-orange-200 rounded px-1 py-1 focus:border-orange-500 outline-none font-bold text-orange-700" value={std.commonCostRate} onChange={(e) => updateCostStandard(std.id, 'commonCostRate', parseFloat(e.target.value) || 0)} />
                                              </div>
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                              <input type="number" className="w-16 text-right bg-transparent border border-gray-200 rounded px-1 py-1 focus:border-orange-500 outline-none" value={std.riskBuffer} onChange={(e) => updateCostStandard(std.id, 'riskBuffer', parseFloat(e.target.value) || 0)} />
                                          </td>
                                          <td className="px-4 py-2 text-center">
                                              <button onClick={() => deleteCostStandard(std.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          <div className="p-3 text-[10px] text-gray-400 border-t border-slate-100 flex items-center justify-end">
                              <Info size={12} className="mr-1"/> 공통비율: 인건비(급여) 대비 본사 운영비를 배분하는 비율 (예: 급여의 15%)
                          </div>
                      </div>
                  </div>

                  {/* Right: Company Wide Targets */}
                  <div className="col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-sm font-bold text-slate-800 flex items-center mb-1">
                              <Target size={16} className="mr-2 text-orange-500" /> 전사 목표 및 정책 설정 (Company Policies)
                          </h3>
                          <p className="text-xs text-slate-400">회계 연도 기준 매출, 이익률 및 부서간 정산 정책을 관리합니다.</p>
                      </div>
                      
                      <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <label className="text-xs font-bold text-slate-600">연간 매출 목표 (Revenue Target)</label>
                              <div className="flex items-center">
                                  <span className="text-xs text-slate-400 mr-2">₩</span>
                                  <input 
                                      className="text-right font-black text-slate-800 bg-transparent outline-none border-b border-slate-300 focus:border-orange-500 w-40" 
                                      value={formatNumber(companySettings.totalAnnualRevenueTarget)}
                                      onChange={(e) => {
                                          const val = Number(e.target.value.replace(/,/g, ''));
                                          if(!isNaN(val)) setCompanySettings({...companySettings, totalAnnualRevenueTarget: val});
                                      }}
                                  />
                              </div>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <label className="text-xs font-bold text-slate-600">목표 영업 이익률 (Target Margin)</label>
                              <div className="flex items-center">
                                  <input 
                                      className="text-right font-black text-orange-600 bg-transparent outline-none border-b border-slate-300 focus:border-orange-500 w-20" 
                                      value={companySettings.targetMargin}
                                      onChange={(e) => setCompanySettings({...companySettings, targetMargin: Number(e.target.value)})}
                                  />
                                  <span className="text-xs text-slate-400 ml-1">%</span>
                              </div>
                          </div>

                           {/* New Feature: Inter-Dept Markup Rate */}
                           <div className="flex flex-col p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                              <div className="flex justify-between items-center mb-2">
                                  <label className="text-xs font-bold text-blue-800 flex items-center">
                                      <ArrowLeftRight size={14} className="mr-1.5" /> 
                                      타 부서 인력 투입 가산율 (Markup)
                                  </label>
                                  <div className="flex items-center">
                                      <span className="text-xs font-bold text-blue-600 mr-1">+</span>
                                      <input 
                                          className="text-right font-black text-blue-600 bg-transparent outline-none border-b border-blue-300 focus:border-blue-500 w-16" 
                                          value={companySettings.interDeptBillingRate}
                                          onChange={(e) => setCompanySettings({...companySettings, interDeptBillingRate: Number(e.target.value)})}
                                      />
                                      <span className="text-xs text-blue-400 ml-1">%</span>
                                  </div>
                              </div>
                              <p className="text-[10px] text-blue-400 leading-relaxed">
                                  내부 인력을 타 부서 프로젝트에 투입 시, 원가에 해당 비율만큼 가산하여 정산합니다.<br/>
                                  (예: 원가 100만 + 10% Markup = 110만 청구)
                              </p>
                          </div>

                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <label className="text-xs font-bold text-slate-600">공통비 예산 (Budget Only)</label>
                              <div className="flex items-center">
                                  <span className="text-xs text-slate-400 mr-2">₩</span>
                                  <input 
                                      className="text-right font-black text-slate-400 bg-transparent outline-none border-b border-slate-300 focus:border-orange-500 w-40" 
                                      value={formatNumber(companySettings.totalCommonCost)}
                                      onChange={(e) => {
                                          const val = Number(e.target.value.replace(/,/g, ''));
                                          if(!isNaN(val)) setCompanySettings({...companySettings, totalCommonCost: val});
                                      }}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Section 3: Allocation Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center">
                          <PieChart size={16} className="mr-2 text-orange-500" /> 부서별 목표 할당 및 비교 (Target Allocation vs Dept Plan)
                      </h3>
                      <div className="flex items-center space-x-4 text-xs font-bold">
                          <span className="text-slate-500">할당 합계: <span className="text-slate-800">₩ {formatNumber(Object.values(companyAllocations).reduce((a: number, b: number) => a + b, 0))}</span></span>
                          <span className="text-slate-500">계획 합계: <span className="text-slate-800">₩ {formatNumber(departments.reduce((acc: number, d: string) => acc + getAnnualGoal(d), 0))}</span></span>
                      </div>
                  </div>
                  <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 font-bold border-b border-slate-100">
                          <tr>
                              <th className="px-6 py-4">부서명</th>
                              <th className="px-6 py-4 text-right bg-blue-50/30 text-blue-800">회사 할당 목표 (Assigned)</th>
                              <th className="px-6 py-4 text-right">부서 수립 계획 (Dept Plan)</th>
                              <th className="px-6 py-4 text-center">달성률 (vs Assigned)</th>
                              <th className="px-6 py-4 text-right">차이 (Variance)</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {departments.map(dept => {
                              const assigned = companyAllocations[dept] || 0;
                              const planned = getAnnualGoal(dept);
                              const diff = planned - assigned;
                              const percent = assigned > 0 ? (planned / assigned) * 100 : 0;

                              return (
                                  <tr key={dept} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 font-bold text-slate-700">{dept}</td>
                                      <td className="px-6 py-4 text-right bg-blue-50/20">
                                          <input 
                                              className="w-full text-right bg-transparent border border-transparent hover:border-blue-200 focus:border-blue-500 rounded px-2 py-1 outline-none font-mono font-bold text-blue-700" 
                                              value={formatNumber(assigned)}
                                              onChange={(e) => {
                                                  const val = Number(e.target.value.replace(/,/g, ''));
                                                  if(!isNaN(val)) updateCompanyAllocation(dept, val);
                                              }}
                                              placeholder="0"
                                          />
                                      </td>
                                      <td className="px-6 py-4 text-right font-mono text-slate-600">
                                          {formatNumber(planned)}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${percent >= 100 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                              {percent.toFixed(1)}%
                                          </span>
                                      </td>
                                      <td className={`px-6 py-4 text-right font-mono font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                          {diff > 0 ? '+' : ''}{formatNumber(diff)}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
      
      {activeTab === 'monthly' && (
        <>
            <div className="bg-white border-b border-gray-200 px-4 pt-4 overflow-x-auto no-scrollbar">
            <div className="flex space-x-1 min-w-max pb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border transition-all ${selectedMonth === month ? 'bg-orange-600 border-orange-600 text-white shadow-md transform scale-105 z-10' : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600'}`}
                >
                    <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Month</span>
                    <span className="text-lg font-extrabold">{month}월</span>
                    {lockedMonths.includes(month) && <Lock size={10} className={`mt-1 ${selectedMonth === month ? 'text-orange-200' : 'text-gray-400'}`} />}
                </button>
                ))}
            </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
            <div className="animate-fadeIn space-y-6">
                <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        <Calendar size={14} className="mr-1 text-orange-500" /> {selectedMonth}월 전사 매출 목표 (합계)
                    </span>
                    {isMonthLocked && <Lock size={14} className="text-slate-300" />}
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    ₩ {formatNumber(totalTargetRevenue)}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        <Calculator size={14} className="mr-1 text-orange-500" /> 전사 목표 이익률
                    </span>
                    </div>
                    <div className="flex items-end space-x-2">
                    <input 
                        type="text" 
                        className="text-2xl font-black text-slate-900 border-b-2 border-slate-200 focus:border-orange-500 outline-none w-20 bg-transparent"
                        value={companySettings.targetMargin}
                        onChange={(e) => setCompanySettings({...companySettings, targetMargin: Number(e.target.value)})}
                        disabled={isMonthLocked} 
                    />
                    <span className="text-2xl font-black text-slate-400">%</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
                    <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        <Briefcase size={14} className="mr-1 text-orange-500" /> 전사 총 공통비 (Budget)
                    </span>
                    <Info size={14} className="text-gray-300" />
                    </div>
                    <div className="flex items-end space-x-2">
                    <span className="text-2xl font-black text-slate-400">₩</span>
                    <input 
                        type="text" 
                        className="text-2xl font-black text-slate-900 border-b-2 border-slate-200 focus:border-orange-500 outline-none w-full bg-transparent font-mono"
                        value={formatNumber(companySettings.totalCommonCost)}
                        onChange={(e) => {
                        const val = Number(e.target.value.replace(/,/g, ''));
                        if(!isNaN(val)) setCompanySettings({...companySettings, totalCommonCost: val});
                        }}
                    />
                    </div>
                </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center">
                    <Target size={16} className="mr-2 text-orange-500" /> {selectedMonth}월 부서별 상세 실행 계획 및 목표
                    </h3>
                    <div className="flex items-center space-x-3">
                        {isMonthLocked ? (
                            <button 
                                onClick={handleLockToggle}
                                className="flex items-center text-xs font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded transition-colors"
                            >
                                <Lock size={12} className="mr-1.5"/> 확정됨 (관리자 해제 가능)
                            </button>
                        ) : (
                            <button 
                                onClick={handleLockToggle}
                                className="flex items-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors shadow-sm"
                            >
                                <CheckCircle size={12} className="mr-1.5"/> 목표 확정 (수정 제한)
                            </button>
                        )}
                        <span className="text-xs font-bold text-slate-500 border-l border-slate-300 pl-3 ml-2">단위: 원</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px]">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                        <th className="px-6 py-4 text-left font-bold w-48 align-top">부서명</th>
                        <th className="px-6 py-4 text-right font-bold w-40 align-top">연간 매출 목표</th>
                        <th className="px-6 py-4 text-left font-bold bg-orange-50/50 w-[450px] align-top">
                            상세 실행 계획 및 목표 (Detailed Plan)
                        </th>
                        <th className="px-6 py-4 text-right font-bold w-32 bg-orange-50/30 align-top">당월 합계<br/>(Monthly Total)</th>
                        <th className="px-6 py-4 text-right font-bold w-32 align-top">배분 누계<br/>(Progress)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {departments.map((dept) => {
                        const annualGoal = getAnnualGoal(dept);
                        const monthlyTotal = getDeptMonthlyTotal(dept, selectedMonth);
                        const cumulativeSum = getCumulativeSum(dept);
                        const progress = annualGoal > 0 ? (cumulativeSum / annualGoal) * 100 : 0;
                        const items = deptMonthlyItems[dept]?.[selectedMonth] || [];
                        
                        return (
                            <tr key={dept} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 align-top">
                                <div className="font-bold text-slate-800 mt-2">{dept}</div>
                                {deptHeads[dept] && (
                                <div className="text-[10px] text-orange-600 flex items-center mt-1">
                                    <Crown size={10} className="mr-1"/> {employees.find((e: any) => e.id === deptHeads[dept])?.name}
                                </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-500 align-top pt-6">{formatNumber(annualGoal)}</td>
                            <td className="px-6 py-4 bg-orange-50/10 align-top">
                                <div className="space-y-2">
                                    {items.map((item, idx) => (
                                        <div key={item.id} className="flex items-center space-x-2 animate-fadeIn">
                                            <div className="bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shrink-0">{idx + 1}</div>
                                            <input 
                                            className={`flex-1 text-xs border rounded px-2 py-1.5 outline-none transition-colors ${isMonthLocked ? 'bg-slate-100 text-slate-500 border-gray-200' : 'bg-white border-gray-200 focus:border-orange-500'}`}
                                            placeholder="실행 계획 입력..."
                                            value={item.plan}
                                            onChange={(e) => updateMonthlyItem(dept, selectedMonth, item.id, 'plan', e.target.value)}
                                            disabled={isMonthLocked}
                                            />
                                            <input 
                                            className={`w-28 text-right text-xs border rounded px-2 py-1.5 outline-none transition-colors font-mono font-bold ${isMonthLocked ? 'bg-slate-100 text-slate-500 border-gray-200' : 'bg-white border-gray-200 focus:border-orange-500'}`}
                                            placeholder="0"
                                            value={formatNumber(item.amount)}
                                            onChange={(e) => {
                                                const val = Number(e.target.value.replace(/,/g, ''));
                                                if(!isNaN(val)) updateMonthlyItem(dept, selectedMonth, item.id, 'amount', val);
                                            }}
                                            disabled={isMonthLocked}
                                            />
                                            {!isMonthLocked && (
                                                <button onClick={() => deleteMonthlyItem(dept, selectedMonth, item.id)} className="text-gray-300 hover:text-red-500 p-1">
                                                    <X size={14}/>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!isMonthLocked && (
                                        <button 
                                            onClick={() => addMonthlyItem(dept, selectedMonth)}
                                            className="flex items-center text-xs text-orange-600 font-bold hover:bg-orange-50 px-2 py-1 rounded transition-colors"
                                        >
                                            <Plus size={12} className="mr-1"/> 항목 추가
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-black text-slate-800 bg-orange-50/10 align-top pt-6">
                                {formatNumber(monthlyTotal)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-600 align-top pt-6">
                                <div className="text-xs mb-1">{formatNumber(cumulativeSum)}</div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                <div className="bg-orange-500 h-1.5 rounded-full" style={{width: `${Math.min(100, progress)}%`}}></div>
                                </div>
                                <div className="text-[10px] text-orange-600 font-bold mt-1 text-center">{progress.toFixed(1)}%</div>
                            </td>
                            </tr>
                        )
                        })}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            </div>
        </>
      )}

      {activeTab === 'dept' && (
          <div className="flex h-full gap-6 animate-fadeIn p-6 overflow-hidden">
            {/* Sidebar: Department List */}
            <div className="w-80 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
               <div className="p-4 border-b border-gray-200 bg-slate-50">
                 <h3 className="text-sm font-bold text-slate-700 mb-2">부서 관리</h3>
                 <div className="flex space-x-2">
                   <input type="text" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="신규 부서명" className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-orange-500" />
                   <button onClick={handleAddDept} className="bg-slate-800 text-white p-1.5 rounded hover:bg-slate-700"><Plus size={16} /></button>
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 {departments.map((dept, idx) => {
                   const cost = getDeptTotalCost(dept);
                   return (
                   <div key={idx} 
                      onClick={() => setSelectedDept(dept)} 
                      className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all cursor-pointer group border ${selectedDept === dept ? 'bg-orange-50 border-orange-200' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                   >
                     <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold mb-0.5 truncate ${selectedDept === dept ? 'text-orange-700' : 'text-gray-700'}`}>{dept}</div>
                        <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                ₩ {formatNumber(cost)}
                            </span>
                        </div>
                     </div>
                     <div className="flex items-center space-x-1">
                        <button 
                            onClick={(e) => handleDeleteDeptRequest(dept, e)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                        <ChevronRight size={14} className={selectedDept === dept ? 'text-orange-500' : 'text-gray-300'} />
                     </div>
                   </div>
                 )})}
               </div>
            </div>

            {/* Main: Department Details */}
            <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2">
              {selectedDept ? (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
                      <div>
                          <h3 className="text-base font-bold text-slate-800 flex items-center">
                              <Users size={18} className="mr-2 text-slate-500"/> {selectedDept} 인원 현황
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 ml-6">
                              월 인건비 합계: <span className="font-bold text-orange-600">₩ {formatNumber(selectedDeptTotalCost)}</span> (공통비 비율 {costStandards[0].commonCostRate}% 적용)
                          </p>
                      </div>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                          <tr>
                              <th className="px-6 py-2 text-left">성명</th>
                              <th className="px-6 py-2 text-center">직급</th>
                              <th className="px-6 py-2 text-right">월 원가 (Cost)</th>
                              <th className="px-6 py-2 text-right">부서장 권한</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredEmployees.map((emp: any) => (
                            <tr key={emp.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 font-medium text-slate-700">
                                  {emp.name} 
                                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${emp.type === '정규직' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{emp.type}</span>
                              </td>
                              <td className="px-6 py-3 text-center"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{emp.rank}</span></td>
                              <td className="px-6 py-3 text-right font-mono text-slate-600">₩ {formatNumber(getCalculatedMonthlyCost(emp))}</td>
                              <td className="px-6 py-3 text-right">
                                <button onClick={() => setDeptHeads(prev => ({...prev, [selectedDept]: emp.id}))} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${deptHeads[selectedDept] === emp.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                  <Crown size={12} className="mr-1.5"/> {deptHeads[selectedDept] === emp.id ? '지정됨' : '부서장 지정'}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredEmployees.length === 0 && (
                              <tr>
                                  <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                                      소속된 인원이 없습니다.
                                  </td>
                              </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
                      <h3 className="text-base font-bold text-slate-800 flex items-center"><TrendingUp size={18} className="mr-2 text-orange-500"/> 연간 매출 계획</h3>
                      <button onClick={() => addSalesSource(selectedDept)} className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold"><Plus size={14} /></button>
                    </div>
                    <div className="p-5">
                      <div className="space-y-3">
                        {(annualPlans[selectedDept] || []).map((source) => (
                          <div key={source.id} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <input className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm outline-none" placeholder="매출처 입력" value={source.client} onChange={(e) => updateSalesSource(selectedDept, source.id, 'client', e.target.value)} />
                             <div className="relative w-48">
                               <input className="w-full text-right bg-white border border-gray-200 rounded pr-3 py-2 text-sm font-mono outline-none" value={formatNumber(source.amount)} onChange={(e) => { const val = Number(e.target.value.replace(/,/g, '')); if(!isNaN(val)) updateSalesSource(selectedDept, source.id, 'amount', val); }} />
                             </div>
                             <button onClick={() => deleteSalesSource(selectedDept, source.id)} className="text-gray-300 hover:text-red-500"><X size={16}/></button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t text-right"><span className="text-xl font-black font-mono">₩ {formatNumber(getAnnualGoal(selectedDept))}</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400"><p className="font-bold">부서를 선택하세요.</p></div>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
};
