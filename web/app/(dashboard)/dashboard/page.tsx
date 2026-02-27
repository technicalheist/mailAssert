import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { getDashboardStats } from "@/app/actions/dashboard"
import { VolumeChart, StatCard } from "./DashboardCharts"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { name: true, plan: true }
    })

    if (!user) redirect("/login")

    const stats = await getDashboardStats()
    if (!stats) return <div>Error loading stats</div>

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {(user.name || session.user.email).split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Here's what's happening with your mail servers today.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/inboxes"
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Manage Inboxes
                    </Link>
                    <Link
                        href="/settings"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        New Inbox
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inboxes"
                    value={stats.totalInboxes}
                    sub={`${stats.activeInboxes} Active`}
                    colorClass="bg-blue-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>}
                />
                <StatCard
                    title="Total Emails"
                    value={stats.totalEmails.toLocaleString()}
                    sub="Lifetime received"
                    colorClass="bg-purple-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                />
                <StatCard
                    title="Unread Emails"
                    value={stats.unreadCount}
                    sub="In all inboxes"
                    colorClass="bg-amber-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <StatCard
                    title="Volume Today"
                    value={stats.volumeData[stats.volumeData.length - 1]?.value || 0}
                    sub="Emails received today"
                    colorClass="bg-emerald-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Email Volume</h3>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button className="px-3 py-1 bg-white text-xs font-medium text-gray-900 shadow-sm rounded-md">Last 7 Days</button>
                            {/* Placeholder for future ranges */}
                        </div>
                    </div>
                    <div className="w-full">
                        {/* We pass a client component for chart */}
                        <VolumeChart data={stats.volumeData} />
                    </div>
                </div>

                {/* Quick Activity / Recent Inboxes */}
                <div className="space-y-6">
                    {/* Upgrade Card */}
                    {user.plan === 'free' && (
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
                                <p className="text-indigo-200 text-sm mb-4">Unlock unlimited inboxes, longer retention, and priority support.</p>
                                <button className="w-full py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                    View Plans
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    )}

                    {/* Recent Activity List (Mini) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Recent Emails</h3>
                        <div className="space-y-4">
                            {stats.recentEmails.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No emails yet.</p>
                            ) : (
                                stats.recentEmails.slice(0, 3).map((email: any) => (
                                    <div key={email.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs uppercase">
                                            {email.fromAddress[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{email.subject || '(No Subject)'}</p>
                                            <p className="text-xs text-gray-500 truncate">From: {email.fromAddress}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/inboxes" className="block mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View All Activity
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Emails Table (Full Width) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Recent Inbound Activity</h3>
                    <Link href="/inbox" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Go to Inbox &rarr;</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">From</th>
                                <th className="px-6 py-3">To Inbox</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentEmails.map((email: any) => (
                                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs">{email.subject || '(No Subject)'}</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{email.fromAddress}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {email.inbox.name || email.inbox.inboxId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(email.receivedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${email.isRead ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {email.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentEmails.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No emails found. Send a test email to verify your setup.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
