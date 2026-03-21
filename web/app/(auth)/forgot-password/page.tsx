'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        try {
            const res = await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (data.success) {
                setStatus('success')
                setMessage('If an account exists with this email, you will receive a password reset link shortly.')
            } else {
                setStatus('error')
                setMessage(data.error || 'Something went wrong')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Failed to send reset email. Please try again.')
        }
    }

    return (
        <div className="h-screen w-full flex overflow-hidden font-sans bg-white">
            {/* Left Panel: Forgot Password Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MailAssert Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-purple-500/20 object-cover" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">MailAssert</span>
                    </a>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password?</h1>
                        <p className="text-gray-500">No worries, we'll send you reset instructions.</p>
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
                                    <h3 className="font-semibold text-green-900">Check your email</h3>
                                    <p className="text-sm text-green-700">{message}</p>
                                </div>
                            </div>
                            <a href="/login" className="block text-center text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                ← Back to Login
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="text-red-500 text-sm font-medium">{message}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 primary-gradient-bg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? 'Sending...' : 'Reset Password'}
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
                        <h2 className="text-3xl font-bold text-white leading-tight">Secure Account Recovery</h2>
                        <p className="text-indigo-200 text-lg leading-relaxed">
                            We'll send you a secure link to reset your password. The link expires in 1 hour for your security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
