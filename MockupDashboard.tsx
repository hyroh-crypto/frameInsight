
import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, BarChart3, HelpCircle, X } from 'lucide-react';

interface MetricInfo {
  title: string;
  formula: string;
  description: string;
}

const METRIC_DETAILS: Record<string, MetricInfo> = {
  revenue: {
    title: "전사 매출액 (당월/누적)",
    formula: "∑ (프로젝트별 당월 기성 매출 × 부서별 기여율)",
    description: "전사적으로 발생한 총 매출의 합계입니다. 당월은 해당 월의 실적이며, 누적은 연초부터 현재까지의 합산 실적을 나타냅니다."
  },
  profit: {
    title: "영업 이익 (당월/누적)",
    formula: "당월: 당월 매출 - 당월 비용 / 누적: 연초부터 현재까지의 합계",
    description: "매출에서 모든 직접 비용과 본사 운영비(공통비)를 차감한 순수 이익입니다. 누적 수치는 연간 목표 달성 여부를 판단하는 지표가 됩니다."
  },
  margin: {
    title: "영업 이익률 (당월/누적)",
    formula: "(기간 영업 이익 ÷ 기간 매출액) × 100",
    description: "매출액 대비 영업이익의 비중입니다. 당월 수치는 현재의 효율을, 누적 수치는 해당 연도의 전반적인 수익 구조를 보여줍니다."
  },
  ucm: {
    title: "가동률 (당월/누적 UCM)",
    formula: "(기간 투입 M/M ÷ 기간 가용 M/M) × 100",
    description: "인력 자원이 실제 유료 프로젝트에 얼마나 효율적으로 투입되었는지를 나타냅니다. 90% 이상 유지를 권장합니다."
  },
  contribution: {
    title: "이익 기여율 (당월/누적)",
    formula: "당월: (부서 당월 영업이익 ÷ 전사 당월 영업이익) × 100 / 누적: (부서 누적 이익 ÷ 전사 누적 이익) × 100",
    description: "전체 전사 이익 중 해당 부서가 창출한 이익의 비중입니다. 연한 색상은 당월 실적, 진한 색상은 누적 실적 기여도를 의미합니다."
  }
};

