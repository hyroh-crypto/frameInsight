
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { List, Download, Search, TrendingUp, TrendingDown, Info, HelpCircle, X, Calculator, Calendar, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { StorageService } from './persistence';
import { formatNumber } from './utils';

export const MockupReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [projects, setProjects] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Tooltip State (string | null to identify which tooltip is open)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const loadReportData = async () => {
      const [pj, ct, emp] = await Promise.all([
        StorageService.getProjects(),
        StorageService.getCosts(),
        StorageService.getEmployees()
      ]);
      setProjects(pj);
      setCosts(ct);
      setEmployees(emp);
    };
    loadReportData();
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock Data Generation based on Month (Simulated)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 리포트용 부서별 데이터 가공 (실제 프로젝트/비용 기반 시뮬레이션 로직)
  // Monthly changes simulated by multiplying factor
  const factor = 1 + (selectedMonth % 3) * 0.1; 
  
  const reportData = useMemo(() => [
    { name: "플랫폼 개발팀", reg: 15, free: 5, rev: 450000000 * factor, cost: 180000000 * factor, common: 20000000 },
    { name: "DX 사업본부", reg: 10, free: 2, rev: 320000000 * factor, cost: 95000000 * factor, common: 12000000 },
    { name: "디자인팀", reg: 4, free: 1, rev: 120000000 * factor, cost: 35000000 * factor, common: 5000000 },
    { name: "AI 연구소", reg: 6, free: 0, rev: 150000000 * factor, cost: 130000000 * factor, common: 6000000 }, // Low profit
    { name: "금융사업 2팀", reg: 6, free: 2, rev: 280000000 * factor, cost: 82000000 * factor, common: 8000000 },
    { name: "공공사업 1팀", reg: 8, free: 2, rev: 210000000 * factor, cost: 75000000 * factor, common: 10000000 }
  ], [factor]);

  // Calculate Totals (Global)
  const totalRev = reportData.reduce((acc, r) => acc + r.rev, 0);
  const totalProfit = reportData.reduce((acc, r) => acc + (r.rev - r.cost - r.common), 0);
  const totalMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
  
  const totalReg = reportData.reduce((acc, r) => acc + r.reg, 0);
  const totalFree = reportData.reduce((acc, r) => acc + r.free, 0);

  // Simulate Cumulative Totals (Simple logic: Month * Monthly Avg)
  const totalRevCum = totalRev * selectedMonth * 0.95; 
  const totalProfitCum = totalProfit * selectedMonth * 0.92;
  const totalMarginCum = totalRevCum > 0 ? (totalProfitCum / totalRevCum) * 100 : 0;

  // Grade Logic
  const getGrade = (margin: number, contribution: number) => {
      if (margin >= 25 && contribution >= 15) return 'S';
      if (margin >= 15) return 'A';
      if (margin >= 5) return 'B';
      return 'C';
  };

  const getGradeColor = (grade: string) => {
      switch(grade) {
          case 'S': return 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-500';
          case 'A': return 'bg-green-100 text-green-700 border-green-200 ring-green-500';
          case 'B': return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500';
          default: return 'bg-gray-100 text-gray-500 border-gray-200 ring-gray-400';
      }
  };

  // Sort Logic
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    const data = reportData.map(row => {
        const profit = row.rev - row.cost - row.common;
        const totalCost = row.cost + row.common;
        const rate = row.rev > 0 ? (profit / row.rev) * 100 : 0;
        const contribution = totalProfit > 0 ? (profit / totalProfit) * 100 : 0;
        const grade = getGrade(rate, contribution);
        const totalCount = row.reg + row.free;
        
        return {
            ...row,
            profit,
            totalCost,
            rate,
            contribution,
            grade,
            totalCount
        };
    });

    if (sortConfig !== null) {
      data.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof typeof a];
        let bValue: any = b[sortConfig.key as keyof typeof b];

        // Custom Grade Sorting
        if (sortConfig.key === 'grade') {
             const gradeOrder: Record<string, number> = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
             aValue = gradeOrder[a.grade as string] || 0;
             bValue = gradeOrder[b.grade as string] || 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [reportData, sortConfig, totalProfit]);

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown size={12} className="ml-1 text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
        ? <ArrowUp size={12} className="ml-1 text-orange-400" />
        : <ArrowDown size={12} className="ml-1 text-orange-400" />;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-2"><List size={20} className="text-orange-500" /><h2 className="text-lg font-bold text-slate-800">월간 부서별 손익 리포트</h2></div>
        <button className="flex items-center space-x-2 text-sm text-slate-600 hover:text-orange-600 border border-slate-200 px-3 py-1.5 rounded bg-white transition-all hover:bg-orange-50 hover:border-orange-200"><Download size={14} /><span>Excel 다운로드</span></button>
      </div>

      {/* Month Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex space-x-1 min-w-max pb-3">
          {months.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`flex flex-col items-center justify-center px-5 py-2 rounded-lg border transition-all relative ${selectedMonth === month ? 'bg-orange-600 border-orange-600 text-white shadow-md transform scale-105 z-10' : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600'}`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Month</span>
              <span className="text-lg font-extrabold">{month}월</span>
              {selectedMonth === month && <div className="absolute -bottom-4 w-2 h-2 bg-orange-600 rotate-45"></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 grid grid-cols-3 gap-6 shrink-0">
          {/* Revenue Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-500 mb-2 flex items-center"><TrendingUp size={14} className="mr-1 text-slate-400"/> 전사 총 매출 (Revenue)</div>
              <div className="flex items-baseline space-x-2 border-b border-dashed border-gray-100 pb-3 mb-3">
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">₩ {formatNumber(totalRev)}</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">당월</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400">누적 (YTD)</span>
                  <span className="text-sm font-bold text-slate-600 font-mono">₩ {formatNumber(totalRevCum.toFixed(0))}</span>
              </div>
          </div>

          {/* Profit Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-500 mb-2 flex items-center"><Calculator size={14} className="mr-1 text-slate-400"/> 전사 총 영업이익 (Profit)</div>
              <div className="flex items-baseline space-x-2 border-b border-dashed border-gray-100 pb-3 mb-3">
                  <span className="text-2xl font-black text-orange-600 font-mono tracking-tight">₩ {formatNumber(totalProfit)}</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">당월</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400">누적 (YTD)</span>
                  <span className="text-sm font-bold text-slate-600 font-mono">₩ {formatNumber(totalProfitCum.toFixed(0))}</span>
              </div>
          </div>

          {/* Margin Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
               <div className="text-xs font-bold text-gray-500 mb-2 flex items-center"><Calendar size={14} className="mr-1 text-slate-400"/> 전사 평균 이익률 (Margin)</div>
              <div className="flex items-baseline space-x-2 border-b border-dashed border-gray-100 pb-3 mb-3">
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{totalMargin.toFixed(1)}%</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">당월</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400">누적 (YTD)</span>
                  <span className="text-sm font-bold text-slate-600 font-mono">{totalMarginCum.toFixed(1)}%</span>
              </div>
          </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-4">
             <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                <span className="w-2 h-6 bg-orange-500 rounded-sm"></span>
                <span>부서별 상세 성과 (Department Performance)</span>
             </div>
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none w-64 focus:border-orange-500 transition-colors" placeholder="부서명 검색..." />
             </div>
         </div>
         
         <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-auto flex flex-col relative">
            <table className="w-full text-sm text-right border-collapse">
              <thead className="bg-slate-800 text-white font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="px-6 py-4 text-left w-48 cursor-pointer hover:bg-slate-700 transition-colors group" onClick={() => handleSort('name')}>
                        <div className="flex items-center">부서명 <SortIcon column="name" /></div>
                    </th>
                    <th className="px-6 py-4 w-32 text-center cursor-pointer hover:bg-slate-700 transition-colors group" onClick={() => handleSort('totalCount')}>
                        <div className="flex items-center justify-center">
                            <span>인원</span><SortIcon column="totalCount" />
                        </div>
                        <span className="text-[10px] font-normal text-slate-400 block">(정규/프리)</span>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-700 transition-colors group" onClick={() => handleSort('rev')}>
                        <div className="flex items-center justify-end">매출액 (Revenue) <SortIcon column="rev" /></div>
                    </th>
                    <th className="px-6 py-4 bg-slate-700 text-orange-200 cursor-pointer hover:bg-slate-600 transition-colors group" onClick={() => handleSort('totalCost')}>
                        <div className="flex items-center justify-end">실행 원가 (Cost) <SortIcon column="totalCost" /></div>
                    </th>
                    <th className="px-6 py-4 text-orange-400 cursor-pointer hover:bg-slate-700 transition-colors group" onClick={() => handleSort('profit')}>
                        <div className="flex items-center justify-end">영업이익 (Profit) <SortIcon column="profit" /></div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-700 transition-colors group" onClick={() => handleSort('rate')}>
                        <div className="flex items-center justify-end">이익률 <SortIcon column="rate" /></div>
                    </th>
                    <th className="px-6 py-4 relative group cursor-pointer w-32 hover:bg-slate-700 transition-colors" onClick={() => handleSort('contribution')}>
                        <div className="flex items-center justify-end">
                            <span>이익 기여율</span>
                            <SortIcon column="contribution" />
                            <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'contribution' ? null : 'contribution'); }} className="ml-1 text-slate-400 hover:text-white"><HelpCircle size={14}/></button>
                        </div>
                        {activeTooltip === 'contribution' && (
                            <div ref={tooltipRef} className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white p-3 rounded-lg shadow-xl z-50 text-left border border-slate-600 font-normal">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-orange-400">이익 기여율 계산식</span>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }}><X size={12} className="text-slate-500 hover:text-white"/></button>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-800 p-2 rounded">
                                    (부서 영업이익 ÷ 전사 영업이익 합계) × 100
                                </p>
                                <div className="absolute -top-1 right-6 w-2 h-2 bg-slate-900 rotate-45 border-t border-l border-slate-600"></div>
                            </div>
                        )}
                    </th>
                    <th className="px-6 py-4 text-center w-24 relative cursor-pointer hover:bg-slate-700 transition-colors group" onClick={() => handleSort('grade')}>
                        <div className="flex items-center justify-center">
                            <span>Grade</span>
                            <SortIcon column="grade" />
                            <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'grade' ? null : 'grade'); }} className="ml-1 text-slate-400 hover:text-white"><HelpCircle size={14}/></button>
                        </div>
                        {activeTooltip === 'grade' && (
                            <div ref={tooltipRef} className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white p-3 rounded-lg shadow-xl z-50 text-left border border-slate-600 font-normal">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-orange-400">등급 산출 기준 (Criteria)</span>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }}><X size={12} className="text-slate-500 hover:text-white"/></button>
                                </div>
                                <div className="space-y-2 text-xs text-slate-300">
                                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1"><span className="font-bold text-amber-400">S Grade</span> <span>이익률 25%↑ & 기여율 15%↑</span></div>
                                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1"><span className="font-bold text-green-400">A Grade</span> <span>이익률 15%↑</span></div>
                                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1"><span className="font-bold text-blue-400">B Grade</span> <span>이익률 5%↑</span></div>
                                    <div className="flex justify-between"><span className="font-bold text-gray-400">C Grade</span> <span>이익률 5% 미만</span></div>
                                </div>
                                <div className="absolute -top-1 right-8 w-2 h-2 bg-slate-900 rotate-45 border-t border-l border-slate-600"></div>
                            </div>
                        )}
                    </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {processedData.map((row, idx) => {
                  const gradeColor = getGradeColor(row.grade);

                  return (
                    <tr key={idx} className="hover:bg-orange-50/20 transition-colors group">
                      <td className="px-6 py-4 text-left font-sans font-bold text-slate-800 border-l-4 border-transparent group-hover:border-orange-500 transition-all">{row.name}</td>
                      <td className="px-6 py-4 text-center font-sans">
                        <div className="flex justify-center items-center space-x-1">
                          <span className="font-bold text-slate-700">{row.reg}</span>
                          <span className="text-slate-300">/</span>
                          <span className={`font-bold ${row.free > 0 ? 'text-purple-600' : 'text-slate-400'}`}>{row.free}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-bold">{formatNumber(row.rev.toFixed(0))}</td>
                      <td className="px-6 py-4 text-slate-600 bg-slate-50 group-hover:bg-orange-50/30 font-medium">-{formatNumber(row.totalCost.toFixed(0))}</td>
                      <td className={`px-6 py-4 font-black text-base ${row.profit < 0 ? 'text-red-500' : 'text-orange-600'}`}>{formatNumber(row.profit.toFixed(0))}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-xs ${row.rate > 20 ? 'bg-green-100 text-green-700' : row.rate < 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                            {row.rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-end space-x-2">
                             <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                 <div className={`h-full ${row.contribution > 0 ? 'bg-blue-500' : 'bg-red-500'}`} style={{width: `${Math.min(Math.abs(row.contribution), 100)}%`}}></div>
                             </div>
                             <span className="text-xs text-slate-600 w-10">{row.contribution.toFixed(1)}%</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                          <span className={`inline-block w-8 h-8 leading-8 text-center rounded-full font-black text-sm border-2 ring-1 shadow-sm font-sans ${gradeColor}`}>
                              {row.grade}
                          </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-700">
                  <tr>
                      <td className="px-6 py-4 text-left">합계 (Total)</td>
                      <td className="px-6 py-4 text-center font-mono text-sm">
                          <span className="text-slate-800">{totalReg}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-purple-700">{totalFree}</span>
                      </td>
                      <td className="px-6 py-4">{formatNumber(totalRev.toFixed(0))}</td>
                      <td className="px-6 py-4 text-slate-500">-{formatNumber(reportData.reduce((a,b)=>a+b.cost+b.common,0).toFixed(0))}</td>
                      <td className="px-6 py-4 text-orange-600 font-black">{formatNumber(totalProfit.toFixed(0))}</td>
                      <td className="px-6 py-4">{totalMargin.toFixed(1)}%</td>
                      <td className="px-6 py-4">100.0%</td>
                      <td className="px-6 py-4"></td>
                  </tr>
              </tfoot>
            </table>
         </div>
      </div>
    </div>
  );
};
