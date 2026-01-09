
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, FileText, Calendar, DollarSign, Users, Trash2, Archive, Paperclip, Send, Plus, X, Info, RotateCcw, UserCircle, Globe } from 'lucide-react';
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
            overview: "현대자동차 SCM 체계 고도화 및 데이터 통합 플랫폼 구축 기술 제안",
            budget: 450000000,
            deadline: "2024-11-15",
            salesDept: "DX 사업본부",
            execDept: "플랫폼 개발팀",
            rfpFiles: ["RFP_SCM_2024.pdf"],
            allocations: [
                { id: 1, type: 'internal', personId: "EMP-2020-045", externalName: "", mm: 0.5, cost: 2750000 },
                { id: 2, type: 'external', personId: "", externalName: "디자인 외주(A사)", mm: 1.0, cost: 4500000 }
            ],
            feedbacks: [
                { id: 1, user: "김철수", content: "예산 대비 내부 투입 인력 조정이 필요해 보입니다.", date: "2024-10-25" }
            ],
            isArchived: false
        }
    ]);

    const [selectedId, setSelectedId] = useState<number>(1);
    const [filterArchived, setFilterArchived] = useState(false);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await StorageService.getEmployees();
            setEmployees(data || []);
        };
        loadEmployees();
    }, []);

    const selected = proposals.find(p => p.id === selectedId) || proposals[0];

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
            if (updated.type === 'internal') {
                const person = employees.find(e => e.id === updated.personId);
                if (person) {
                    const baseCost = person.type === '정규직' ? 5500000 : 8000000;
                    updated.cost = Math.round(baseCost * updated.mm);
                }
            }
            return updated;
        });
        handleUpdateProposal(id, 'allocations', updatedAllocations);
    };

    const removeAllocation = (id: number, allocId: number) => {
        handleUpdateProposal(id, 'allocations', selected.allocations.filter(a => a.id !== allocId));
    };

    const handleArchive = (id: number, archive: boolean) => {
        if (archive && !window.confirm("제안을 보관함으로 이동하시겠습니까?")) return;
        setProposals(prev => prev.map(p => p.id === id ? { ...p, isArchived: archive } : p));
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const feedback: Feedback = { id: Date.now(), user: "김철수", content: newComment, date: new Date().toISOString().split('T')[0] };
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
                    <div className="max-w-5xl mx-auto grid grid-cols-12 gap-8">
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
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase">제안 개요</label><textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm min-h-[120px] outline-none transition-all" value={selected.overview} onChange={(e) => handleUpdateProposal(selected.id, 'overview', e.target.value)} /></div>
                            </div>
                        </div>

                        <div className="col-span-5 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                <div className="px-6 py-4 bg-slate-800 text-white flex justify-between items-center">
                                    <h4 className="text-sm font-bold flex items-center"><Users size={16} className="mr-2 text-orange-400" /> 투입 인력 배정</h4>
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleAddAllocation(selected.id, 'internal')} className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded">내부추가</button>
                                        <button onClick={() => handleAddAllocation(selected.id, 'external')} className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded">외주추가</button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                                    {selected.allocations.map(alloc => (
                                        <div key={alloc.id} className={`p-4 rounded-xl border relative animate-fadeIn ${alloc.type === 'internal' ? 'bg-slate-50 border-slate-100' : 'bg-green-50/30 border-green-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${alloc.type === 'internal' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{alloc.type === 'internal' ? 'Staff' : 'External'}</span>
                                                <button onClick={() => removeAllocation(selected.id, alloc.id)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <div className="flex-1 space-y-1">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase">{alloc.type === 'internal' ? '투입 인원' : '업체명'}</div>
                                                    {alloc.type === 'internal' ? (
                                                        <div className="flex space-x-2">
                                                            <div className="flex-1"><PersonSelector personId={alloc.personId} onChange={(pid) => updateAllocation(selected.id, alloc.id, 'personId', pid)} disabled={false} employeeDB={employees} /></div>
                                                        </div>
                                                    ) : (
                                                        <input className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none" placeholder="업체명" value={alloc.externalName} onChange={(e) => updateAllocation(selected.id, alloc.id, 'externalName', e.target.value)} />
                                                    )}
                                                </div>
                                                <div className="w-14 space-y-1">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase text-center">M/M</div>
                                                    <input type="number" step="0.1" className="w-full border rounded px-1 py-1 text-xs text-center font-bold" value={alloc.mm} onChange={(e) => updateAllocation(selected.id, alloc.id, 'mm', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase text-right">배정 금액</div>
                                                    {alloc.type === 'internal' ? (
                                                        <div className="text-xs font-bold text-slate-700 font-mono py-1 text-right tracking-tighter">₩ {formatNumber(alloc.cost)}</div>
                                                    ) : (
                                                        <input className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold text-right font-mono outline-none" value={formatNumber(alloc.cost)} onChange={(e) => updateAllocation(selected.id, alloc.id, 'cost', parseInt(e.target.value.replace(/,/g, '')) || 0)} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center"><span className="text-[10px] font-black text-slate-600 uppercase">총 배정 합계</span><span className="text-lg font-black text-orange-600 font-mono tracking-tighter">₩ {formatNumber(totalAllocationCost)}</span></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6"><h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center"><MessageSquare size={16} className="mr-2 text-orange-500" /> 부서 피드백</h4><div className="flex space-x-2"><input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-500" placeholder="의견 입력..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} /><button onClick={handleAddComment} className="bg-slate-900 text-white p-2 rounded-lg"><Send size={16} /></button></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
