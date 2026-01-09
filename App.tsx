
import React, { useState, useRef } from 'react';
import { LayoutDashboard, FileText, PaintBucket, Code2, CheckCircle2, Circle, Menu, Layers, List, Check, AlertTriangle, MessageSquare, ChevronLeft, ChevronRight, ThumbsUp, LogOut, Download, Loader2, ShieldCheck, Palette, Lock } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Phase } from './types';
import { permissionsData, screensData, inquiriesData, featuresData } from './data';
import { MockupDashboard } from './MockupDashboard';
import { MockupStandardInfo } from './MockupStandardInfo';
import { MockupProject } from './MockupProject';
import { MockupCost } from './MockupCost';
import { MockupForm, MockupAllocation } from './MockupHR';
import { MockupReport } from './MockupReport';
import { MockupLogin } from './MockupLogin';
import { MockupProposalReview } from './MockupProposalReview';
import { MockupProfile } from './MockupProfile';
import { StyleGuide } from './StyleGuide';

interface NavItemProps { icon: React.ReactNode; label: string; isOpen: boolean; active?: boolean; done?: boolean; }
const NavItem = ({ icon, label, isOpen, active = false, done = false }: NavItemProps) => (
  <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${active ? 'bg-orange-600 text-white shadow-md' : done ? 'text-green-400 hover:bg-slate-800' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
    <div className="relative">{icon}{done && !active && <CheckCircle2 className="absolute -top-1 -right-1 bg-slate-900 rounded-full text-green-500" size={12} />}</div>
    {isOpen && <span className={`font-medium whitespace-nowrap ${done && !active ? 'line-through opacity-70' : ''}`}>{label}</span>}
  </button>
);

const TabButton = ({ active, onClick, icon, label, hasAlert = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, hasAlert?: boolean }) => (
  <button onClick={onClick} className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${active ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
    <div className="relative">{icon}{hasAlert && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</div><span>{label}</span>
  </button>
);

export const App = () => {
  const [currentTab, setCurrentTab] = useState<'features' | 'screens' | 'permissions' | 'review' | 'mockups' | 'confirmation' | 'styles'>('mockups');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const mockupViewportRef = useRef<HTMLDivElement>(null);

  const slides = [
    { title: "로그인 (S000)", component: <MockupLogin /> },
    { title: "메인 대시보드 (S001)", component: <MockupDashboard /> }, 
    { title: "월별 기준정보 설정 (S002)", component: <MockupStandardInfo /> }, 
    { title: "프로젝트 등록/관리 (S003)", component: <MockupProject /> }, 
    { title: "비용 집행 상세 관리 (S004)", component: <MockupCost /> }, 
    { title: "직원 정보 관리 (S005)", component: <MockupForm /> }, 
    { title: "인력 배정 현황 (S006)", component: <MockupAllocation /> }, 
    { title: "월간 손익 리포트 (S007)", component: <MockupReport /> },
    { title: "제안 리뷰 및 피드백 (S008)", component: <MockupProposalReview /> },
    { title: "내 정보 관리 (S009)", component: <MockupProfile /> }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const downloadMockupImage = async () => {
    if (!mockupViewportRef.current) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await toPng(mockupViewportRef.current, { cacheBust: true, quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = slides[currentSlide].title.replace(/[:\/\\?%*|"<>]/g, '_');
      link.download = `FrameInsight_${fileName}_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download mockup image:', err);
    } finally { setIsDownloading(false); }
  };

  const phases: Phase[] = [
    { id: 1, title: "Phase 1: 기획 분석", duration: "1주", status: "completed", items: [{ name: "화면 목록 정의", done: true }, { name: "요구사항 확정", done: true }] }, 
    { id: 2, title: "Phase 2: 설계", duration: "2주", status: "in-progress", items: [{ name: "UI/UX 디자인 가이드", done: true }, { name: "상세 목업 작성", done: true }, { name: "설계 검토 및 확정", done: false, active: true }] }, 
    { id: 3, title: "Phase 3: 개발", duration: "4주", status: "pending", items: [{ name: "프론트엔드 개발", done: false }, { name: "최종 테스트 및 배포", done: false }] }
  ];

  const filteredScreens = selectedRole === 'ALL' ? screensData : screensData.filter(screen => screen.roleAccess.includes(selectedRole));

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-700"><div className="flex items-center space-x-2 font-bold text-xl tracking-tight"><LayoutDashboard className="text-orange-500" />{isSidebarOpen && <span className="text-orange-500 font-[Helvetica,Arial,sans-serif]">FrameInsight</span>}</div></div>
        <nav className="flex-1 py-6 space-y-2 px-3"><NavItem icon={<FileText size={20} />} label="기획서 검토 (완료)" isOpen={isSidebarOpen} done /><NavItem icon={<PaintBucket size={20} />} label="디자인/설계 (진행중)" isOpen={isSidebarOpen} active /><NavItem icon={<Code2 size={20} />} label="개발 설정" isOpen={isSidebarOpen} /></nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors" onClick={() => { setCurrentTab('mockups'); setCurrentSlide(9); }}>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold shadow-lg">SE</div>
            {isSidebarOpen && (<div><p className="text-sm font-medium">김철수 수석</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Profile & Security</p></div>)}
            <ShieldCheck size={16} className="text-slate-500 ml-auto" />
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10"><div className="flex items-center space-x-4"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-200"><Menu size={20} /></button><h2 className="text-lg font-semibold text-gray-800">Phase 2: UI/UX 디자인 및 상세 설계</h2></div><div className="flex items-center space-x-4"><div className="flex items-center space-x-2 text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100"><span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span><span className="font-medium">전체 화면 디자인 검토</span></div></div></header>
        <main className="flex-1 overflow-y-auto p-8"><div className="max-w-[1600px] mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">프로젝트 로드맵</h3><div className="flex items-center justify-between relative"><div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -z-10"></div>{phases.map((phase) => (<div key={phase.id} className="flex flex-col items-center bg-white px-4 z-0"><div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${phase.status === 'completed' ? 'border-green-500 bg-green-50 text-green-600' : phase.status === 'in-progress' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-gray-50 text-gray-300'}`}>{phase.status === 'completed' ? <Check size={16} /> : phase.status === 'in-progress' ? <Circle size={16} fill="currentColor" /> : <Circle size={16} />}</div><span className={`text-xs font-bold ${phase.status === 'completed' ? 'text-green-600' : phase.status === 'in-progress' ? 'text-orange-600' : 'text-gray-500'}`}>{phase.title}</span></div>))}</div></div>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <TabButton active={currentTab === 'features'} onClick={() => setCurrentTab('features')} icon={<List size={16} />} label="기능 정의" />
              <TabButton active={currentTab === 'styles'} onClick={() => setCurrentTab('styles')} icon={<Palette size={16} />} label="스타일 가이드" />
              <TabButton active={currentTab === 'screens'} onClick={() => setCurrentTab('screens')} icon={<Layers size={16} />} label="화면 목록" />
              <TabButton active={currentTab === 'mockups'} onClick={() => setCurrentTab('mockups')} icon={<PaintBucket size={16} />} label="UI 목업 (S)" hasAlert />
              <TabButton active={currentTab === 'review'} onClick={() => setCurrentTab('review')} icon={<CheckCircle2 size={16} />} label="기술 검토" />
              <TabButton active={currentTab === 'confirmation'} onClick={() => setCurrentTab('confirmation')} icon={<ThumbsUp size={16} />} label="설계 확정" />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[700px] flex flex-col">
              {currentTab === 'confirmation' && (<div className="p-8 max-w-4xl mx-auto w-full"><div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="p-6 border-b border-gray-200 bg-slate-50 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900 flex items-center"><CheckCircle2 className="text-orange-600 mr-2" /> UI/UX 설계 최종 확정</h2></div><div className="p-8 space-y-8"><div className="pt-6 border-t border-gray-100"><div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6"><p className="text-orange-800 text-sm font-medium flex items-start"><AlertTriangle size={16} className="mr-2 mt-0.5 shrink-0" /><span>"UI 목업 (S)" 탭에서 전체 10개 화면 디자인을 확인해 주십시오. 이상이 없다면 아래 버튼을 눌러 설계를 확정하고 Phase 3 개발 단계로 넘어갑니다.</span></p></div><div className="flex justify-end space-x-3"><button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">추가 수정 요청</button><button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-lg flex items-center transition-transform transform hover:-translate-y-0.5"><CheckCircle2 className="mr-2" size={18} /> 설계 확정 및 개발 착수 (Phase 3)</button></div></div></div></div></div>)}
              {currentTab === 'mockups' && (<div className="flex-1 flex flex-col bg-slate-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2"><span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">Draft</span><h3 className="text-lg font-bold text-gray-800">{slides[currentSlide].title}</h3></div>
                  <div className="flex items-center space-x-4">
                    <button onClick={downloadMockupImage} disabled={isDownloading} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50">
                      {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      <span>{isDownloading ? '생성 중...' : '이미지 저장'}</span>
                    </button>
                    <div className="flex space-x-2">
                      <button onClick={prevSlide} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 border border-gray-200"><ChevronLeft size={20}/></button>
                      <div className="flex space-x-1 items-center px-2">{slides.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-orange-500 w-4' : 'bg-gray-300'} transition-all`}></div>))}</div>
                      <button onClick={nextSlide} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 border border-gray-200"><ChevronRight size={20}/></button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden flex flex-col">
                  <div className="h-8 bg-slate-800 flex items-center px-4 space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div ref={mockupViewportRef} id="mockup-viewport" className="flex-1 relative overflow-auto bg-slate-50">{slides[currentSlide].component}</div>
                </div>
              </div>)}
              {currentTab === 'features' && (<div className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">기능 정의서</h3><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">기능명</th><th className="px-4 py-3">상세 설명</th><th className="px-4 py-3">권한</th><th className="px-4 py-3">우선순위</th></tr></thead><tbody className="divide-y divide-gray-100">{featuresData.map((feature) => (<tr key={feature.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs text-orange-600 font-bold">{feature.id}</td><td className="px-4 py-3 font-bold text-gray-800">{feature.name}</td><td className="px-4 py-3 text-gray-600">{feature.desc}</td><td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{feature.auth}</span></td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${feature.priority === '높음' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{feature.priority}</span></td></tr>))}</tbody></table></div></div>)}
              {currentTab === 'review' && (<div className="p-6"><div className="space-y-4">{inquiriesData.map((item) => (<div key={item.id} className="border border-green-100 bg-white rounded-lg p-5 shadow-sm transition-colors hover:border-orange-200"><div className="flex items-center justify-between mb-3"><span className={`text-xs font-bold px-2 py-1 rounded ${item.category === 'Logic' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{item.category}</span><span className="flex items-center space-x-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200"><Check size={12} /><span>확정됨</span></span></div><h4 className="text-base font-medium text-gray-500 mb-2">{item.question}</h4><div className="flex items-start space-x-3 bg-slate-50 border border-slate-200 p-4 rounded-lg"><MessageSquare className="text-slate-400 mt-1 shrink-0" size={18} /><div><span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">최종 결정 사항</span><p className="text-gray-900 font-semibold">{item.answer}</p></div></div></div>))}</div></div>)}
              {currentTab === 'screens' && (
                <div className="p-6">
                  {/* Confirmed Banner */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex justify-between items-center animate-fadeIn">
                    <div className="flex items-center text-green-800">
                      <Lock size={18} className="mr-2" />
                      <div>
                        <span className="font-bold text-sm">화면 목록이 확정되었습니다.</span>
                        <p className="text-xs text-green-600 mt-0.5">총 {screensData.length}개 화면에 대한 기획 및 디자인 설계가 완료되었습니다.</p>
                      </div>
                    </div>
                    <span className="bg-white text-green-700 text-xs font-bold px-3 py-1 rounded border border-green-200 shadow-sm">Phase 2 Completed</span>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">화면 목록 정의 (Screen List)</h3>
                    <div className="flex items-center space-x-2"><span className="text-sm text-gray-500">권한별 보기:</span><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="border border-gray-300 rounded-md text-sm p-1.5 outline-none focus:ring-2 focus:ring-orange-500"><option value="ALL">전체 권한</option><option value="P001">P001 최고 관리자</option><option value="P002">P002 부서장</option><option value="P003">P003 일반 직원</option></select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredScreens.map((screen) => (
                      <div key={screen.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white flex flex-col group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-full -mr-8 -mt-8"></div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded font-mono">{screen.id}</span>
                          <CheckCircle2 size={16} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-1">{screen.name}</h4>
                        <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{screen.desc}</p>
                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                           <span>Access: {screen.roleAccess.length} roles</span>
                           <span className="font-medium text-slate-500">Confirmed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentTab === 'styles' && <StyleGuide />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
