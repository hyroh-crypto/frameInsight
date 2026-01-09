
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Save, Plus, Trash2, FileText, MessageSquare, Send, Calendar, User, Info, MoreHorizontal, Settings, Download, X, History, Users } from 'lucide-react';
import { formatNumber } from './utils';

interface CostItem {
    id: number;
    name: string;
    amount: number;
}

interface EstimateRow {
    id: number;
    role: string;
    grade: string;
    mm: number;
    unitPrice: number;
}

interface ResourceRow {
    id: number;
    role: string;
    dept: string;
    name: string;
    grade: string;
    type: '정규직' | '프리랜서' | '외주';
    monthlyCost: number;
    startDate: string;
    endDate: string;
    mm: number;
    memo: string;
}

export const ProfitabilityView = ({ onBack }: { onBack: () => void }) => {
    // Project Basic Info
    const contractAmount = 732000000;
    const executionRate = 90; // 90%
    const executionAmount = contractAmount * (executionRate / 100);

    // 1. Cost Management (Outsourcing & Expenses)
    const [outsourcingCosts, setOutsourcingCosts] = useState<CostItem[]>([
        { id: 1, name: "디자인 외주 용역", amount: 22000000 },
        { id: 2, name: "퍼블리싱 외주", amount: 12000000 }
    ]);
    const [expenses, setExpenses] = useState<CostItem[]>([
        { id: 1, name: "S/W 라이선스 (Jira/Confluence)", amount: 3500000 },
        { id: 2, name: "서버 임대료 (AWS)", amount: 1500000 }
    ]);

    // 2. Execution Plan (Estimate Basis)
    const [estimateRows, setEstimateRows] = useState<EstimateRow[]>([
        { id: 1, role: "Project Manager", grade: "특급", mm: 6, unitPrice: 11075000 },
        { id: 2, role: "UX Leading", grade: "고급", mm: 6, unitPrice: 9926000 },
        { id: 3, role: "UX 설계", grade: "고급", mm: 5, unitPrice: 9926000 },
        { id: 4, role: "Design/PL", grade: "고급", mm: 6, unitPrice: 9926000 },
        { id: 5, role: "Design", grade: "중급", mm: 4, unitPrice: 8545000 },
        { id: 6, role: "Programming", grade: "고급", mm: 6, unitPrice: 10886000 },
    ]);

    // 3. Real Execution (Resource Planning)
    const [resourceRows, setResourceRows] = useState<ResourceRow[]>([
        { id: 1, role: "Project Manager", dept: "DX 사업본부", name: "김철수", grade: "특급", type: "정규직", monthlyCost: 5500000, startDate: "2024-01-01", endDate: "2024-06-30", mm: 6, memo: "" },
        { id: 2, role: "UX Leading", dept: "DX 사업본부", name: "박지민", grade: "고급", type: "정규직", monthlyCost: 4500000, startDate: "2024-01-01", endDate: "2024-06-30", mm: 6, memo: "" },
        { id: 3, role: "UX 설계", dept: "플랫폼 개발", name: "홍길동", grade: "고급", type: "정규직", monthlyCost: 8000000, startDate: "2024-01-15", endDate: "2024-06-30", mm: 5.5, memo: "" },
        { id: 4, role: "Design/PL", dept: "디자인팀", name: "전지현", grade: "고급", type: "정규직", monthlyCost: 4500000, startDate: "2024-01-01", endDate: "2024-06-30", mm: 6, memo: "" },
        { id: 5, role: "Design", dept: "외주", name: "", grade: "중급", type: "정규직", monthlyCost: 0, startDate: "", endDate: "", mm: 0, memo: "" },
        { id: 6, role: "Programming", dept: "DX 사업본부", name: "김철수", grade: "고급", type: "정규직", monthlyCost: 5500000, startDate: "2024-01-01", endDate: "2024-06-30", mm: 6, memo: "" },
    ]);

    const [memo, setMemo] = useState("");

    // Calculations (Memoized for performance)
    const totalOutsourcing = useMemo(() => outsourcingCosts.reduce((acc, item) => acc + item.amount, 0), [outsourcingCosts]);
    const totalExpenses = useMemo(() => expenses.reduce((acc, item) => acc + item.amount, 0), [expenses]);
    const totalCostManagement = useMemo(() => totalOutsourcing + totalExpenses, [totalOutsourcing, totalExpenses]);

    const totalEstimateRevenue = useMemo(() => estimateRows.reduce((acc, row) => acc + (row.mm * row.unitPrice), 0), [estimateRows]);
    const totalEstimateMM = useMemo(() => estimateRows.reduce((acc, row) => acc + row.mm, 0), [estimateRows]);

    const totalActualLaborCost = useMemo(() => resourceRows.reduce((acc, row) => acc + (row.monthlyCost * row.mm), 0), [resourceRows]);
    const totalActualMM = useMemo(() => resourceRows.reduce((acc, row) => acc + row.mm, 0), [resourceRows]);

    const totalProjectCost = useMemo(() => totalActualLaborCost + totalCostManagement, [totalActualLaborCost, totalCostManagement]);
    const projectedProfit = useMemo(() => executionAmount - totalProjectCost, [executionAmount, totalProjectCost]);
    const profitMargin = useMemo(() => executionAmount > 0 ? (projectedProfit / executionAmount) * 100 : 0, [executionAmount, projectedProfit]);
    const targetMargin = 20.0;

    // Handlers
    const addOutsourcing = () => setOutsourcingCosts([...outsourcingCosts, { id: Date.now(), name: "", amount: 0 }]);
    const updateOutsourcing = (id: number, field: keyof CostItem, value: any) => setOutsourcingCosts(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeOutsourcing = (id: number) => setOutsourcingCosts(prev => prev.filter(item => item.id !== id));

    const addExpense = () => setExpenses([...expenses, { id: Date.now(), name: "", amount: 0 }]);
    const updateExpense = (id: number, field: keyof CostItem, value: any) => setExpenses(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeExpense = (id: number) => setExpenses(prev => prev.filter(item => item.id !== id));

    const addEstimateRow = () => setEstimateRows([...estimateRows, { id: Date.now(), role: "New Role", grade: "중급", mm: 0, unitPrice: 0 }]);
    const updateEstimateRow = (id: number, field: keyof EstimateRow, value: any) => setEstimateRows(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeEstimateRow = (id: number) => setEstimateRows(prev => prev.filter(item => item.id !== id));

    const addResourceRow = () => setResourceRows([...resourceRows, { id: Date.now(), role: "New Role", dept: "부서선택", name: "", grade: "중급", type: "정규직", monthlyCost: 0, startDate: "", endDate: "", mm: 0, memo: "" }]);
    const updateResourceRow = (id: number, field: keyof ResourceRow, value: any) => setResourceRows(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeResourceRow = (id: number) => setResourceRows(prev => prev.filter(item => item.id !== id));


    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fadeIn font-sans overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-20">
                <div className="flex items-center space-x-3">
                    <button onClick={onBack} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronLeft size={20} /></button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">프로젝트 수익률 관리</h2>
                        <div className="text-xs text-slate-500 font-medium">LG 베스트샵 개편 <span className="mx-1">|</span> PJ-26-001</div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-xs font-bold text-slate-500">수행 금액 기준: <span className="text-blue-600">₩ {formatNumber(executionAmount)}</span></div>
                    <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center"><FileText size={14} className="mr-1.5"/> 견적서 보기</button>
                    <button onClick={() => alert('저장되었습니다.')} className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-slate-800 shadow-sm"><Save size={14} className="mr-1.5" /> 시뮬레이션 저장</button>
                </div>
            </div>

            <div className="p-6 max-w-[1400px] mx-auto w-full space-y-6">
                
                {/* 1. Top Cards (Summary) */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="text-[11px] font-bold text-slate-500 mb-1">계약 금액 (VAT별도)</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mb-2">₩ {formatNumber(contractAmount)}</div>
                        <div className="text-[11px] text-slate-400 font-bold">수행금액: ₩ {formatNumber(executionAmount)}</div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="text-[11px] font-bold text-slate-500 mb-1">예상 투입 공수 (견적)</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mb-2">{totalEstimateMM.toFixed(1)} M/M</div>
                        <div className="text-[11px] text-slate-400 font-bold">예상 매출: ₩ {formatNumber(totalEstimateRevenue)}</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-1">
                             <div className="text-[11px] font-bold text-slate-500 flex items-center"><User size={12} className="mr-1 text-orange-500"/> 현재 본사 투입(실적) + 외주</div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-slate-700">본사: {totalActualMM.toFixed(1)} M/M</div>
                                <div className="text-xs font-bold text-slate-700">외주/경비:</div>
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="text-xs font-bold text-slate-400 font-mono">({formatNumber(totalActualLaborCost)})</div>
                                <div className="text-sm font-black text-slate-900 font-mono">₩ {formatNumber(totalCostManagement)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden">
                         <div className="text-[11px] font-bold text-orange-800 mb-1">예상 영업 이익 (수행금액 기준)</div>
                         <div className="text-2xl font-black text-orange-600 tracking-tight mb-2">₩ {formatNumber(projectedProfit)}</div>
                         <div className="flex items-center space-x-2">
                            <span className={`text-xs font-black px-1.5 py-0.5 rounded ${profitMargin >= targetMargin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {profitMargin.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-orange-600/70 font-bold">목표: {targetMargin}%</span>
                         </div>
                    </div>
                </div>

                {/* 2. Cost Management Section */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center space-x-2">
                             <div className="bg-orange-100 p-1 rounded"><Settings size={14} className="text-orange-600"/></div>
                             <h3 className="text-sm font-bold text-slate-800">비용 집행 계획 (Cost Management)</h3>
                        </div>
                        <div className="flex items-center space-x-3 text-xs font-mono">
                             <span className="text-slate-500">외주 합계: <b className="text-slate-800">₩ {formatNumber(totalOutsourcing)}</b></span>
                             <span className="text-slate-300">|</span>
                             <span className="text-slate-500">경비 합계: <b className="text-slate-800">₩ {formatNumber(totalExpenses)}</b></span>
                             <span className="text-slate-300">|</span>
                             <span className="text-orange-600 font-bold">총 비용: ₩ {formatNumber(totalCostManagement)}</span>
                        </div>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-8">
                        {/* Outsourcing List */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-600">외주 용역비 예산 (Outsourcing)</label>
                                <button onClick={addOutsourcing} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center"><Plus size={10} className="mr-0.5"/> 추가</button>
                            </div>
                            <div className="space-y-2">
                                {outsourcingCosts.map(item => (
                                    <div key={item.id} className="flex items-center space-x-2">
                                        <input className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-orange-500" value={item.name} onChange={(e) => updateOutsourcing(item.id, 'name', e.target.value)} placeholder="항목명" />
                                        <div className="relative w-32">
                                            <input className="w-full text-right border border-gray-300 rounded px-2 py-1.5 text-xs font-bold font-mono outline-none focus:border-orange-500" value={formatNumber(item.amount)} onChange={(e) => updateOutsourcing(item.id, 'amount', parseInt(e.target.value.replace(/,/g, '')) || 0)} />
                                        </div>
                                        <button onClick={() => removeOutsourcing(item.id)} className="text-gray-300 hover:text-red-500"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Expense List */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-600">기타 경비 (S/W, Rent, etc.)</label>
                                <button onClick={addExpense} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center"><Plus size={10} className="mr-0.5"/> 추가</button>
                            </div>
                            <div className="space-y-2">
                                {expenses.map(item => (
                                    <div key={item.id} className="flex items-center space-x-2">
                                        <input className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-orange-500" value={item.name} onChange={(e) => updateExpense(item.id, 'name', e.target.value)} placeholder="항목명" />
                                        <div className="relative w-32">
                                            <input className="w-full text-right border border-gray-300 rounded px-2 py-1.5 text-xs font-bold font-mono outline-none focus:border-orange-500" value={formatNumber(item.amount)} onChange={(e) => updateExpense(item.id, 'amount', parseInt(e.target.value.replace(/,/g, '')) || 0)} />
                                        </div>
                                        <button onClick={() => removeExpense(item.id)} className="text-gray-300 hover:text-red-500"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Execution Plan (Estimate Basis) */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                     <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center space-x-2">
                             <div className="bg-slate-100 p-1 rounded"><FileText size={14} className="text-slate-600"/></div>
                             <h3 className="text-sm font-bold text-slate-800">수행 계획 (견적 기준)</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center hover:bg-blue-100"><Download size={12} className="mr-1"/> 견적 가져오기</button>
                            <span className="text-xs font-bold text-slate-800">총 예상 매출: ₩ {formatNumber(totalEstimateRevenue)}</span>
                        </div>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 w-10"></th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">등급</th>
                                <th className="px-6 py-3 text-center">견적 M/M</th>
                                <th className="px-6 py-3 text-right">단가 (Unit Price)</th>
                                <th className="px-6 py-3 text-right">금액 (Amount)</th>
                                <th className="px-6 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {estimateRows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 text-center"><MoreHorizontal size={14} className="text-gray-300 mx-auto"/></td>
                                    <td className="px-6 py-3"><input className="w-full bg-transparent outline-none font-medium text-slate-700" value={row.role} onChange={(e) => updateEstimateRow(row.id, 'role', e.target.value)} /></td>
                                    <td className="px-6 py-3">
                                        <select className="bg-transparent outline-none text-slate-600" value={row.grade} onChange={(e) => updateEstimateRow(row.id, 'grade', e.target.value)}>
                                            <option>특급</option><option>고급</option><option>중급</option><option>초급</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-3 text-center"><input type="number" step="0.5" className="w-16 text-center bg-transparent outline-none font-bold" value={row.mm} onChange={(e) => updateEstimateRow(row.id, 'mm', parseFloat(e.target.value) || 0)} /></td>
                                    <td className="px-6 py-3 text-right font-mono text-blue-400"><input className="w-full text-right bg-transparent outline-none" value={formatNumber(row.unitPrice)} onChange={(e) => updateEstimateRow(row.id, 'unitPrice', parseInt(e.target.value.replace(/,/g, '')) || 0)} /></td>
                                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">₩ {formatNumber(row.mm * row.unitPrice)}</td>
                                    <td className="px-6 py-3 text-center"><button onClick={() => removeEstimateRow(row.id)}><Trash2 size={14} className="text-gray-300 hover:text-red-500"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addEstimateRow} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-t border-gray-100 flex items-center justify-center">+ 계획 추가 (Row)</button>
                    
                    {/* History Section */}
                    <div className="p-4 bg-slate-50 border-t border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                             <History size={14} className="text-slate-400"/>
                             <span className="text-xs font-bold text-slate-600">수행 계획 히스토리 (History & Memo)</span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 text-xs text-slate-500">
                            <p className="flex justify-between"><span>최초 견적 수행 계획 수립</span> <span className="text-gray-300">2024-10-01 10:00 - 김철수</span></p>
                        </div>
                        <div className="flex space-x-2">
                            <input className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-xs outline-none focus:border-orange-500" placeholder="변경 사유나 메모를 입력하세요..." value={memo} onChange={(e) => setMemo(e.target.value)}/>
                            <button className="bg-slate-800 text-white p-2 rounded hover:bg-slate-700"><Send size={14}/></button>
                        </div>
                    </div>
                </div>

                {/* 4. Resource Planning (Real Execution) */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center space-x-2">
                             <div className="bg-orange-100 p-1 rounded"><Users size={14} className="text-orange-600"/></div>
                             <h3 className="text-sm font-bold text-slate-800">실 수행 (Resource Planning)</h3>
                        </div>
                        <div className="flex space-x-3 text-[10px] font-bold">
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>정규직</span>
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>프리랜서</span>
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-gray-500 mr-1.5"></div>외주(용역)</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 w-10"></th>
                                    <th className="px-4 py-3">구분 (Role)</th>
                                    <th className="px-4 py-3">부서</th>
                                    <th className="px-4 py-3">투입 인력 (Select)</th>
                                    <th className="px-4 py-3">등급</th>
                                    <th className="px-4 py-3">투입 형태</th>
                                    <th className="px-4 py-3 text-right">월 단가 (Cost)</th>
                                    <th className="px-4 py-3 text-center">투입 기간 (Start ~ End)</th>
                                    <th className="px-4 py-3 text-center">실제 M/M</th>
                                    <th className="px-4 py-3 text-right">총 비용</th>
                                    <th className="px-4 py-3 text-center">Memo</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {resourceRows.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-center"><MoreHorizontal size={14} className="text-gray-300 mx-auto"/></td>
                                        <td className="px-4 py-3"><input className="w-24 bg-transparent outline-none font-medium text-slate-700" value={row.role} onChange={(e) => updateResourceRow(row.id, 'role', e.target.value)} /></td>
                                        <td className="px-4 py-3 text-slate-500">{row.dept}</td>
                                        <td className="px-4 py-3">
                                            <input 
                                                className="w-20 bg-transparent border-b border-transparent focus:border-orange-500 outline-none font-bold text-slate-800"
                                                value={row.name}
                                                placeholder={row.dept === '외주' ? '이름 검색..' : '이름'}
                                                onChange={(e) => updateResourceRow(row.id, 'name', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{row.grade}</td>
                                        <td className="px-4 py-3">
                                            <select 
                                                className={`bg-transparent outline-none font-bold ${row.type === '정규직' ? 'text-blue-600' : row.type === '프리랜서' ? 'text-purple-600' : 'text-slate-500'}`}
                                                value={row.type}
                                                onChange={(e) => updateResourceRow(row.id, 'type', e.target.value as ResourceRow['type'])}
                                            >
                                                <option>정규직</option><option>프리랜서</option><option>외주</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                                             <input className="w-20 text-right bg-transparent outline-none" value={formatNumber(row.monthlyCost)} onChange={(e) => updateResourceRow(row.id, 'monthlyCost', parseInt(e.target.value.replace(/,/g, '')) || 0)} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center space-x-1 border border-gray-200 rounded px-2 py-1 bg-white">
                                                <input type="date" className="bg-transparent outline-none text-[10px]" value={row.startDate} onChange={(e) => updateResourceRow(row.id, 'startDate', e.target.value)} />
                                                <span className="text-gray-300">~</span>
                                                <input type="date" className="bg-transparent outline-none text-[10px]" value={row.endDate} onChange={(e) => updateResourceRow(row.id, 'endDate', e.target.value)} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold">
                                            <input className="w-10 text-center bg-transparent border border-gray-200 rounded py-1" value={row.mm} onChange={(e) => updateResourceRow(row.id, 'mm', parseFloat(e.target.value) || 0)} />
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-gray-400">₩</span>
                                                <span>{formatNumber(row.monthlyCost * row.mm)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center"><MessageSquare size={14} className="text-orange-300 mx-auto cursor-pointer hover:text-orange-500"/></td>
                                        <td className="px-4 py-3 text-center"><button onClick={() => removeResourceRow(row.id)}><Trash2 size={14} className="text-gray-300 hover:text-red-500"/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-600">
                                <tr>
                                    <td colSpan={8} className="px-4 py-3 text-center">합계</td>
                                    <td className="px-4 py-3 text-center text-orange-600">{totalActualMM.toFixed(1)}</td>
                                    <td className="px-4 py-3 text-right font-mono text-orange-600">₩ {formatNumber(totalActualLaborCost)}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <button onClick={addResourceRow} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-t border-gray-100 flex items-center justify-center">+ 인력 추가 (Role)</button>
                </div>
            </div>
        </div>
    );
};
