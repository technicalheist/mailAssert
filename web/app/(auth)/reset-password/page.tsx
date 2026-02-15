'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [token, setToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const tokenParam = searchParams.get('token')
        if (tokenParam) {
            setToken(tokenParam)
        } else {
            setStatus('error')
            setMessage('Invalid reset link')
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            setStatus('error')
            setMessage('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setStatus('error')
            setMessage('Password must be at least 6 characters')
            return
        }

        setStatus('loading')

        try {
            const res = await fetch('/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            })

            const data = await res.json()

            if (data.success) {
                setStatus('success')
                setMessage('Password reset successfully! Redirecting to login...')
                setTimeout(() => router.push('/login'), 3000)
            } else {
                setStatus('error')
                setMessage(data.error || 'Failed to reset password')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Something went wrong. Please try again.')
        }
    }

    return (
        <div className="h-screen w-full flex overflow-hidden font-sans bg-white">
            {/* Left Panel: Reset Password Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl primary-gradient-bg flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">MailAssert</span>
                    </a>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reset Password</h1>
                        <p className="text-gray-500">Enter your new password below.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-900">Password Reset Successful</h3>
                                    <p className="text-sm text-green-700">{message}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="text-red-500 text-sm font-medium">{message}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !token}
                                    className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 primary-gradient-bg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>

                            <div className="text-center">
                                <a href="/login" className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    ← Back to Login
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel: Feature/Marketing */}
            <div className="hidden lg:flex lg:w-1/2 secondary-gradient-bg relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 max-w-lg w-full space-y-8">
                    <div className="text-center lg:text-left space-y-4">
                        <h2 className="text-3xl font-bold text-white leading-tight">Secure Your Account</h2>
                        <p className="text-indigo-200 text-lg leading-relaxed">
                            Choose a strong password to keep your account secure. We recommend using a mix of letters, numbers, and symbols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
