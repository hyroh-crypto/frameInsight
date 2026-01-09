
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, FileText, Calendar, DollarSign, Users, Trash2, Archive, Paperclip, Send, Plus, X, Info, RotateCcw, UserCircle, Globe, Download, AlertTriangle, CheckCircle2, GripVertical } from 'lucide-react';
import { formatNumber } from './utils';
import { StorageService } from './persistence';
import { PersonSelector } from './PersonSelector';

interface Allocation {
    id: number;
    type: 'internal' | 'external';
    personId: string; // for internal
    externalName: string; // for outsourcing
    mm: number;
    cost: number;
}

interface Feedback {
    id: number;
    user: string;
    content: string;
    date: string;
    role: string;
}

interface Proposal {
    id: number;
    title: string;
    client: string;
    overview: string;
    budget: number;
    deadline: string;
    salesDept: string;
    execDept: string;
    rfpFiles: string[];
    allocations: Allocation[];
    feedbacks: Feedback[];
    isArchived: boolean;
}

export const MockupProposalReview = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([
        {
            id: 1,
            title: "현대자동차 차세대 SCM 컨설팅 제안",
            client: "현대자동차",
            overview: "현대자동차 SCM 체계 고도화 및 데이터 통합 플랫폼 구축 기술 제안. \n주요 범위: \n1. 공급망 데이터 표준화 \n2. 실시간 재고 대시보드 구축",
            budget: 450000000,
            deadline: "2024-11-15",
            salesDept: "DX 사업본부",
            execDept: "플랫폼 개발팀",
            rfpFiles: ["HMC_SCM_RFP_v1.0.pdf", "요구사항정의서_초안.xlsx"],
            allocations: [
                { id: 1, type: 'internal', personId: "EMP-2020-045", externalName: "", mm: 0.5, cost: 0 }, // Cost will be recalculated on load if needed or kept as snapshot
                { id: 2, type: 'external', personId: "", externalName: "(주)디자인에이전시", mm: 0, cost: 15000000 }
            ],
            feedbacks: [
                { id: 1, user: "김철수", role: "수석", content: "예산 대비 내부 투입 인력 M/M가 다소 높게 잡힌 것 같습니다. 0.3으로 조정 가능할까요?", date: "2024-10-25 10:30" },
                { id: 2, user: "박지민", role: "선임", content: "RFP 24페이지 기술 요건 확인 부탁드립니다. AI 모듈 제안이 필수인지 모호합니다.", date: "2024-10-25 11:15" }
            ],
            isArchived: false
        }
    ]);

    const [selectedId, setSelectedId] = useState<number>(1);
    const [filterArchived, setFilterArchived] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [draggedAllocIndex, setDraggedAllocIndex] = useState<number | null>(null);

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await StorageService.getEmployees();
            setEmployees(data || []);
        };
        loadEmployees();
    }, []);

    // Recalculate initial costs for internal staff if they are 0 (optional, ensures consistency)
    useEffect(() => {
        if (employees.length > 0 && proposals.length > 0) {
             const updatedProposals = proposals.map(p => {
                 const newAllocations = p.allocations.map(a => {
                     if (a.type === 'internal' && a.personId && a.cost === 0) {
                         const person = employees.find(e => e.id === a.personId);
                         if (person) {
                             return { ...a, cost: Math.round(calculateMonthlyCost(person) * a.mm) };
                         }
                     }
                     return a;
                 });
                 return { ...p, allocations: newAllocations };
             });
             // Only update if changes detected to avoid loop (simplified here by just not setting if identical in real app)
             // For mockup, we can skip auto-update loop or handle carefully. 
             // We'll trust user action triggers updates mainly.
        }
    }, [employees]);

    const selected = proposals.find(p => p.id === selectedId) || proposals[0];

    const calculateMonthlyCost = (person: any) => {
        if (!person) return 0;
        const currentYear = new Date().getFullYear().toString();
        const COMMON_COST = 850000;
        
        let monthlyBase = 0;
        if (person.type === '정규직') {
            const salaries = person.salaries || {};
            const years = Object.keys(salaries).sort();
            const annualSal = salaries[years[years.length - 1]] || 0;
            monthlyBase = annualSal / 12;
            const insurance = monthlyBase * 0.12;
            const severance = monthlyBase * 0.083333;
            return Math.round((monthlyBase + insurance + severance + COMMON_COST) * 1.05);
        } else {
            const contracts = person.contracts || [];
            const currentContract = contracts.length > 0 ? contracts[contracts.length - 1] : undefined;
            monthlyBase = currentContract ? currentContract.monthlyAmount : 0;
            const insurance = monthlyBase * 0.05;
            return Math.round((monthlyBase + insurance + COMMON_COST) * 1.05);
        }
    };

    const handleUpdateProposal = (id: number, field: keyof Proposal, value: any) => {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleAddAllocation = (id: number, type: 'internal' | 'external' = 'internal') => {
        const newAlloc: Allocation = { id: Date.now(), type, personId: "0", externalName: "", mm: 1.0, cost: 0 };
        handleUpdateProposal(id, 'allocations', [...selected.allocations, newAlloc]);
    };

    const updateAllocation = (id: number, allocId: number, field: keyof Allocation, value: any) => {
        const updatedAllocations = selected.allocations.map(a => {
            if (a.id !== allocId) return a;
            
            const updated = { ...a, [field]: value };
            
            // Recalculate cost if person or mm changes for internal staff
            if (updated.type === 'internal') {
                if (field === 'personId' || field === 'mm') {
                    const pid = field === 'personId' ? value : updated.personId;
                    const mm = field === 'mm' ? value : updated.mm;
                    
                    const person = employees.find(e => e.id === pid);
                    if (person) {
                        const monthlyCost = calculateMonthlyCost(person);
                        updated.cost = Math.round(monthlyCost * mm);
                    }
                }
            }
            return updated;
        });
        handleUpdateProposal(id, 'allocations', updatedAllocations);
    };

    const removeAllocation = (id: number, allocId: number) => {
        handleUpdateProposal(id, 'allocations', selected.allocations.filter(a => a.id !== allocId));
    };

    // --- Drag & Drop Handlers ---
    const onDragStartAlloc = (e: React.DragEvent, index: number) => {
        setDraggedAllocIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Optional: Hide default drag image or styling
    };

    const onDragOverAlloc = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedAllocIndex === null || draggedAllocIndex === index) return;
        
        const newAllocations = [...selected.allocations];
        const draggedItem = newAllocations[draggedAllocIndex];
        newAllocations.splice(draggedAllocIndex, 1);
        newAllocations.splice(index, 0, draggedItem);
        
        handleUpdateProposal(selected.id, 'allocations', newAllocations);
        setDraggedAllocIndex(index);
    };

    const handleArchive = (id: number, archive: boolean) => {
        if (archive && !window.confirm("제안을 보관함으로 이동하시겠습니까?")) return;
        setProposals(prev => prev.map(p => p.id === id ? { ...p, isArchived: archive } : p));
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const feedback: Feedback = { 
            id: Date.now(), 
            user: "나제안", 
            role: "책임",
            content: newComment, 
            date: new Date().toISOString().slice(0, 16).replace('T', ' ') 
        };
        handleUpdateProposal(selectedId, 'feedbacks', [...selected.feedbacks, feedback]);
        setNewComment("");
    };

    const totalAllocationCost = selected.allocations.reduce((acc, a) => acc + a.cost, 0);
    const activeProposals = proposals.filter(p => p.isArchived === filterArchived);

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fadeIn font-sans">
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3"><FileText size={20} className="text-orange-500" /><h2 className="text-lg font-bold text-slate-800 tracking-tight">제안 프로젝트 리뷰 및 피드백</h2></div>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setFilterArchived(false)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!filterArchived ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>진행중</button>
                        <button onClick={() => setFilterArchived(true)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filterArchived ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>보관함</button>
                    </div>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-orange-700 transition-colors shadow-sm active:scale-95"><Plus size={16} className="mr-2" /> 새 제안 등록</button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto p-4 space-y-3">
                    {activeProposals.map(p => (
                        <div key={p.id} onClick={() => setSelectedId(p.id)} className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedId === p.id ? 'border-orange-500 bg-orange-50/20 ring-1 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}`}>
                            <h3 className="font-bold text-slate-800 text-sm mb-1 truncate">{p.title}</h3>
                            <div className="text-xs text-slate-500 mb-2">{p.client}</div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-orange-600">₩ {formatNumber(p.budget)}</div>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
                    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
                        {/* LEFT COLUMN: PROPOSAL INFO */}
                        <div className="col-span-7 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <input className="text-2xl font-black text-slate-900 w-full outline-none focus:bg-slate-50 rounded px-1" value={selected.title} onChange={(e) => handleUpdateProposal(selected.id, 'title', e.target.value)} />
                                        <input className="text-sm font-bold text-slate-500 w-full outline-none focus:bg-slate-50 rounded px-1 mt-1" value={selected.client} onChange={(e) => handleUpdateProposal(selected.id, 'client', e.target.value)} />
                                    </div>
                                    <button onClick={() => handleArchive(selected.id, !selected.isArchived)} className="p-2 text-slate-300 hover:text-orange-500 transition-colors">{selected.isArchived ? <RotateCcw size={20}/> : <Trash2 size={20} />}</button>
                                </div>
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase">제안 예산</label><div className="relative font-mono font-bold text-sm"><input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-right outline-none focus:border-orange-500" value={formatNumber(selected.budget)} onChange={(e) => handleUpdateProposal(selected.id, 'budget', parseInt(e.target.value.replace(/,/g, '')) || 0)} /></div></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase">제안 마감일</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm font-bold outline-none" value={selected.deadline} onChange={(e) => handleUpdateProposal(selected.id, 'deadline', e.target.value)} /></div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">제안 개요</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm min-h-[120px] outline-none transition-all resize-none leading-relaxed" value={selected.overview} onChange={(e) => handleUpdateProposal(selected.id, 'overview', e.target.value)} />
                                </div>

                                {/* FILE ATTACHMENTS */}
                                <div className="space-y-2 mt-6 pt-6 border-t border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center">
                                        <Paperclip size={12} className="mr-1.5"/> RFP 및 참고 자료 (Attachments)
                                    </label>
                                    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 space-y-2">
                                        {selected.rfpFiles.map((file, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white border border-gray-200 p-2.5 rounded-lg text-xs shadow-sm hover:border-orange-200 transition-colors group">
                                                <span className="flex items-center text-slate-700 font-medium">
                                                    <FileText size={14} className="mr-2 text-orange-500 opacity-80"/>
                                                    {file}
                                                </span>
                                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded" title="다운로드"><Download size={14}/></button>
                                                    <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="삭제"><X size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center">
                                            <Plus size={14} className="mr-1.5"/> 파일 추가 (Drag & Drop)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: ALLOCATION & FEEDBACK */}
                        <div className="col-span-5 space-y-6">
                            {/* ALLOCATION CARD */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                <div className="px-6 py-4 bg-slate-800 text-white flex justify-between items-center">
                                    <h4 className="text-sm font-bold flex items-center"><Users size={16} className="mr-2 text-orange-400" /> 투입 비용 시뮬레이션</h4>
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleAddAllocation(selected.id, 'internal')} className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors">내부인력</button>
                                        <button onClick={() => handleAddAllocation(selected.id, 'external')} className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors">외주/경비</button>
                                    </div>
                                </div>
                                
                                <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
                                    {selected.allocations.map((alloc, idx) => (
                                        <div 
                                            key={alloc.id} 
                                            className={`p-3 rounded-xl border relative animate-fadeIn group ${alloc.type === 'internal' ? 'bg-slate-50 border-slate-100' : 'bg-orange-50/20 border-orange-100'}`}
                                            draggable
                                            onDragStart={(e) => onDragStartAlloc(e, idx)}
                                            onDragOver={(e) => onDragOverAlloc(e, idx)}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center">
                                                    <div className="cursor-move mr-2 text-slate-300 hover:text-slate-500">
                                                        <GripVertical size={14} />
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${alloc.type === 'internal' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>{alloc.type === 'internal' ? 'Internal Staff' : 'Outsourcing'}</span>
                                                </div>
                                                <button onClick={() => removeAllocation(selected.id, alloc.id)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                                            </div>
                                            
                                            <div className="flex items-end space-x-2">
                                                {alloc.type === 'internal' ? (
                                                    // Internal Layout: Person Selector | M/M | Cost
                                                    <>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase">투입 인원</div>
                                                            <PersonSelector personId={alloc.personId} onChange={(pid) => updateAllocation(selected.id, alloc.id, 'personId', pid)} disabled={false} employeeDB={employees} />
                                                        </div>
                                                        <div className="w-14 space-y-1">
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase text-center">M/M</div>
                                                            <input type="number" step="0.1" className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-center font-bold outline-none focus:border-orange-500" value={alloc.mm} onChange={(e) => updateAllocation(selected.id, alloc.id, 'mm', parseFloat(e.target.value) || 0)} />
                                                        </div>
                                                        <div className="w-24 space-y-1">
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase text-right">예상 비용</div>
                                                            <div className="text-xs font-bold text-slate-700 font-mono py-1.5 text-right tracking-tighter bg-white border border-transparent rounded px-1">₩ {formatNumber(alloc.cost)}</div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // External Layout: Vendor Name | Cost (No M/M)
                                                    <>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase">업체명 (Vendor)</div>
                                                            <input className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none focus:border-orange-500" placeholder="업체명 입력" value={alloc.externalName} onChange={(e) => updateAllocation(selected.id, alloc.id, 'externalName', e.target.value)} />
                                                        </div>
                                                        <div className="w-28 space-y-1">
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase text-right">배정 금액</div>
                                                            <input className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold text-right font-mono outline-none focus:border-orange-500" value={formatNumber(alloc.cost)} onChange={(e) => updateAllocation(selected.id, alloc.id, 'cost', parseInt(e.target.value.replace(/,/g, '')) || 0)} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Cost Notice */}
                                    <div className="mt-4 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100 flex items-start gap-2">
                                        <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0"/>
                                        <p className="text-[10px] text-orange-800 leading-relaxed font-medium">
                                            <strong>비용 처리 안내:</strong> 제안 작업에 투입되는 내부 인력의 인건비 및 외주비용은 <span className="underline decoration-orange-300 decoration-2">제안 주체 부서의 영업비용</span>으로 처리됩니다.
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-600 uppercase">총 제안 비용 합계</span>
                                        <span className="text-lg font-black text-slate-800 font-mono tracking-tighter">₩ {formatNumber(totalAllocationCost)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* THREADED FEEDBACK CARD */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 flex flex-col h-[400px]">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center justify-between">
                                    <span className="flex items-center"><MessageSquare size={16} className="mr-2 text-orange-500" /> 부서 피드백 (Thread)</span>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{selected.feedbacks.length}</span>
                                </h4>
                                
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                    {selected.feedbacks.length === 0 && (
                                        <div className="text-center text-xs text-slate-400 py-10">등록된 피드백이 없습니다.</div>
                                    )}
                                    {selected.feedbacks.map(fb => (
                                        <div key={fb.id} className="flex gap-3 group animate-fadeIn">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 select-none">
                                                {fb.user[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline space-x-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-800">{fb.user}</span>
                                                    <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 rounded">{fb.role}</span>
                                                    <span className="text-[10px] text-slate-300 ml-auto">{fb.date}</span>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none text-xs text-slate-700 border border-slate-100 leading-relaxed shadow-sm">
                                                    {fb.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-end space-x-2 bg-white pt-2 border-t border-slate-100">
                                    <textarea 
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-orange-500 focus:bg-white transition-colors resize-none h-10 min-h-[40px] focus:h-20 focus:shadow-sm" 
                                        placeholder="피드백이나 의견을 남겨주세요..." 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)} 
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={handleAddComment} 
                                        className={`p-2.5 rounded-xl transition-all ${newComment.trim() ? 'bg-slate-900 text-white hover:bg-orange-600 shadow-md transform hover:-translate-y-0.5' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                        disabled={!newComment.trim()}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
