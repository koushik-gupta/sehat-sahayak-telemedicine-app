
import React from 'react';
import { ChevronLeft } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, onBack }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

            {/* Navbar Minimal */}
            <nav className="w-full px-6 py-4 flex items-center justify-between z-10 relative">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-100 z-20"
                >
                    <ChevronLeft size={20} />
                    <span className="hidden sm:inline">Back to Home</span>
                </button>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-700">
                    SehatSahayak
                </div>
            </nav>

            {/* Main Card Content */}
            <div className="flex-1 flex items-center justify-center p-4 z-10">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-slate-100 overflow-hidden relative">
                    {/* Top Accent Line */}
                    <div className="h-2 w-full bg-gradient-to-r from-teal-400 to-blue-500"></div>

                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
                            {subtitle && <p className="text-slate-500">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthLayout;
