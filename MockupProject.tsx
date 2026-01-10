
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Save, Briefcase, Plus, Search, Users, Calendar, FileText, BarChart3, CheckCircle, Package, Archive, RotateCcw, Upload, X, FileSpreadsheet, Loader2, Info, Trash2, MoreHorizontal, FileUp } from 'lucide-react';
import { formatNumber } from './utils';
import { ProfitabilityView } from './ProfitabilityView';
import { StorageService } from './persistence';

export const MockupProject = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'profit'>('list');
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientInput, setNewClientInput] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({ 
    name: "", 
    client: "", 
    salesDept: "DX 사업본부", 
    salesRate: 10, 
    execDept: "플랫폼 개발팀", 
    execRate: 90, 
    amt: "", 
    execAmt: "", 
    startDate: "", 
    endDate: "" 
  });
  
  // File Upload State
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await StorageService.getProjects();
      setProjects(data);
      
      const defaultClients = ["LG CNS", "A은행", "B공사", "자사", "SKT", "네이버클라우드"];
      const existingClients = data.map((p: any) => p.client);
      const uniqueClients = Array.from(new Set([...defaultClients, ...existingClients])).filter(Boolean).sort();
      setClients(uniqueClients);
    };
    loadData();
  }, []);

  const handleSaveProject = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.client) {
      alert("필수 항목(프로젝트명, 고객사, 기간)을 모두 입력해주세요.");
      return;
    }

    const newProject = {
      id: Date.now(),
      code: `PJ-26-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.name,
      client: formData.client,
      period: `${formData.startDate.replace(/-/g, '.')} ~ ${formData.endDate.replace(/-/g, '.')}`,
      amt: Number(formData.amt) || 0,
      execAmt: Number(formData.amt) * 0.9,
      status: "진행대기",
      salesDept: formData.salesDept,
      salesRate: formData.salesRate,
      execDept: formData.execDept,
      execRate: formData.execRate,
      profit: (Number(formData.amt) || 0) * 0.15,
      profitRate: 15.0,
      isArchived: false,
      estimateFile: uploadedFile ? uploadedFile.name : null
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    await StorageService.setProjects(updated);
    
    // Add new client to list if it was new
    if (!clients.includes(formData.client)) {
        setClients(prev => [...prev, formData.client].sort());
    }

    setToastMessage("프로젝트가 성공적으로 등록되었습니다.");
    setShowToast(true);
    setTimeout(() => {
        setShowToast(false);
        setViewMode('list');
        resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setFormData({ name: "", client: "", salesDept: "DX 사업본부", salesRate: 10, execDept: "플랫폼 개발팀", execRate: 90, amt: "", execAmt: "", startDate: "", endDate: "" });
    setUploadedFile(null);
    setIsAddingNewClient(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsExtracting(true);
      // Simulate extraction logic
      setTimeout(() => {
        const mockAmount = Math.floor(Math.random() * 500 + 150) * 1000000;
        setFormData(prev => ({ ...prev, amt: mockAmount.toString() }));
        setIsExtracting(false);
        setToastMessage("견적서 분석 완료: 금액이 자동 입력되었습니다.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }, 1500);
    }
  };

  const handleArchive = async (project: any, archive: boolean) => {
    const updated = projects.map(p => p.id === project.id ? { ...p, isArchived: archive } : p);
    setProjects(updated);
    await StorageService.setProjects(updated);
    setToastMessage(archive ? "보관함으로 이동되었습니다." : "복원되었습니다.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
        case '진행중': return 'text-green-600 bg-green-50 border-green-100';
        case '진행대기': return 'text-orange-600 bg-orange-50 border-orange-100';
        case '완료': return 'text-slate-500 bg-slate-100 border-slate-200';
        default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const handleAddNewClient = () => {
      if (newClientInput.trim()) {
          const newClient = newClientInput.trim();
          setClients(prev => [...prev, newClient].sort());
          setFormData(prev => ({ ...prev, client: newClient }));
          setNewClientInput("");
          setIsAddingNewClient(false);
      }
  };

  const activeProjects = projects.filter((p: any) => !p.isArchived);
  const archivedProjects = projects.filter((p: any) => p.isArchived);

  const filteredProjects = filterStatus === '보관함'
    ? archivedProjects
    : activeProjects.filter((p: any) => filterStatus === 'ALL' || p.status === filterStatus);

  const sortedProjects = [...filteredProjects].sort((a: any, b: any) => {
    if (sortBy === 'latest') return (b.code || "").localeCompare(a.code || "");
    if (sortBy === 'amount') return b.amt - a.amt;
    return 0;
  });

  if (viewMode === 'profit') return <ProfitabilityView onBack={() => setViewMode('list')} />;

  if (viewMode === 'create') {
    return (
      <div className="h-full flex flex-col bg-slate-50 relative overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <button onClick={() => setViewMode('list')} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">신규 프로젝트 등록</h2>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setViewMode('list')} className="px-5 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">취소</button>
            <button onClick={handleSaveProject} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-black flex items-center shadow-xl hover:bg-slate-800 active:scale-95 transition-all">
                <Save size={16} className="mr-2" /> 저장
            </button>
          </div>
        </div>

        <div className="p-12 max-w-5xl mx-auto w-full space-y-8">
           <div className="bg-white rounded-[24px] p-10 shadow-sm border border-slate-100">
             <div className="flex items-center space-x-3 mb-8">
                 <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 shadow-inner">
                    <FileText size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800">프로젝트 정보 입력</h3>
                    <p className="text-xs text-slate-400 mt-0.5">기본 정보를 입력하고 견적서를 업로드하여 금액을 자동으로 불러오세요.</p>
                 </div>
             </div>

             <div className="space-y-8">
                {/* Project Name */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-tight">프로젝트명</label>
                    <input 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-base font-bold text-slate-800 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-300" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="프로젝트명을 입력하세요" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Client Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-tight">고객사</label>
                        {!isAddingNewClient ? (
                            <div className="flex space-x-2">
                                <select 
                                    className="flex-1 bg-white border border-slate-200 rounded-2xl py-4 px-5 text-base font-bold text-slate-800 outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer" 
                                    value={formData.client} 
                                    onChange={e => setFormData({...formData, client: e.target.value})}
                                >
                                    <option value="">선택하세요</option>
                                    {clients.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button 
                                    onClick={() => setIsAddingNewClient(true)}
                                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                                    title="신규 고객사 추가"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-2 animate-fadeIn">
                                <input 
                                    autoFocus
                                    className="flex-1 bg-white border border-orange-200 rounded-2xl py-4 px-5 text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-orange-50"
                                    placeholder="신규 고객사명 입력"
                                    value={newClientInput}
                                    onChange={(e) => setNewClientInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewClient()}
                                />
                                <button onClick={handleAddNewClient} className="px-5 bg-orange-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-100">확인</button>
                                <button onClick={() => setIsAddingNewClient(false)} className="px-5 bg-slate-100 text-slate-400 rounded-2xl text-sm font-bold">취소</button>
                            </div>
                        )}
                    </div>

                    {/* Amount with Auto-Extraction */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-tight flex justify-between">
                            <span>계약금액 (VAT별도)</span>
                            <span className="text-[10px] text-orange-500 flex items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <FileUp size={10} className="mr-1"/> 견적서 업로드로 자동 입력
                            </span>
                        </label>
                        <div className="relative group">
                            <input 
                                className={`w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-right font-mono text-lg font-black text-slate-900 outline-none focus:border-orange-500 transition-all ${isExtracting ? 'opacity-50' : ''}`} 
                                value={formatNumber(formData.amt)} 
                                onChange={e => setFormData({...formData, amt: e.target.value.replace(/\D/g,'')})} 
                                placeholder="0" 
                            />
                            {isExtracting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                                    <Loader2 className="animate-spin text-orange-600 mr-2" size={18} />
                                    <span className="text-xs font-bold text-orange-600 tracking-tight">데이터 추출 중...</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf, .xlsx, .xls" onChange={handleFileUpload} />
                        </div>
                        {uploadedFile && !isExtracting && (
                            <div className="flex items-center justify-end space-x-2 text-[10px] text-green-600 font-bold mt-1">
                                <CheckCircle size={10} />
                                <span>{uploadedFile.name} 분석 완료</span>
                            </div>
                        )}
                    </div>

                    {/* Project Period */}
                    <div className="col-span-2 space-y-2 pt-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-tight">프로젝트 기간</label>
                        <div className="flex items-center space-x-3">
                            <div className="flex-1 relative">
                                <input 
                                    type="date" 
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-base font-bold text-slate-800 outline-none focus:border-orange-500 transition-all" 
                                    value={formData.startDate} 
                                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                                />
                                <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                            <span className="text-slate-300 font-black text-lg">~</span>
                            <div className="flex-1 relative">
                                <input 
                                    type="date" 
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-base font-bold text-slate-800 outline-none focus:border-orange-500 transition-all" 
                                    value={formData.endDate} 
                                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                />
                                <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contribution Settings - Refined Gray Box */}
                <div className="pt-6 border-t border-slate-100">
                    <div className="bg-slate-50/60 rounded-[20px] p-8 border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-sm font-black text-slate-600 flex items-center">
                                <Users size={16} className="mr-2 text-slate-400" /> 영업/수행 주체 및 기여율 설정
                            </h4>
                            <span className="text-[10px] font-black text-orange-600 bg-white px-2 py-1 rounded-full border border-orange-100 shadow-sm">Total 100% Contribution</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[11px] font-black text-slate-400 uppercase">영업 주체 ({formData.salesRate}%)</label>
                                    <span className="text-xs font-mono font-bold text-slate-500">₩ {formatNumber((Number(formData.amt) || 0) * (formData.salesRate/100))}</span>
                                </div>
                                <select className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-orange-500 transition-all" value={formData.salesDept} onChange={e => setFormData({...formData, salesDept: e.target.value})}>
                                    <option>DX 사업본부</option><option>플랫폼 개발팀</option><option>금융사업 2팀</option>
                                </select>
                                <input type="range" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" value={formData.salesRate} onChange={(e) => {
                                     const val = parseInt(e.target.value);
                                     setFormData({...formData, salesRate: val, execRate: 100 - val});
                                 }} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[11px] font-black text-slate-400 uppercase">수행 주체 ({formData.execRate}%)</label>
                                    <span className="text-xs font-mono font-bold text-slate-500">₩ {formatNumber((Number(formData.amt) || 0) * (formData.execRate/100))}</span>
                                </div>
                                <select className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-orange-500 transition-all" value={formData.execDept} onChange={e => setFormData({...formData, execDept: e.target.value})}>
                                    <option>플랫폼 개발팀</option><option>디자인팀</option><option>AI 연구소</option>
                                </select>
                                <input type="range" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" value={formData.execRate} onChange={(e) => {
                                     const val = parseInt(e.target.value);
                                     setFormData({...formData, execRate: val, salesRate: 100 - val});
                                 }} />
                            </div>
                        </div>
                    </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {showToast && (
        <div className="absolute top-4 right-4 z-[100] animate-bounceIn bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3">
          <CheckCircle className="text-green-400" size={20} />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Area */}
      <div className="px-6 py-4 bg-white flex justify-between items-center border-b border-gray-100 shrink-0">
        <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600"><Briefcase size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">프로젝트 등록 및 관리</h2>
        </div>
        <button onClick={() => setViewMode('create')} className="bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all">
          <Plus size={18} className="mr-1.5" /> 신규 프로젝트 등록
        </button>
      </div>

      {/* Search & Tabs Area */}
      <div className="px-6 py-3 bg-white flex justify-between items-center border-b border-gray-100 shrink-0">
        <div className="flex space-x-2">
          {['전체', '진행중', '진행대기', '완료', '보관함'].map((status) => {
            const displayStatus = status === '전체' ? 'ALL' : status;
            const count = status === '전체' ? projects.length : 
                          status === '보관함' ? archivedProjects.length : 
                          activeProjects.filter((p: any) => p.status === status).length;
            const isActive = filterStatus === displayStatus;
            
            return (
              <button 
                key={status} 
                onClick={() => setFilterStatus(displayStatus)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center space-x-1.5 ${isActive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <span>{status}</span>
                <span className={`text-[10px] ${isActive ? 'text-orange-400' : 'text-slate-300'}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
             <input className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-72 focus:ring-1 focus:ring-orange-200 focus:bg-white transition-all" placeholder="프로젝트명 또는 코드로 검색..." />
          </div>
          <div className="h-8 w-px bg-slate-100 mx-1"></div>
          <select className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">정렬: 최신 등록순</option>
              <option value="amount">정렬: 금액 높은순</option>
          </select>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sortedProjects.map((project: any) => {
            const isCompleted = project.status === '완료';
            const accentColor = project.status === '진행중' ? 'bg-orange-500' : isCompleted ? 'bg-blue-400' : 'bg-orange-300';
            
            return (
                <div key={project.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col group">
                    {/* Left Color Accent */}
                    <div className={`absolute left-0 top-0 w-1.5 h-full ${accentColor}`}></div>
                    
                    <div className="p-6 pl-8 flex flex-col md:flex-row md:items-center">
                        {/* 1. Left Content: Title & Info */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className="text-[11px] font-bold text-slate-300 font-mono tracking-wider">{project.code}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black border tracking-tight ${getStatusBadge(project.status)}`}>{project.status}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-orange-600 transition-colors cursor-pointer">{project.name}</h3>
                            
                            <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 mb-6">
                                <div className="flex items-center"><Users size={14} className="mr-1.5 text-slate-300" /> {project.client}</div>
                                <div className="flex items-center"><Calendar size={14} className="mr-1.5 text-slate-300" /> {project.period}</div>
                            </div>

                            {/* Contribution Box - Optimized Size */}
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center max-w-[580px] space-x-10">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wide">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>영업 주체 ({project.salesRate}%)
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-700 truncate">{project.salesDept}</span>
                                        <span className="text-[10px] font-mono font-bold text-slate-400">₩ {formatNumber(project.amt * (project.salesRate/100))}</span>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-slate-200 shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wide">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></div>수행 주체 ({project.execRate}%)
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <span className="text-sm font-black text-slate-700 truncate">{project.execDept}</span>
                                            <span className="ml-1.5 text-[9px] bg-white border border-slate-100 text-orange-600 px-1.5 rounded font-black shrink-0">Main</span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-slate-400">₩ {formatNumber(project.amt * (project.execRate/100))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Right Content: Financials & Actions */}
                        <div className="md:w-72 mt-6 md:mt-0 flex flex-col items-end">
                            <div className="text-right mb-5">
                                <div className="text-2xl font-black text-slate-900 font-mono tracking-tighter">₩ {formatNumber(project.amt)}</div>
                                <div className="text-[11px] font-bold text-slate-300 mt-0.5">총 계약 금액 (VAT별도)</div>
                            </div>

                            {/* Profit Badge Highlight */}
                            <div className={`w-full p-4 rounded-xl text-right mb-6 ${isCompleted ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
                                <div className={`text-[11px] font-black mb-1 ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                                    {isCompleted ? '최종 영업 이익' : '예상 영업 이익'}
                                </div>
                                <div className={`text-lg font-black font-mono leading-none ${isCompleted ? 'text-green-700' : 'text-orange-700'}`}>
                                    ₩ {formatNumber(project.profit)}
                                </div>
                                <div className={`text-[10px] font-bold mt-1 ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                                    이익률 {project.profitRate}% {isCompleted ? '달성' : '예상'}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleArchive(project, true)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="보관"><Trash2 size={18}/></button>
                                <button className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="견적서"><FileText size={18}/></button>
                                <button onClick={() => setViewMode('profit')} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all flex items-center">
                                    <BarChart3 size={14} className="mr-2" /> 수익률 관리
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}

        {sortedProjects.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="bg-slate-100 p-6 rounded-full"><Package size={48} className="text-slate-300" /></div>
                <div className="text-center">
                    <p className="text-slate-800 font-bold">등록된 프로젝트가 없습니다.</p>
                    <p className="text-slate-400 text-xs mt-1">상단의 '+ 신규 프로젝트 등록' 버튼을 눌러 시작해 보세요.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
