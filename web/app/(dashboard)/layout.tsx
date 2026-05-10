import { auth } from "@/auth"
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'

import prisma from "@/lib/prisma"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    let usage = 0;
    const limit = 1000; // Default Free Tier

    if (session?.user?.email) {
        // Optimized: Only fetch inbox IDs to count usage
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { inboxes: { select: { id: true } } }
        });

        if (user?.inboxes?.length) {
            const inboxIds = user.inboxes.map(i => i.id);
            usage = await prisma.email.count({
                where: { inboxId: { in: inboxIds } }
            });
        }
    }

    return (
        <div className="h-screen w-full flex overflow-hidden font-sans bg-gray-50">
            <Sidebar usage={usage} limit={limit} />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader user={session?.user} />
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
