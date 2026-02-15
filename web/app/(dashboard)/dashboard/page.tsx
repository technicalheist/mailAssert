import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from 'next/link'

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { inboxes: true }
    })

    // Fallback if no inboxes (new user might not have one if registration somehow failed, or manual deletion)
    const inboxId = user?.inboxes?.[0]?.inboxId || 'setup-required'
    const fullInboxAddress = `*@${inboxId}.${process.env.MAIL_DOMAIN || 'mailassert.com'}`

    return (
        <div>
            {/* Greeting */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.email?.split('@')[0]}</h1>
                <p className="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Card 1: Email Testing */}
                <div className="secondary-gradient-bg rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Email testing</h3>
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                            <p className="text-indigo-200 text-sm mb-4">Send your emails to this address to test them.</p>

                            {/* Server ID Box */}
                            <div className="bg-gray-900/50 border border-indigo-500/30 rounded-lg p-3 mb-4 relative group-hover:border-blue-500/50 transition-colors">
                                <div className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Inbox Address</div>
                                <div className="font-mono text-sm text-white truncate">{fullInboxAddress}</div>
                                <div className="absolute inset-y-0 left-0 w-1 primary-gradient-bg rounded-l-lg"></div>
                            </div>
                        </div>

                        <Link href="/inbox" className="inline-flex items-center text-sm font-medium primary-gradient-text hover:opacity-80 transition-opacity">
                            Go to inbox
                            <svg className="w-4 h-4 ml-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                    </div>
                </div>

                {/* Card 2: Profile */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg border border-gray-800 bg-[linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_100%)]">
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Your profile</h3>
                            <p className="text-gray-400 text-sm mb-6">Complete your profile to unlock full features.</p>

                            <div className="mb-2 flex justify-between text-xs">
                                <span className="text-gray-400">Completion</span>
                                <span className="text-white font-medium">65%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                                <div className="primary-gradient-bg h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: New Feature */}
                <div className="primary-gradient-bg rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="inline-block px-2 py-1 bg-white/20 rounded text-xs font-bold mb-3 backdrop-blur-sm border border-white/20">NEW FEATURE</div>
                            <h3 className="font-bold text-xl mb-2">Discover Rules</h3>
                            <p className="text-blue-100 text-sm mb-4">Automate your workflow with powerful new rule sets.</p>
                        </div>
                        <button className="w-full py-2.5 rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-lg">Try it now</button>
                    </div>
                </div>
            </div>

            {/* Guides Section can be added here similarly */}
        </div>
    )
}
