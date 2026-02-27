'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            setStatus('error')
            setMessage('Invalid verification link')
            return
        }

        // Verify the email
        fetch('/api/v1/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success')
                    setMessage('Email verified successfully! Redirecting to login...')
                    setTimeout(() => router.push('/login'), 3000)
                } else {
                    setStatus('error')
                    setMessage(data.error || 'Verification failed')
                }
            })
            .catch(() => {
                setStatus('error')
                setMessage('Something went wrong. Please try again.')
            })
    }, [searchParams, router])

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* Logo */}
                    <a href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                        <div className="w-12 h-12 rounded-xl primary-gradient-bg flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">MailAssert</span>
                    </a>

                    {/* Status Content */}
                    <div className="text-center space-y-4">
                        {status === 'loading' && (
                            <>
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
                                <p className="text-gray-500">Please wait while we verify your email address.</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                                <p className="text-gray-500">{message}</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                                <p className="text-gray-500">{message}</p>
                                <a href="/login" className="inline-block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium">
                                    Go to Login
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

import { Suspense } from 'react'

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
