'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function getDashboardStats() {
    const session = await auth()
    if (!session?.user?.email) return null

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            inboxes: {
                include: {
                    _count: {
                        select: { emails: true }
                    }
                }
            }
        }
    })

    if (!user) return null

    // Aggregate stats
    const totalInboxes = user.inboxes.length
    const activeInboxes = user.inboxes.filter(i => i.status === 'active').length

    // Total emails across all inboxes (approximate via _count or fetch?)
    // _count on include is efficient.
    const totalEmails = user.inboxes.reduce((acc, inbox) => acc + inbox._count.emails, 0)

    // Unread Count
    // Need to query emails where isRead = false and inboxId IN user.inboxIds
    // This is better done with a separate query to be efficient
    const inboxIds = user.inboxes.map(i => i.id)

    const unreadCount = await prisma.email.count({
        where: {
            inboxId: { in: inboxIds },
            isRead: false
        }
    })

    // Recent Emails (Activity)
    const recentEmails = await prisma.email.findMany({
        where: {
            inboxId: { in: inboxIds }
        },
        orderBy: { receivedAt: 'desc' },
        take: 5,
        include: {
            inbox: {
                select: { name: true, inboxId: true, mailDomain: true }
            }
        }
    })

    // Volume Chart Data (Last 7 days)
    // We'll fetch last 7 days emails timestamps and group in JS to avoid complex Raw SQL for now
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentVolumes = await prisma.email.findMany({
        where: {
            inboxId: { in: inboxIds },
            receivedAt: { gte: sevenDaysAgo }
        },
        select: { receivedAt: true }
    })

    // Group by day
    const volumeMap = new Map<string, number>()
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // e.g. "Feb 15"
        volumeMap.set(key, 0)
    }

    recentVolumes.forEach(e => {
        const key = new Date(e.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (volumeMap.has(key)) {
            volumeMap.set(key, (volumeMap.get(key) || 0) + 1)
        }
    })

    const volumeData = Array.from(volumeMap.entries()).map(([name, value]) => ({ name, value }))

    return {
        totalInboxes,
        activeInboxes,
        totalEmails,
        unreadCount,
        recentEmails,
        volumeData
    }
}
