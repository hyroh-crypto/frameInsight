
import React from 'react';
import { Type, Palette, MousePointer2, Layout, CheckCircle2, AlertTriangle, Info, Bell, Search, Plus, Save, Download } from 'lucide-react';

export const StyleGuide = () => {
  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-8 font-sans animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col space-y-2 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
            <Palette className="mr-3 text-orange-600" size={32} /> Design System & Style Guide
          </h1>
          <p className="text-slate-500 font-medium">FrameInsight 애플리케이션의 일관된 UI/UX를 위한 디자인 표준 정의서입니다.</p>
        </div>

        {/* 1. Typography */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Type className="mr-2 text-slate-400" size={24} /> Typography (Pretendard)
          </h2>
          <div className="space-y-8">
            <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-100 pb-4">
              <div className="col-span-3 text-xs font-mono text-slate-400">Heading 1 / Black / 30px</div>
              <div className="col-span-9 text-3xl font-black text-slate-900">The quick brown fox jumps over the lazy dog.</div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-100 pb-4">
              <div className="col-span-3 text-xs font-mono text-slate-400">Heading 2 / Bold / 24px</div>
              <div className="col-span-9 text-2xl font-bold text-slate-800">전사 성과 분석 대시보드</div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-100 pb-4">
              <div className="col-span-3 text-xs font-mono text-slate-400">Heading 3 / Bold / 18px</div>
              <div className="col-span-9 text-lg font-bold text-slate-800">프로젝트 등록 및 관리</div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-100 pb-4">
              <div className="col-span-3 text-xs font-mono text-slate-400">Body / Medium / 14px</div>
              <div className="col-span-9 text-sm font-medium text-slate-600">
                본문 텍스트는 가독성을 위해 Slate-600 컬러를 기본으로 사용합니다. Pretendard 폰트는 숫자의 가독성이 뛰어나며, 데이터 표현에 최적화되어 있습니다.
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-xs font-mono text-slate-400">Caption / Bold / 10-12px</div>
              <div className="col-span-9">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">CAPTION TEXT</span>
                <span className="ml-4 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">STATUS LABEL</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Palette */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Palette className="mr-2 text-slate-400" size={24} /> Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Primary (Brand)</h3>
              <div className="h-16 rounded-lg bg-orange-600 flex items-end p-2 text-white text-xs font-mono font-bold shadow-sm">Orange-600 #EA580C</div>
              <div className="h-12 rounded-lg bg-orange-500 flex items-end p-2 text-white text-xs font-mono font-bold shadow-sm">Orange-500 #F97316</div>
              <div className="h-10 rounded-lg bg-orange-100 flex items-end p-2 text-orange-800 text-xs font-mono font-bold">Orange-100</div>
              <div className="h-8 rounded-lg bg-orange-50 flex items-end p-2 text-orange-600 text-xs font-mono font-bold border border-orange-100">Orange-50</div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Neutral (Slate)</h3>
              <div className="h-16 rounded-lg bg-slate-900 flex items-end p-2 text-white text-xs font-mono font-bold shadow-sm">Slate-900 #0F172A</div>
              <div className="h-12 rounded-lg bg-slate-800 flex items-end p-2 text-white text-xs font-mono font-bold shadow-sm">Slate-800 #1E293B</div>
              <div className="h-10 rounded-lg bg-slate-200 flex items-end p-2 text-slate-600 text-xs font-mono font-bold">Slate-200</div>
              <div className="h-8 rounded-lg bg-slate-50 flex items-end p-2 text-slate-500 text-xs font-mono font-bold border border-slate-100">Slate-50</div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Semantic (Status)</h3>
              <div className="flex space-x-2">
                <div className="flex-1 h-12 rounded-lg bg-green-500 flex items-end p-2 text-white text-xs font-mono font-bold shadow-sm">Success</div>
                <div className="flex-1 h-12 rounded-lg bg-green-50 flex items-end p-2 text-green-700 text-xs font-mono font-bold border border-green-100">Bg</div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-12 rounded-lg bg-red-500 flex items-end p-2 text-white text-xs font-mono font-bold shadow-sm">Error</div>
                <div className="flex-1 h-12 rounded-lg bg-red-50 flex items-end p-2 text-red-700 text-xs font-mono font-bold border border-red-100">Bg</div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-12 rounded-lg bg-blue-500 flex items-end p-2 text-white text-xs font-mono font-bold shadow-sm">Info</div>
                <div className="flex-1 h-12 rounded-lg bg-blue-50 flex items-end p-2 text-blue-700 text-xs font-mono font-bold border border-blue-100">Bg</div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Gradients (Charts)</h3>
              <div className="h-12 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 shadow-sm"></div>
              <div className="h-12 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm"></div>
              <div className="h-12 rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 shadow-sm"></div>
            </div>
          </div>
        </section>

        {/* 3. Components */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <MousePointer2 className="mr-2 text-slate-400" size={24} /> UI Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-2">Buttons</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-700 transition-all active:scale-95 flex items-center">
                  <Save size={16} className="mr-2" /> Primary Action
                </button>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95 flex items-center">
                  <Plus size={16} className="mr-2" /> Secondary Action
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
                  Outline Button
                </button>
                <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center">
                  <Download size={14} className="mr-1.5" /> Small / Ghost
                </button>
              </div>
            </div>

            {/* Badges & Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-2">Badges & Status</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center">
                  <CheckCircle2 size={12} className="mr-1" /> 완료 (Completed)
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center">
                  <Info size={12} className="mr-1" /> 진행중 (In Progress)
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  대기 (Pending)
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 flex items-center animate-pulse">
                  <AlertTriangle size={12} className="mr-1" /> 이슈 (Issue)
                </span>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-2">Form Elements</h3>
              <div className="space-y-3 max-w-sm">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm" placeholder="검색어를 입력하세요..." />
                </div>
                <div className="flex space-x-2">
                  <select className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 shadow-sm text-slate-700">
                    <option>옵션 선택 (Select)</option>
                    <option>Option A</option>
                    <option>Option B</option>
                  </select>
                  <input type="text" className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 outline-none text-right font-mono" value="1,250,000" readOnly />
                </div>
              </div>
            </div>

            {/* Card Layout */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-2">Card Layout</h3>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base font-bold text-slate-800">Card Title</h4>
                  <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold">TAG</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">카드 컴포넌트의 기본 스타일입니다. 호버 시 그림자가 강조됩니다.</p>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-2/3"></div>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Layout Structure */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Layout className="mr-2 text-slate-400" size={24} /> Layout Grid System
          </h2>
          <div className="grid grid-cols-12 gap-4 h-32 text-xs font-bold text-slate-400 text-center">
            <div className="col-span-2 bg-slate-100 rounded-lg border border-slate-200 border-dashed flex items-center justify-center">Sidebar (col-2)</div>
            <div className="col-span-10 flex flex-col gap-4">
              <div className="h-12 bg-slate-100 rounded-lg border border-slate-200 border-dashed flex items-center justify-center">Header (h-16)</div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-lg border border-orange-200 border-dashed flex items-center justify-center text-orange-400">Content (col-1)</div>
                <div className="bg-orange-50 rounded-lg border border-orange-200 border-dashed flex items-center justify-center text-orange-400">Content (col-1)</div>
                <div className="bg-orange-50 rounded-lg border border-orange-200 border-dashed flex items-center justify-center text-orange-400">Content (col-1)</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
