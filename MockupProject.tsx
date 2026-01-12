
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Briefcase, Plus, Search, Users, Calendar, FileText, BarChart3, CheckCircle, Package, Archive, RotateCcw, AlertCircle, Send, X, MessageCircle } from 'lucide-react';
import { formatNumber } from './utils';
import { ProfitabilityView } from './ProfitabilityView';
import { StorageService } from './persistence';

interface Issue {
    id: number;
    user: string;
    content: string;
    date: string;
    type: 'issue' | 'reply';
}

export const MockupProject = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'profit'>('list');
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hoveredEstimate, setHoveredEstimate] = useState<number | null>(null);
  
  // Issue State
  const [expandedIssueId, setExpandedIssueId] = useState<number | null>(null);
  const [issueInput, setIssueInput] = useState("");
  
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState(["LG CNS", "A은행", "B공사", "자사", "SKT", "네이버클라우드"]);
  const [formData, setFormData] = useState({ name: "", client: "", salesDept: "DX 사업본부", salesRate: 10, execDept: "플랫폼 개발팀", execRate: 90, amt: "", execAmt: "", startDate: "", endDate: "" });

  useEffect(() => {
    const loadProjects = async () => {
      const data = await StorageService.getProjects();
      setProjects(data);
    };
    loadProjects();
  }, []);

  const handleSaveProject = async () => {
    const newProject = {
      id: Date.now(),
      code: `PJ-24-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.name || "새 프로젝트",
      client: formData.client,
      period: "2024.11 ~ 2025.04",
      amt: Number(formData.amt) || 0,
      execAmt: Number(formData.execAmt) || 0,
      status: "진행대기",
      salesDept: formData.salesDept,
      salesRate: formData.salesRate,
      execDept: formData.execDept,
      execRate: formData.execRate,
      profit: 0,
      profitRate: 0,
      isArchived: false,
      issues: [] // Initialize empty issues
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    await StorageService.setProjects(updated);
    
    setToastMessage("프로젝트가 성공적으로 등록되었습니다.");
    setShowToast(true);
    setTimeout(() => {
        setShowToast(false);
        setViewMode('list');
    }, 1500);
  };

  const handleArchive = async (project: any, archive: boolean) => {
    if (archive && !window.confirm(`'${project.name}' 프로젝트를 보관함으로 이동하시겠습니까?\n보관된 프로젝트는 '보관함' 탭에서 확인할 수 있습니다.`)) return;

    const updated = projects.map(p => p.id === project.id ? { ...p, isArchived: archive } : p);
    setProjects(updated);
    await StorageService.setProjects(updated);

    setToastMessage(archive ? "프로젝트가 보관함으로 이동되었습니다." : "프로젝트가 복원되었습니다.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const toggleIssuePanel = (projectId: number) => {
      if (expandedIssueId === projectId) {
          setExpandedIssueId(null);
      } else {
          setExpandedIssueId(projectId);
      }
      setIssueInput("");
  };

  const handleAddIssue = async (projectId: number) => {
      if (!issueInput.trim()) return;
      
      const newIssue: Issue = {
          id: Date.now(),
          user: "김철수", // Assuming current logged in user
          content: issueInput,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          type: 'reply'
      };

      const updatedProjects = projects.map(p => {
          if (p.id === projectId) {
              const currentIssues = p.issues || [];
              return { ...p, issues: [...currentIssues, newIssue] };
          }
          return p;
      });

      setProjects(updatedProjects);
      await StorageService.setProjects(updatedProjects);
      setIssueInput("");
  };

  const handleAmtChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'amt' | 'execAmt') => {
    const raw = e.target.value.replace(/,/g, "");
    if (!isNaN(Number(raw))) setFormData({...formData, [field]: raw});
  };

  const calculateRevenue = (amount: string | number, rate: number) => {
    const total = Number(amount);
    return !total ? 0 : Math.round(total * (rate / 100));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case '진행중': return 'bg-green-50 text-green-700 border-green-100';
        case '진행대기': return 'bg-orange-50 text-orange-600 border-orange-100';
        case '완료': return 'bg-slate-100 text-slate-600 border-slate-200';
        default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // 수행 부서별 식별 컬러 (Left Border & Text)
  const getDeptColor = (dept: string) => {
    switch(dept) {
        case '플랫폼 개발팀': return 'border-l-orange-500';
        case 'DX 사업본부': return 'border-l-blue-500';
        case '디자인팀': return 'border-l-pink-500';
        case 'AI 연구소': return 'border-l-indigo-500';
        case '금융사업 2팀': return 'border-l-emerald-500';
        case '공공사업 1팀': return 'border-l-cyan-500';
        default: return 'border-l-gray-300';
    }
  };

  const getDeptBadgeColor = (dept: string) => {
    switch(dept) {
        case '플랫폼 개발팀': return 'bg-orange-50 text-orange-700';
        case 'DX 사업본부': return 'bg-blue-50 text-blue-700';
        case '디자인팀': return 'bg-pink-50 text-pink-700';
        case 'AI 연구소': return 'bg-indigo-50 text-indigo-700';
        case '금융사업 2팀': return 'bg-emerald-50 text-emerald-700';
        case '공공사업 1팀': return 'bg-cyan-50 text-cyan-700';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Filter Logic
  const activeProjects = projects.filter((p: any) => !p.isArchived);
  const archivedProjects = projects.filter((p: any) => p.isArchived);

  const counts = { 
    ALL: activeProjects.length, 
    진행중: activeProjects.filter((p: any) => p.status === '진행중').length, 
    진행대기: activeProjects.filter((p: any) => p.status === '진행대기').length, 
    완료: activeProjects.filter((p: any) => p.status === '완료').length,
    보관함: archivedProjects.length
  };

  const filteredProjects = filterStatus === '보관함'
    ? archivedProjects
    : activeProjects.filter((p: any) => filterStatus === 'ALL' || p.status === filterStatus);

  const sortedProjects = [...filteredProjects].sort((a: any, b: any) => {
    if (sortBy === 'latest') return (b.code || "").localeCompare(a.code || "");
    if (sortBy === 'dept') return (a.execDept || "").localeCompare(b.execDept || ""); // 수행 주체 순
    if (sortBy === 'amount') return b.amt - a.amt;
    return 0;
  });

  if (viewMode === 'profit') return <ProfitabilityView onBack={() => setViewMode('list')} />;

  if (viewMode === 'create') {
    return (
      <div className="h-full flex flex-col bg-slate-50 relative">
        {showToast && (
          <div className="absolute top-4 right-4 z-[100] animate-bounceIn bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 border border-slate-700">
            <CheckCircle className="text-green-400" size={20} />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}
        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <div className="flex items-center space-x-2"><button onClick={() => setViewMode('list')} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronLeft size={20} /></button><h2 className="text-lg font-bold text-slate-800">신규 프로젝트 등록</h2></div>
          <div className="flex space-x-2"><button onClick={() => setViewMode('list')} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50">취소</button><button onClick={handleSaveProject} className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 flex items-center shadow-sm transition-all active:scale-95"><Save size={14} className="mr-2" /> 저장</button></div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1"><label className="text-sm font-bold text-gray-700">프로젝트 명 <span className="text-orange-500">*</span></label><input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="프로젝트명을 입력하세요" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                   <div className="space-y-1"><label className="text-sm font-bold text-gray-700">프로젝트 코드</label><input type="text" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-500" value="PJ-24-XXX (자동생성)" readOnly /></div>
                   <div className="space-y-1"><label className="text-sm font-bold text-gray-700">고객사</label><select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none" value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})}><option value="">선택하세요</option>{clients.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                   <div className="space-y-1"><label className="text-sm font-bold text-gray-700">계약 금액 (VAT별도)</label><div className="relative"><span className="absolute left-3 top-2.5 text-gray-500 font-bold">₩</span><input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 pl-8 text-sm text-right font-mono focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0" value={formatNumber(formData.amt)} onChange={(e) => handleAmtChange(e, 'amt')} /></div></div>
                   <div className="space-y-1"><div className="flex justify-between"><label className="text-sm font-bold text-gray-700">영업 주체 (Sales)</label><span className="text-xs text-orange-600 font-medium">매출인식: {formatNumber(calculateRevenue(formData.amt, formData.salesRate))}원</span></div><div className="flex space-x-2"><select className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm outline-none" value={formData.salesDept} onChange={(e) => setFormData({...formData, salesDept: e.target.value})}><option>DX 사업본부</option><option>금융사업 2팀</option><option>공공사업 1팀</option></select><div className="relative w-24"><input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 pr-6 text-sm text-right outline-none" value={formData.salesRate} onChange={(e) => setFormData({...formData, salesRate: Number(e.target.value)})} /><span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span></div></div></div>
                   <div className="space-y-1"><div className="flex justify-between"><label className="text-sm font-bold text-gray-700">수행 주체 (Execution)</label><span className="text-xs text-orange-600 font-medium">매출인식: {formatNumber(calculateRevenue(formData.amt, formData.execRate))}원</span></div><div className="flex space-x-2"><select className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm outline-none" value={formData.execDept} onChange={(e) => setFormData({...formData, execDept: e.target.value})}><option>플랫폼 개발팀</option><option>AI 연구소</option><option>디자인팀</option><option>금융사업 2팀</option><option>공공사업 1팀</option></select><div className="relative w-24"><input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 pr-6 text-sm text-right outline-none" value={formData.execRate} onChange={(e) => setFormData({...formData, execRate: Number(e.target.value)})} /><span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span></div></div></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
       {/* Toast Notification */}
       {showToast && (
          <div className="absolute top-4 right-4 z-[100] animate-bounceIn bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 border border-slate-700">
            <CheckCircle className="text-green-400" size={20} />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2">
            <Package size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-slate-800">프로젝트 등록 및 관리</h2>
        </div>
        <button onClick={() => setViewMode('create')} className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 flex items-center shadow-sm transition-all active:scale-95">
            <Plus size={14} className="mr-2" /> 신규 프로젝트 등록
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto flex-1">
         {/* Filter & Search Bar */}
         <div className="flex justify-between items-end mb-6">
            <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                {['ALL', '진행중', '진행대기', '완료', '보관함'].map(status => (
                    <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all flex items-center space-x-2 ${filterStatus === status ? 'bg-slate-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <span>{status === 'ALL' ? '전체' : status}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === status ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{counts[status as keyof typeof counts]}</span>
                    </button>
                ))}
            </div>
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none shadow-sm focus:border-orange-500 w-64" placeholder="프로젝트명 또는 코드로 검색..." />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none shadow-sm focus:border-orange-500">
                    <option value="latest">정렬: 최신 등록순</option>
                    <option value="dept">정렬: 수행 부서순</option>
                    <option value="amount">정렬: 계약 금액순</option>
                </select>
            </div>
         </div>

         {/* Project Cards Grid */}
         <div className="space-y-4">
            {sortedProjects.map((proj: any, idx: number) => {
              const hasIssues = proj.issues && proj.issues.length > 0;
              return (
              <div key={idx} className={`bg-white border border-gray-200 border-l-[6px] ${getDeptColor(proj.execDept)} rounded-xl transition-all relative group overflow-hidden ${expandedIssueId === proj.id ? 'shadow-lg ring-1 ring-orange-200' : 'hover:shadow-lg'}`}>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    {/* Left Section: Info & Depts */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 font-mono">
                            {proj.code}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-bold border ${getStatusColor(proj.status)}`}>
                            {proj.status}
                        </span>
                        </div>
                        
                        <h3 className="font-bold text-slate-900 text-xl mb-2 tracking-tight group-hover:text-orange-600 transition-colors">{proj.name}</h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-5">
                        <div className="flex items-center"><Users size={14} className="mr-1.5 opacity-70"/> {proj.client}</div>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div className="flex items-center"><Calendar size={14} className="mr-1.5 opacity-70"/> {proj.period}</div>
                        </div>

                        {/* Sales/Exec Dept Box */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-6 max-w-2xl relative">
                        {/* Sales */}
                        <div>
                            <div className="flex items-center text-xs font-bold text-gray-500 mb-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-400 mr-2 shadow-sm"></div>
                                영업 주체 ({proj.salesRate}%)
                            </div>
                            <div className="font-bold text-slate-700 text-sm mb-0.5">{proj.salesDept}</div>
                            <div className="text-xs text-gray-400 font-mono">₩ {formatNumber(calculateRevenue(proj.amt, proj.salesRate))}</div>
                        </div>
                        
                        {/* Exec */}
                        <div className="relative">
                            <div className="flex items-center text-xs font-bold text-gray-500 mb-1.5">
                                <div className="w-2 h-2 rounded-full bg-orange-400 mr-2 shadow-sm"></div>
                                수행 주체 ({proj.execRate}%)
                            </div>
                            <div className="flex items-center">
                                <div className="font-bold text-slate-700 text-sm mb-0.5 mr-2">{proj.execDept}</div>
                                {/* Department ID Badge */}
                                <span className={`text-[10px] px-1.5 rounded font-bold ${getDeptBadgeColor(proj.execDept)}`}>Main</span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">₩ {formatNumber(calculateRevenue(proj.amt, proj.execRate))}</div>
                        </div>
                        </div>
                    </div>

                    {/* Right Section: Amount & Actions */}
                    <div className="w-full md:w-auto flex flex-col items-end min-w-[260px]">
                        <div className="text-right mb-4">
                            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">₩ {formatNumber(proj.amt)}</div>
                            <div className="text-xs text-gray-400 font-medium mt-1">총 계약 금액 (VAT별도)</div>
                        </div>

                        {/* Profit Info Display for Completed OR In-Progress */}
                        {(proj.status === '완료' || proj.status === '진행중') && (
                            <div className={`rounded-lg p-3 w-full text-right mb-4 animate-fadeIn ${proj.status === '완료' ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
                                <div className={`text-[11px] font-bold mb-1 ${proj.status === '완료' ? 'text-green-700' : 'text-orange-700'}`}>
                                    {proj.status === '완료' ? '최종 영업 이익' : '예상 영업 이익'}
                                </div>
                                <div className={`text-lg font-black font-mono ${proj.status === '완료' ? 'text-green-600' : 'text-orange-600'}`}>
                                    ₩ {formatNumber(proj.profit || 0)}
                                </div>
                                <div className={`text-xs font-bold mt-1 ${proj.status === '완료' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {proj.status === '완료' ? '이익률' : '예상 이익률'} {proj.profitRate}% {proj.status === '완료' ? '달성' : ''}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-2 mt-auto relative">
                            {/* Issues Toggle Button */}
                            <button 
                                onClick={() => toggleIssuePanel(proj.id)}
                                className={`p-2.5 border rounded-lg transition-all shadow-sm flex items-center relative ${expandedIssueId === proj.id ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
                                title="이슈 및 히스토리 관리"
                            >
                                <AlertCircle size={18} />
                                {hasIssues && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                                        {proj.issues.length}
                                    </span>
                                )}
                            </button>

                            {proj.isArchived ? (
                                <button onClick={() => handleArchive(proj, false)} className="p-2.5 bg-white border border-gray-200 text-green-600 rounded-lg hover:bg-green-50 hover:border-green-200 transition-all shadow-sm" title="보관함에서 복원">
                                    <RotateCcw size={18} />
                                </button>
                            ) : (
                                proj.status === '완료' && (
                                    <button onClick={() => handleArchive(proj, true)} className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-lg hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm" title="보관함으로 이동">
                                        <Archive size={18} />
                                    </button>
                                )
                            )}
                            
                            {/* Estimate Modal on Hover (Document Button) */}
                            <div className="relative">
                                <button 
                                    className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-lg hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm peer"
                                    onMouseEnter={() => setHoveredEstimate(proj.id)}
                                    onMouseLeave={() => setHoveredEstimate(null)}
                                >
                                    <FileText size={18} />
                                </button>
                                {/* Hover Popover Modal */}
                                {hoveredEstimate === proj.id && (
                                    <div className="absolute bottom-full right-0 mb-3 w-72 bg-white border border-slate-200 shadow-2xl rounded-xl p-5 z-[50] animate-fadeIn origin-bottom-right">
                                        <h4 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                                            <span>견적서 요약 (Estimate)</span>
                                            <FileText size={12} />
                                        </h4>
                                        <div className="space-y-2.5 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 font-medium text-xs">총 계약 금액</span>
                                                <span className="font-black text-slate-800 font-mono">₩ {formatNumber(proj.amt)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 font-medium text-xs">예상 실행 원가</span>
                                                <span className="font-bold text-slate-600 font-mono">₩ {formatNumber(Math.round(proj.amt * (1 - (proj.profitRate / 100))))}</span>
                                            </div>
                                            <div className="w-full h-px bg-slate-100 my-2"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-800 font-bold text-xs">예상 영업 이익</span>
                                                <span className="font-black text-orange-600 font-mono">₩ {formatNumber(proj.profit)}</span>
                                            </div>
                                            <div className="text-right text-[10px] text-orange-400 font-bold">
                                                Margin {proj.profitRate}%
                                            </div>
                                        </div>
                                        {/* Triangle */}
                                        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setViewMode('profit')} 
                                className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 shadow-md flex items-center transition-all active:scale-95"
                            >
                                <BarChart3 size={16} className="mr-2"/> 수익률 관리
                            </button>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Expanded Issue Panel */}
                {expandedIssueId === proj.id && (
                    <div className="bg-slate-50 border-x border-b border-gray-200 rounded-b-xl -mt-2 p-5 animate-fadeIn shadow-inner border-t border-t-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-slate-700 flex items-center">
                                <MessageCircle size={16} className="mr-2 text-red-500"/> 이슈 및 히스토리 (Issues & History)
                            </h4>
                            <button onClick={() => setExpandedIssueId(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                            {(!proj.issues || proj.issues.length === 0) && (
                                <div className="text-center text-xs text-slate-400 py-6">
                                    등록된 이슈나 히스토리가 없습니다.
                                </div>
                            )}
                            {(proj.issues || []).map((issue: Issue) => (
                                <div key={issue.id} className="flex gap-3 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                                        {issue.user.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline space-x-2 mb-1">
                                            <span className="text-xs font-bold text-slate-700">{issue.user}</span>
                                            <span className="text-[10px] text-slate-400">{issue.date}</span>
                                        </div>
                                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-xs text-slate-600 shadow-sm leading-relaxed">
                                            {issue.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            <input 
                                className="flex-1 px-3 py-2 text-xs outline-none bg-transparent"
                                placeholder="이슈사항이나 코멘트를 입력하세요... (Enter to send)"
                                value={issueInput}
                                onChange={(e) => setIssueInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddIssue(proj.id);
                                    }
                                }}
                            />
                            <button 
                                onClick={() => handleAddIssue(proj.id)}
                                disabled={!issueInput.trim()}
                                className={`p-2 rounded-md transition-colors ${issueInput.trim() ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                )}
              </div>
            );
            })}
            {sortedProjects.length === 0 && <div className="text-center py-20 text-gray-400">
                {filterStatus === '보관함' ? '보관된 프로젝트가 없습니다.' : '등록된 프로젝트가 없습니다.'}
            </div>}
         </div>
      </div>
    </div>
  );
};
