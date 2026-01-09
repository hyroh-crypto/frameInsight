import React from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

export const MockupLogin = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 z-0"></div>
      <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-3xl z-0"></div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10 mx-4">
        <div className="p-10">
          <div className="flex flex-col items-center mb-8">
            {/* Corporate Logo 'frameout' - Smaller */}
            <div className="mb-2 select-none">
              <span className="text-lg font-extrabold text-orange-500 tracking-tighter">frameout</span>
            </div>
            
            {/* Product Name 'FrameInsight' - Larger & Emphasized */}
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">FrameInsight</h1>
            
            {/* System Description */}
            <p className="text-sm text-gray-500 font-bold tracking-tight">프로젝트 관리/성과분석 시스템</p>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">이름 (Name)</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                  placeholder="이름을 입력하세요" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">비밀번호 (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                  placeholder="비밀번호를 입력하세요" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center group">
                <span>로그인</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-center">
           <span className="text-xs text-gray-400 font-medium">© FRAMEOUT - Where AI Drives UX</span>
        </div>
      </div>
    </div>
  );
};