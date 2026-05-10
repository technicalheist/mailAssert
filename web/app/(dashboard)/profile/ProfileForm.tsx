'use client'

import { useActionState } from "react"
import { updateProfile, resendVerificationEmail } from "@/app/actions/profile"

interface User {
    id: number
    name: string | null
    email: string
    phone: string | null
    emailVerified: Date | null
    createdAt: Date
    updatedAt: Date
    notificationEnabled: boolean
    inboxes: Array<{ inboxId: string }>
}

export default function ProfileForm({ user, mailDomain }: { user: User, mailDomain: string }) {
    const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, undefined)
    const [verifyState, verifyAction, isVerifyPending] = useActionState(resendVerificationEmail, undefined)

    const isEmailVerified = user.emailVerified !== null

    return (
        <div className="grid gap-8">
            {/* Email Verification Alert */}
            {!isEmailVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-amber-900">Email Not Verified</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Please verify your email address to access all features. Check your inbox for the verification link.
                            </p>
                            <form action={verifyAction} className="mt-3">
                                <button
                                    type="submit"
                                    disabled={isVerifyPending}
                                    className="text-sm font-medium text-amber-900 hover:text-amber-800 underline disabled:opacity-50"
                                >
                                    {isVerifyPending ? 'Sending...' : 'Resend verification email'}
                                </button>
                            </form>
                            {verifyState?.success && (
                                <p className="text-sm text-green-700 mt-2 font-medium">{verifyState.success}</p>
                            )}
                            {verifyState?.error && (
                                <p className="text-sm text-red-700 mt-2 font-medium">{verifyState.error}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your personal details and contact information.</p>
                </div>

                <form action={profileAction} className="p-6">
                    <div className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                defaultValue={user.name || ''}
                                required
                                minLength={2}
                                maxLength={100}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                defaultValue={user.phone || ''}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="+1 (555) 123-4567"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional. Used for account recovery and notifications.</p>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isEmailVerified ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm">
                            {profileState?.success && <span className="text-green-600 font-medium">{profileState.success}</span>}
                            {profileState?.error && <span className="text-red-600 font-medium">{profileState.error}</span>}
                        </div>
                        <button
                            type="submit"
                            disabled={isProfilePending}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm font-medium shadow-sm hover:shadow active:scale-95"
                        >
                            {isProfilePending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
                    <p className="text-sm text-gray-500 mt-1">Important information about your account.</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Created */}
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Account Created</p>
                                <p className="text-base font-semibold text-gray-900 mt-1">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Email Verification Status */}
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${isEmailVerified ? 'bg-green-50' : 'bg-amber-50'} flex items-center justify-center`}>
                                <svg className={`w-5 h-5 ${isEmailVerified ? 'text-green-600' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email Verification</p>
                                <p className="text-base font-semibold text-gray-900 mt-1">
                                    {isEmailVerified && user.emailVerified ? (
                                        <>
                                            Verified on {new Date(user.emailVerified).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </>
                                    ) : (
                                        <span className="text-amber-600">Not Verified</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Primary Inbox */}
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Primary Inbox</p>
                                <p className="text-base font-semibold text-gray-900 mt-1 font-mono break-all">
                                    {(() => {
                                        const primaryInbox = user.inboxes?.find((i: any) => i.status === 'active');
                                        return primaryInbox ? (
                                            `*@${primaryInbox.inboxId}-${mailDomain}`
                                        ) : (
                                            <span className="text-gray-400">Not configured</span>
                                        );
                                    })()}
                                </p>
                            </div>
                        </div>

                        {/* Last Updated */}
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                <p className="text-base font-semibold text-gray-900 mt-1">
                                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Notifications Status */}
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${user.notificationEnabled ? 'bg-green-50' : 'bg-gray-50'} flex items-center justify-center`}>
                                <svg className={`w-5 h-5 ${user.notificationEnabled ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Notifications</p>
                                <p className="text-base font-semibold text-gray-900 mt-1">
                                    {user.notificationEnabled ? (
                                        <span className="text-green-600">Enabled</span>
                                    ) : (
                                        <span className="text-gray-600">Disabled</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* User ID */}
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">User ID</p>
                                <p className="text-base font-semibold text-gray-900 mt-1 font-mono">
                                    #{user.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
