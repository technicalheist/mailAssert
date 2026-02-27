'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UsageStats from './UsageStats'

export default function Sidebar({ usage = 0, limit = 500 }: { usage?: number, limit?: number }) {
    const pathname = usePathname()
    const isActive = (path: string) => pathname === path

    return (
        <aside className="w-64 flex-shrink-0 secondary-gradient-bg text-white flex flex-col transition-all duration-300 hidden md:flex h-screen sticky top-0">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg primary-gradient-bg flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">MailAssert</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                {/* Group: Inboxes */}
                <div>
                    <div className="px-3 mb-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">Inboxes</div>

                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive('/dashboard')
                            ? 'primary-gradient-bg text-white shadow-lg shadow-blue-900/20'
                            : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <svg className={`w-5 h-5 ${isActive('/dashboard') ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span className="font-medium">Home</span>
                    </Link>

                    <Link
                        href="/inbox"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mt-1 group ${isActive('/inbox')
                            ? 'primary-gradient-bg text-white shadow-lg shadow-blue-900/20'
                            : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <svg className={`w-5 h-5 ${isActive('/inbox') ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        <span className="font-medium">Inbox</span>
                    </Link>

                    <Link
                        href="/inboxes"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mt-1 group ${isActive('/inboxes')
                            ? 'primary-gradient-bg text-white shadow-lg shadow-blue-900/20'
                            : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <svg className={`w-5 h-5 ${isActive('/inboxes') ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        <span className="font-medium">Manage Inboxes</span>
                    </Link>
                </div>


            </nav>

            {/* Account Context & Utility */}
            <div className="p-4 border-t border-white/10 mt-auto bg-black/20 backdrop-blur-sm">
                <UsageStats current={usage} limit={limit} />

                <div className="mt-6 space-y-1">
                    <div className="px-1 mb-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider opacity-60">Quick Actions</div>

                    <Link href="/api-keys" className="flex items-center gap-3 px-2 py-2 rounded-lg text-indigo-200 hover:bg-white/5 hover:text-white text-xs font-medium group transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                        <span>API Keys</span>
                    </Link>

                    <Link href="/docs" className="flex items-center gap-3 px-2 py-2 rounded-lg text-indigo-200 hover:bg-white/5 hover:text-white text-xs font-medium group transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <span>Documentation</span>
                    </Link>

                    <div className="flex items-center gap-2 px-2 py-2 text-indigo-300/60 text-[10px] mt-2 border-t border-white/5 pt-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="font-medium tracking-wide">System Operational</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
