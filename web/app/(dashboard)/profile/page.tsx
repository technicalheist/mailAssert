import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { inboxes: true }
    })

    if (!user) redirect("/login")

    const mailDomain = process.env.MAIL_DOMAIN || 'mailassert.com'

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.name || 'Your Profile'}</h1>
                    <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
                </div>
            </div>

            <ProfileForm user={user} mailDomain={mailDomain} />
        </div>
    )
}