export const MockupDashboard = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderTooltip = (id: string, alignRight: boolean = false) => {
    if (activeTooltip !== id) return null;
    const info = METRIC_DETAILS[id];
    return (
      <div 
        ref={tooltipRef}
        className={`absolute z-[100] top-full mt-2 w-72 bg-slate-800 text-white p-4 rounded-lg shadow-2xl border border-slate-700 animate-fadeIn ${alignRight ? 'right-0' : 'left-0'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-orange-400 text-sm">{info.title}</h4>
          <button onClick={() => setActiveTooltip(null)} className="text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">계산 수식 (Formula)</span>
            <p className="text-xs font-sans bg-slate-900/50 p-2 rounded mt-1 leading-relaxed border border-slate-700/50 whitespace-normal">
              {info.formula}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">의미 및 상세 (Description)</span>
            <p className="text-xs text-slate-300 mt-1 leading-normal whitespace-normal">
              {info.description}
            </p>
          </div>
        </div>
        <div className={`absolute -top-1.5 w-3 h-3 bg-slate-800 rotate-45 border-t border-l border-slate-700 ${alignRight ? 'right-4' : 'left-4'}`}></div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">2024년 10월 전사 성과 분석 대시보드</h2>
        <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
                <span className="flex items-center text-xs text-gray-400"><div className="w-2.5 h-1.5 bg-orange-200 mr-1.5 rounded-sm"></div>당월 실적</span>
                <span className="flex items-center text-xs text-gray-400"><div className="w-2.5 h-1.5 bg-orange-600 mr-1.5 rounded-sm"></div>누적 실적</span>
            </div>
            <div className="text-sm text-gray-400">마지막 업데이트: 2024-10-24 09:30</div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* 전사 매출액 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between relative min-h-[160px] transition-transform hover:scale-[1.01]">
              <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-1.5 group">
                    <span className="text-sm font-bold text-slate-500">전사 매출액</span>
                    <button 
                      onClick={() => setActiveTooltip('revenue')}
                      className={`transition-colors p-1 -m-1 ${activeTooltip === 'revenue' ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
                    >
                      <HelpCircle size={14} />
                    </button>
                    {renderTooltip('revenue')}
                  </div>
                  <span className="text-[11px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">달성률 84%</span>
              </div>
              <div className="mb-2">
                  <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl font-black text-slate-900 leading-none">₩12.5억</span>
                      <span className="text-xs text-slate-400 font-bold tracking-tight">당월</span>
                  </div>
                  <div className="flex items-center mt-2.5 px-2 py-1 bg-slate-50 rounded-lg w-fit">
                      <span className="text-[11px] font-bold text-slate-400 mr-2 bg-slate-200 px-1 rounded">누적</span> 
                      <span className="text-base font-bold text-slate-600 tracking-tight">₩118.4억</span>
                  </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs mt-auto">
                  <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                      <span>연간 목표</span>
                      <span className="text-slate-700">150억</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                     <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000" style={{width: '84%'}}></div>
                  </div>
              </div>
          </div>

          {/* 영업 이익 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between relative min-h-[160px] transition-transform hover:scale-[1.01]">
              <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-1.5 group">
                    <span className="text-sm font-bold text-slate-500">영업 이익</span>
                    <button 
                      onClick={() => setActiveTooltip('profit')}
                      className={`transition-colors p-1 -m-1 ${activeTooltip === 'profit' ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
                    >
                      <HelpCircle size={14} />
                    </button>
                    {renderTooltip('profit')}
                  </div>
                  <span className="text-[11px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">달성률 70%</span>
              </div>
              <div className="mb-2">
                  <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl font-black text-slate-900 leading-none">₩3.2억</span>
                      <span className="text-xs text-slate-400 font-bold tracking-tight">당월</span>
                  </div>
                  <div className="flex items-center mt-2.5 px-2 py-1 bg-slate-50 rounded-lg w-fit">
                      <span className="text-[11px] font-bold text-slate-400 mr-2 bg-slate-200 px-1 rounded">누적</span> 
                      <span className="text-base font-bold text-slate-600 tracking-tight">₩21.4억</span>
                  </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs mt-auto">
                  <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                      <span>연간 목표</span>
                      <span className="text-slate-700">40억</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                     <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000" style={{width: '70%'}}></div>
                  </div>
              </div>
          </div>

          {/* 당월 영업 이익률 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col relative min-h-[160px] transition-transform hover:scale-[1.01]">
              <div className="flex items-center space-x-1.5 mb-2">
                <span className="text-sm font-bold text-slate-500">영업 이익률</span>
                <button 
                  onClick={() => setActiveTooltip('margin')}
                  className={`transition-colors p-1 -m-1 ${activeTooltip === 'margin' ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
                >
                  <HelpCircle size={14} />
                </button>
                {renderTooltip('margin')}
              </div>
              <div className="mb-2">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-black text-slate-900 leading-none">25.6%</span>
                  <span className="text-xs text-slate-400 font-bold tracking-tight">당월</span>
                </div>
                <div className="flex items-center mt-2.5 px-2 py-1 bg-slate-50 rounded-lg w-fit">
                  <span className="text-[11px] font-bold text-slate-400 mr-2 bg-slate-200 px-1 rounded">누적</span> 
                  <span className="text-base font-bold text-slate-600 tracking-tight">22.8%</span>
                </div>
              </div>
              <div className="text-xs font-bold flex items-center text-slate-400 mt-auto border-t border-slate-100 pt-4">
                <TrendingUp size={14} className="mr-1.5 text-red-400 rotate-180" />
                <span>전월 대비 -0.5%</span>
              </div>
          </div>

          {/* 당월 가동률 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col relative min-h-[160px] transition-transform hover:scale-[1.01]">
              <div className="flex items-center space-x-1.5 mb-2">
                <span className="text-sm font-bold text-slate-500">가동률 (UCM)</span>
                <button 
                  onClick={() => setActiveTooltip('ucm')}
                  className={`transition-colors p-1 -m-1 ${activeTooltip === 'ucm' ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
                >
                  <HelpCircle size={14} />
                </button>
                {renderTooltip('ucm')}
              </div>
              <div className="mb-2">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-black text-slate-900 leading-none">92.4%</span>
                  <span className="text-xs text-slate-400 font-bold tracking-tight">당월</span>
                </div>
                <div className="flex items-center mt-2.5 px-2 py-1 bg-slate-50 rounded-lg w-fit">
                  <span className="text-[11px] font-bold text-slate-400 mr-2 bg-slate-200 px-1 rounded">누적</span> 
                  <span className="text-base font-bold text-slate-600 tracking-tight">89.5%</span>
                </div>
              </div>
              <div className="text-xs font-bold flex items-center text-orange-600 mt-auto border-t border-slate-100 pt-4">
                <TrendingUp size={14} className="mr-1.5" />
                <span>전월 대비 +2.1%</span>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center justify-between">
              <span className="flex items-center"><BarChart3 size={18} className="mr-2.5 text-orange-500" /> 부서별 성과 및 기여도 분석</span>
              <div className="flex space-x-3 text-xs">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-bold shadow-sm">단위: 백만원</span>
              </div>
            </h3>
            
            <div className="overflow-visible">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs bg-slate-50 font-extrabold uppercase tracking-tight">
                    <th className="text-left py-4 px-4 w-1/4 rounded-tl-lg">부서명</th>
                    <th className="text-right py-4 px-4">매출액 (당월/누적)</th>
                    <th className="text-right py-4 px-4">영업이익 (당월/누적)</th>
                    <th className="text-right py-4 px-4 w-[200px] rounded-tr-lg">
                      <div className="flex items-center justify-end relative">
                        <span className="mr-1.5">이익 기여율 (당월/누적)</span>
                        <button 
                          onClick={() => setActiveTooltip('contribution')}
                          className={`transition-colors p-1 -m-1 ${activeTooltip === 'contribution' ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
                        >
                          <HelpCircle size={14} />
                        </button>
                        {renderTooltip('contribution', true)}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "플랫폼 개발팀", rev: 450, rev_cum: 3200, target: 400, op_mon: 120, op_cum: 850, contrib_mon: 38, contrib_cum: 35 },
                    { name: "금융사업 2팀", rev: 320, rev_cum: 2400, target: 350, op_mon: 80, op_cum: 520, contrib_mon: 25, contrib_cum: 22 },
                    { name: "공공사업 1팀", rev: 280, rev_cum: 2100, target: 250, op_mon: 65, op_cum: 410, contrib_mon: 20, contrib_cum: 18 },
                    { name: "AI 연구소", rev: 150, rev_cum: 1200, target: 200, op_mon: -20, op_cum: -50, contrib_mon: -6, contrib_cum: -5 },
                    { name: "디자인팀", rev: 120, rev_cum: 950, target: 120, op_mon: 30, op_cum: 210, contrib_mon: 9, contrib_cum: 10 },
                  ].map((dept, i) => {
                    const achieveRate = Math.round((dept.rev / dept.target) * 100);
                    return (
                      <tr key={i} className="hover:bg-orange-50/30 transition-colors group">
                        <td className="py-4 px-4 font-bold text-slate-800 border-l-2 border-transparent group-hover:border-orange-500 transition-all">{dept.name}</td>
                        <td className="text-right py-4 px-4">
                          <div className="flex flex-col items-end">
                            <div className="font-extrabold text-slate-800 text-base">{dept.rev} <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${achieveRate >= 100 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{achieveRate}%</span></div>
                            <div className="text-[11px] text-slate-400 font-bold mt-0.5">누적: {dept.rev_cum}</div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                           <div className="flex flex-col items-end">
                            <div className={`font-extrabold text-base ${dept.op_mon > 0 ? 'text-slate-800' : 'text-red-500'}`}>{dept.op_mon}</div>
                            <div className={`text-[11px] font-bold mt-0.5 ${dept.op_cum > 0 ? 'text-slate-400' : 'text-red-300'}`}>누적: {dept.op_cum}</div>
                           </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-3 w-full justify-end">
                                <span className={`text-[11px] font-black min-w-[32px] ${dept.contrib_mon < 0 ? 'text-red-500' : 'text-slate-400'}`}>{dept.contrib_mon}%</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner shrink-0">
                                  <div className={`h-full ${dept.contrib_mon > 0 ? 'bg-orange-200' : 'bg-red-200'}`} style={{width: `${Math.abs(dept.contrib_mon)}%`}}></div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 w-full justify-end">
                                <span className={`text-xs font-black min-w-[32px] ${dept.contrib_cum < 0 ? 'text-red-600' : 'text-slate-700'}`}>{dept.contrib_cum}%</span>
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner shrink-0">
                                  <div className={`h-full ${dept.contrib_cum > 0 ? 'bg-orange-600' : 'bg-red-500'}`} style={{width: `${Math.abs(dept.contrib_cum)}%`}}></div>
                                </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-fit">
             <h3 className="text-base font-bold text-slate-800 mb-8 flex items-center"><TrendingUp size={18} className="mr-2 text-orange-500" /> 비용 구성 비율</h3>
             <div className="flex items-center justify-center mb-8">
                <div className="relative w-48 h-48 drop-shadow-xl">
                   <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                      <path className="text-slate-500" strokeDasharray="28, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                      <path className="text-amber-400" strokeDasharray="14, 100" strokeDashoffset="-28" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                      <path className="text-orange-600" strokeDasharray="42, 100" strokeDashoffset="-42" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">84%</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Labor Cost</span>
                   </div>
                </div>
             </div>
             
             <div className="space-y-4 px-4">
               <div className="flex justify-between items-center text-xs">
                 <span className="flex items-center font-bold text-slate-600"><div className="w-3 h-3 rounded bg-orange-600 mr-2.5 shadow-sm"></div>정규직 인건비</span>
                 <span className="font-black text-slate-900 text-sm">42%</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="flex items-center font-bold text-slate-600"><div className="w-3 h-3 rounded bg-amber-400 mr-2.5 shadow-sm"></div>계약직 인건비</span>
                 <span className="font-black text-slate-900 text-sm">14%</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="flex items-center font-bold text-slate-600"><div className="w-3 h-3 rounded bg-slate-500 mr-2.5 shadow-sm"></div>외주 용역비</span>
                 <span className="font-black text-slate-900 text-sm">28%</span>
               </div>
               <div className="flex justify-between items-center text-xs border-t border-dashed border-slate-200 pt-4 mt-2">
                 <span className="flex items-center font-bold text-slate-400"><div className="w-3 h-3 rounded bg-slate-200 mr-2.5 shadow-sm"></div>기타 경비</span>
                 <span className="font-black text-slate-400 text-sm">16%</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
