'use client'

import { useActionState, useState } from "react"
import { updateNotificationSettings, createInbox, updateInbox, deleteInbox } from "@/app/actions/settings"

const PLAN_LIMITS = {
    free: { inboxes: 3, name: "Starter (Free)" },
    pro: { inboxes: 5, name: "Pro" },
    enterprise: { inboxes: Infinity, name: "Enterprise" }
} as const

interface NotificationToggleProps {
    name: string
    label: string
    description: string
    defaultChecked: boolean
    icon: React.ReactNode
    color: string
}

function NotificationToggle({ name, label, description, defaultChecked, icon, color }: NotificationToggleProps) {
    return (
        <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
            <div className="flex gap-4 flex-1">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <label htmlFor={name} className="text-sm font-semibold text-gray-900 cursor-pointer block">
                        {label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                    type="checkbox"
                    name={name}
                    id={name}
                    defaultChecked={defaultChecked}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
            </label>
        </div>
    )
}

export default function SettingsForm({ user, mailDomain }: { user: any, mailDomain: string }) {
    const [notifState, notifAction, isNotifPending] = useActionState(updateNotificationSettings, undefined)
    const [createState, createAction, isCreatePending] = useActionState(createInbox, undefined)
    const [editingInbox, setEditingInbox] = useState<number | null>(null)

    const planLimit = PLAN_LIMITS[user?.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free

    const activeInboxes = user?.inboxes?.filter((i: any) => i.status === 'active') || []
    const deletedInboxes = user?.inboxes?.filter((i: any) => i.status === 'removed') || []

    const canAddMore = activeInboxes.length < planLimit.inboxes

    return (
        <div className="grid gap-8">
            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
                            <p className="text-sm text-blue-100 mt-1">Control when and how you receive email notifications</p>
                        </div>
                    </div>
                </div>

                <form action={notifAction} className="p-6">
                    <div className="space-y-1">
                        {/* Master Toggle */}
                        <NotificationToggle
                            name="notificationEnabled"
                            label="Enable All Notifications"
                            description="Master switch for all email notifications. Disable to stop receiving any emails."
                            defaultChecked={user?.notificationEnabled ?? true}
                            color="bg-gradient-to-br from-blue-500 to-blue-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            }
                        />

                        {/* Security Notifications */}
                        <NotificationToggle
                            name="notifyOnLogin"
                            label="Login Notifications"
                            description="Get notified each time you log in to your account from any device."
                            defaultChecked={user?.notifyOnLogin ?? false}
                            color="bg-gradient-to-br from-red-500 to-red-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        <NotificationToggle
                            name="notifyOnPasswordChange"
                            label="Password Change Alerts"
                            description="Receive immediate notification when your password is changed."
                            defaultChecked={user?.notifyOnPasswordChange ?? true}
                            color="bg-gradient-to-br from-orange-500 to-orange-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            }
                        />

                        {/* Email Activity */}
                        <NotificationToggle
                            name="notifyOnNewEmail"
                            label="New Email Alerts"
                            description="Get notified when a new email arrives in any of your inboxes."
                            defaultChecked={user?.notifyOnNewEmail ?? true}
                            color="bg-gradient-to-br from-green-500 to-green-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                        />

                        {/* Inbox Management */}
                        <NotificationToggle
                            name="notifyOnInboxCreated"
                            label="Inbox Creation Confirmations"
                            description="Receive confirmation when you create a new inbox."
                            defaultChecked={user?.notifyOnInboxCreated ?? true}
                            color="bg-gradient-to-br from-purple-500 to-purple-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        />

                        <NotificationToggle
                            name="notifyOnInboxDeleted"
                            label="Inbox Deletion Alerts"
                            description="Get notified when an inbox is deleted from your account."
                            defaultChecked={user?.notifyOnInboxDeleted ?? true}
                            color="bg-gradient-to-br from-pink-500 to-pink-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            }
                        />

                        {/* API & Development */}
                        <NotificationToggle
                            name="notifyOnApiKeyCreated"
                            label="API Key Activity"
                            description="Receive alerts when new API keys are created or revoked."
                            defaultChecked={user?.notifyOnApiKeyCreated ?? true}
                            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            }
                        />

                        {/* Summary Reports */}
                        <NotificationToggle
                            name="notifyWeeklySummary"
                            label="Weekly Summary Reports"
                            description="Receive a weekly digest of your account activity and email statistics."
                            defaultChecked={user?.notifyWeeklySummary ?? true}
                            color="bg-gradient-to-br from-teal-500 to-teal-600"
                            icon={
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                        />
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
                        <div className="text-sm">
                            {notifState?.success && <span className="text-green-600 font-medium flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {notifState.success}
                            </span>}
                            {notifState?.error && <span className="text-red-600 font-medium flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {notifState.error}
                            </span>}
                        </div>
                        <button
                            type="submit"
                            disabled={isNotifPending}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                        >
                            {isNotifPending ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Preferences
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Inbox Management */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Inbox Management</h2>
                                <p className="text-sm text-purple-100 mt-1">
                                    {activeInboxes.length} of {planLimit.inboxes === Infinity ? '∞' : planLimit.inboxes} inboxes • {planLimit.name}
                                </p>
                            </div>
                        </div>
                        {user?.plan === 'free' && (
                            <a
                                href="/#pricing"
                                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all text-sm font-semibold shadow-lg"
                            >
                                Upgrade Plan
                            </a>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {/* Active Inboxes */}
                    <div className="space-y-4 mb-6">
                        {activeInboxes.map((inbox: any) => (
                            <InboxCard
                                key={inbox.id}
                                inbox={inbox}
                                mailDomain={mailDomain}
                                isEditing={editingInbox === inbox.id}
                                onEdit={() => setEditingInbox(inbox.id)}
                                onCancelEdit={() => setEditingInbox(null)}
                            />
                        ))}
                    </div>

                    {/* Add New Inbox */}
                    {canAddMore && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors">
                            <form action={createAction} className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Add New Inbox</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="inboxId" className="block text-sm font-medium text-gray-700 mb-2">
                                            Inbox ID <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex rounded-lg shadow-sm">
                                            <input
                                                type="text"
                                                name="inboxId"
                                                id="inboxId"
                                                required
                                                minLength={3}
                                                maxLength={30}
                                                pattern="[a-z0-9-]+"
                                                className="flex-1 px-4 py-2.5 rounded-l-lg border border-r-0 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono lowercase"
                                                placeholder="my-inbox"
                                            />
                                            <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-mono">
                                                -{mailDomain}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
                                    </div>

                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                            placeholder="My Inbox"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Optional friendly name</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <div className="text-sm">
                                        {createState?.success && <span className="text-green-600 font-medium">{createState.success}</span>}
                                        {createState?.error && <span className="text-red-600 font-medium">{createState.error}</span>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isCreatePending}
                                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 text-sm font-semibold shadow-lg active:scale-95"
                                    >
                                        {isCreatePending ? 'Creating...' : 'Create Inbox'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {!canAddMore && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Inbox Limit Reached</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    You've reached the maximum number of inboxes for your {planLimit.name} plan.
                                    <a href="/#pricing" className="font-semibold underline ml-1">Upgrade to add more</a>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Deleted Inboxes */}
                    {deletedInboxes.length > 0 && (
                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Deleted Inboxes</h3>
                            <div className="space-y-4 opacity-75">
                                {deletedInboxes.map((inbox: any) => (
                                    <InboxCard
                                        key={inbox.id}
                                        inbox={inbox}
                                        mailDomain={mailDomain}
                                        isEditing={false} // Cannot edit deleted inboxes
                                        onEdit={() => { }}
                                        onCancelEdit={() => { }}
                                        isDeleted={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function InboxCard({ inbox, mailDomain, isEditing, onEdit, onCancelEdit, isDeleted }: any) {
    const [deleteState, deleteAction, isDeletePending] = useActionState(deleteInbox, undefined)
    const [updateState, updateAction, isUpdatePending] = useActionState(updateInbox, undefined)

    if (isEditing) {
        return (
            <form action={updateAction} className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <input type="hidden" name="inboxDbId" value={inbox.id} />
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inbox ID</label>
                        <div className="flex rounded-lg shadow-sm">
                            <input
                                type="text"
                                name="inboxId"
                                defaultValue={inbox.inboxId}
                                required
                                minLength={3}
                                maxLength={30}
                                pattern="[a-z0-9-]+"
                                className="flex-1 px-4 py-2 rounded-l-lg border border-r-0 border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm font-mono lowercase"
                            />
                            <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-mono">
                                -{mailDomain}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={inbox.name}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        {updateState?.success && <span className="text-green-600 font-medium">{updateState.success}</span>}
                        {updateState?.error && <span className="text-red-600 font-medium">{updateState.error}</span>}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdatePending}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 text-sm font-medium"
                        >
                            {isUpdatePending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        )
    }

    return (
        <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${!isDeleted ? 'hover:border-purple-300 transition-colors' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${inbox.status === 'removed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{inbox.name || 'Unnamed Inbox'}</h4>
                        <span className={`px-2 py-0.5 pointer-events-none text-xs font-medium rounded ${inbox.status === 'active' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                            {inbox.status === 'active' ? 'Active' : 'Deleted'}
                        </span>
                    </div>
                    <p className="text-sm font-mono text-gray-600">*@{inbox.inboxId}-{mailDomain}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {inbox.status === 'removed' ? `Deleted on ${new Date(inbox.removedAt).toLocaleDateString()}` : `Created ${new Date(inbox.createdAt).toLocaleDateString()}`}
                    </p>
                </div>
                {!isDeleted && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onEdit}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit inbox"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <form action={deleteAction}>
                            <input type="hidden" name="inboxDbId" value={inbox.id} />
                            <button
                                type="submit"
                                disabled={isDeletePending}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete inbox"
                                onClick={(e) => {
                                    if (!confirm(`Are you sure you want to delete "${inbox.name || inbox.inboxId}"? This action cannot be undone.`)) {
                                        e.preventDefault()
                                    }
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}
            </div>
            {deleteState?.error && (
                <p className="text-sm text-red-600 mt-2">{deleteState.error}</p>
            )}
        </div>
    )
}
