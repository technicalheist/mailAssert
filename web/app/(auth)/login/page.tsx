'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authenticate } from '@/app/actions/auth'

export default function LoginPage() {
    const router = useRouter()
    const [actionResult, formAction, isPending] = useActionState(authenticate, undefined)

    // Handle redirect sentinel returned from the server action.
    // We can't use redirectTo inside signIn (server action) because it throws NEXT_REDIRECT,
    // which leaves useActionState's isPending=true forever — the infinite spinner bug.
    useEffect(() => {
        if (actionResult?.startsWith('REDIRECT:')) {
            const path = actionResult.replace('REDIRECT:', '')
            router.push(path)
        }
    }, [actionResult, router])

    const errorMessage = actionResult?.startsWith('REDIRECT:') ? undefined : actionResult
    const isRedirecting = actionResult?.startsWith('REDIRECT:')

    return (
        <div className="h-screen w-full flex overflow-hidden font-sans bg-white">
            {/* Left Panel: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MailAssert Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-purple-500/20 object-cover" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">MailAssert</span>
                    </a>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                        <p className="text-gray-500">Please enter your details to sign in.</p>
                    </div>

                    {/* Form */}
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input type="email" id="email" name="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="name@company.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <a href="/forgot-password" className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Forgot password?</a>
                            </div>
                            <input type="password" id="password" name="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white" placeholder="••••••••" required />
                        </div>

                        {errorMessage && (
                            <div className="text-red-500 text-sm font-medium">{errorMessage}</div>
                        )}

                        <button type="submit" disabled={isPending || !!isRedirecting} className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 primary-gradient-bg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isRedirecting ? 'Redirecting...' : isPending ? 'Signing in...' : 'Continue'}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?
                            <a href="/register" className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ml-1">Signup</a>
                        </p>
                    </div>
                </div>

            </div>

            {/* Right Panel: Feature/Marketing */}
            <div className="hidden lg:flex lg:w-1/2 secondary-gradient-bg relative overflow-hidden items-center justify-center p-12">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                {/* Content Container */}
                <div className="relative z-10 max-w-lg w-full space-y-12">

                    {/* Feature Showcase */}
                    <div className="glass-card rounded-2xl p-8 shadow-2xl border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Email Validation</h3>
                                <p className="text-indigo-200 text-sm">Real-time verification API</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-indigo-100">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>99.9% Delivery Rate Accuracy</span>
                            </div>
                            <div className="flex items-center gap-3 text-indigo-100">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Disposable Email Detection</span>
                            </div>
                            <div className="flex items-center gap-3 text-indigo-100">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Domain & SMTP Validation</span>
                            </div>
                        </div>
                    </div>

                    {/* Value Prop Text */}
                    <div className="text-center lg:text-left space-y-4">
                        <h2 className="text-3xl font-bold text-white leading-tight">Test emails with <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">confidence & speed</span></h2>
                        <p className="text-indigo-200 text-lg leading-relaxed">
                            Catch broken email flows before your users do. MailAssert gives you a real inbox to test against — no mail traps, no guessing.
                        </p>
                    </div>

                    {/* Feature Highlights */}
                    <div className="pt-8 border-t border-white/10 flex flex-col gap-3 opacity-90">
                        <div className="flex items-center gap-3 text-indigo-200 text-sm">
                            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Free to start — no credit card needed
                        </div>
                        <div className="flex items-center gap-3 text-indigo-200 text-sm">
                            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Real inbox, real delivery — powered by Cloudflare
                        </div>
                        <div className="flex items-center gap-3 text-indigo-200 text-sm">
                            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Simple REST API — integrate in minutes
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
