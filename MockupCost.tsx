import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, FileText, FileSpreadsheet, Plus, Search, Calendar, ChevronLeft, ChevronRight, X, CheckCircle2, CheckCircle } from 'lucide-react';
import { formatNumber } from './utils';
import { StorageService } from './persistence';

interface CostRecord {
  id: number;
  date: string;
  month: number;
  pj: string;
  type: string;
  vendor: string;
  desc: string;
  amt: number;
}

export const MockupCost = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [costs, setCosts] = useState<CostRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCosts = async () => {
      const data = await StorageService.getCosts();
      setCosts(data);
    };
    loadCosts();
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const filteredCosts = (costs || []).filter(cost => 
    cost.month === selectedMonth && 
    (cost.pj.toLowerCase().includes(searchTerm.toLowerCase()) || 
     cost.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cost.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalMonthlySpend = filteredCosts.reduce((acc, curr) => acc + curr.amt, 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTimeout(async () => {
        const mockNew: CostRecord = { 
          id: Date.now(), 
          date: `2024-${selectedMonth.toString().padStart(2, '0')}-01`, 
          month: selectedMonth, 
          pj: "엑셀 업로드 프로젝트", 
          type: "기타경비", 
          vendor: "파일 파싱 거래처", 
          desc: "엑셀 대량 등록 테스트", 
          amt: 2500000 
        };
        
        if (window.confirm(`'${file.name}'에서 데이터를 가져오시겠습니까?`)) {
          const updated = [mockNew, ...costs];
          setCosts(updated);
          await StorageService.setCosts(updated);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      {showToast && (
        <div className="absolute top-4 right-4 z-[100] bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3">
          <CheckCircle className="text-green-400" size={20} />
          <span className="text-sm font-bold">비용 정보가 업데이트되었습니다.</span>
        </div>
      )}

      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center space-x-2"><CreditCard size={20} className="text-orange-500" /><h2 className="text-lg font-bold text-slate-800">비용 집행 상세 관리</h2></div>
        <div className="flex space-x-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload}/>
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded text-sm font-medium flex items-center shadow-sm"><FileSpreadsheet size={14} className="mr-2" /> 엑셀 업로드</button>
          <button className="px-3 py-1.5 bg-slate-900 text-white rounded text-sm font-medium flex items-center"><Plus size={14} className="mr-2" /> 직접 추가</button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 pt-4 overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 pb-3">
          {months.map((month) => (
            <button key={month} onClick={() => setSelectedMonth(month)} className={`flex flex-col items-center justify-center px-5 py-2 rounded-lg border transition-all ${selectedMonth === month ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500'}`}><span className="text-lg font-extrabold">{month}월</span></button>
          ))}
        </div>
      </div>

      <div className="p-6 pb-0 flex justify-between items-end space-x-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-64"><div className="text-xs font-bold text-gray-500 mb-1">{selectedMonth}월 총 집행 비용</div><div className="text-2xl font-black text-slate-900">₩ {formatNumber(totalMonthlySpend)}</div></div>
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="검색..." className="pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
      </div>

      <div className="p-6 flex-1 overflow-hidden flex flex-col">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b">
                <tr><th className="px-6 py-4">집행일자</th><th className="px-6 py-4">프로젝트</th><th className="px-6 py-4">비용구분</th><th className="px-6 py-4 text-right">금액</th><th className="px-6 py-4 text-center">증빙</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCosts.map((row) => (
                  <tr key={row.id} className="hover:bg-orange-50/20"><td className="px-6 py-4 font-mono text-xs text-gray-400">{row.date}</td><td className="px-6 py-4 font-bold">{row.pj}</td><td className="px-6 py-4"><span className="text-[10px] px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600">{row.type}</span></td><td className="px-6 py-4 text-right font-black font-mono">₩ {formatNumber(row.amt)}</td><td className="px-6 py-4 text-center"><FileText size={18} className="mx-auto text-gray-300" /></td></tr>
                ))}
                {filteredCosts.length === 0 && <tr><td colSpan={5} className="text-center py-20 text-gray-400">내역이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};