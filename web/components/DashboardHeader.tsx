'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { logout } from '@/app/actions/auth'

export default function DashboardHeader({ user }: { user?: any }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
            {/* Search */}
            <div className="flex-1 max-w-lg">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input type="text" name="search" id="search" className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200" placeholder="Search for anything..." />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">Talk To Us</a>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 border border-gray-300 overflow-hidden font-bold">
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="w-2 h-2 rounded-full primary-gradient-bg"></div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 origin-top-right z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm text-gray-500">Signed in as</p>
                                <p className="text-sm font-medium text-gray-900 truncate" title={user?.email}>{user?.name || user?.email}</p>
                            </div>

                            <div className="py-1">
                                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                    Your Profile
                                </Link>
                                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                    Settings
                                </Link>
                            </div>

                            <div className="border-t border-gray-100 py-1">
                                <button
                                    onClick={() => logout()}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
