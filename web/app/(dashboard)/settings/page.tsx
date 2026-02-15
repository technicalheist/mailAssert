import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import SettingsForm from "./SettingsForm"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { inboxes: true }
    })

    if (!user) redirect("/login")

    const mailDomain = process.env.MAIL_DOMAIN || 'mailassert.com'

    const planNames = {
        free: "Starter (Free)",
        pro: "Pro",
        enterprise: "Enterprise"
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account preferences and configurations</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold shadow-lg">
                        {planNames[user.plan as keyof typeof planNames] || planNames.free}
                    </span>
                </div>
            </div>

            <SettingsForm user={user} mailDomain={mailDomain} />
        </div>
    )
}
