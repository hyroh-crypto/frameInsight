
import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Briefcase, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Save } from 'lucide-react';

export const MockupProfile = () => {
    const [showToast, setShowToast] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [showPassword, setShowPassword] = useState(false);

    // Mock User Data
    const user = {
        name: "김철수",
        email: "chulsu.kim@frameout.co.kr",
        dept: "DX 사업본부",
        rank: "수석",
        id: "EMP-2020-045",
        type: "정규직"
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setPasswords({ current: "", new: "", confirm: "" });
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fadeIn font-sans">
            {/* Toast Notification */}
            {showToast && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-slate-700 animate-bounceIn">
                    <CheckCircle className="text-green-400" size={24} />
                    <span className="font-bold text-lg">비밀번호가 안전하게 변경되었습니다.</span>
                </div>
            )}

            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <ShieldCheck size={20} className="text-orange-500" />
                    <h2 className="text-lg font-bold text-slate-800">내 정보 및 보안 관리</h2>
                </div>
            </div>

            <div className="flex-1 p-8 flex justify-center overflow-y-auto">
                <div className="w-full max-w-2xl space-y-6">
                    
                    {/* User Profile Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="h-24 bg-slate-900 relative">
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-24 h-24 rounded-2xl bg-orange-500 border-4 border-white shadow-lg flex items-center justify-center text-white font-black text-3xl">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <div className="pt-12 pb-8 px-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900">{user.name} <span className="text-sm font-bold text-slate-400 ml-2">{user.id}</span></h1>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">{user.type}</span>
                                        <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">{user.dept}</span>
                                        <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">{user.rank}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Section (ReadOnly) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center space-x-2 mb-6 border-l-4 border-slate-900 pl-3">
                            <User size={16} className="text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">기본 인적 사항 (Read-Only)</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 flex items-center uppercase"><Mail size={12} className="mr-1"/> 이메일 주소</label>
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm font-bold text-slate-500">
                                    {user.email}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 flex items-center uppercase"><Briefcase size={12} className="mr-1"/> 소속 부서</label>
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm font-bold text-slate-500">
                                    {user.dept} ({user.rank})
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start space-x-3">
                            <AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-orange-800 font-bold leading-relaxed">
                                인적 사항 변경은 관리자(HR) 부서에 별도로 요청해 주시기 바랍니다.<br/>
                                보안 준수 사항에 따라 급여 및 계약 정보는 본 화면에 노출되지 않습니다.
                            </p>
                        </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center space-x-2 mb-6 border-l-4 border-orange-500 pl-3">
                            <Lock size={16} className="text-orange-500" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">계정 비밀번호 변경 (Security)</h3>
                        </div>
                        <form onSubmit={handlePasswordChange} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500">현재 비밀번호 (Current Password)</label>
                                <div className="relative group">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-mono"
                                        placeholder="••••••••"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                                    >
                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500">새 비밀번호 (New Password)</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 px-4 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-mono"
                                        placeholder="신규 비밀번호 입력"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500">비밀번호 확인 (Confirm)</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 px-4 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-mono"
                                        placeholder="한번 더 입력"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2"
                                >
                                    <Save size={18} />
                                    <span>비밀번호 변경 사항 저장</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="text-center pb-8">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Privacy Policy • Security Center • FrameInsight Support
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};
