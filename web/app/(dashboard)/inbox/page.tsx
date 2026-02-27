import { checkInboxAction } from '@/app/actions'
import InboxView from '@/components/InboxView'
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function InboxPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { inboxes: true }
    })

    if (!user || user.inboxes.length === 0) {
        redirect("/inboxes")
    }

    // Fetch initial emails (defaults to first inbox), bypassing blocking sync to improve load speed
    const res = await checkInboxAction(undefined, 0, undefined, true)
    const initialEmails = res.success && res.emails ? res.emails : []

    // Get active inbox ID from response or default to first
    // Get active inbox ID from response or default to first
    const activeInboxId = (res as any).inboxId || user.inboxes[0].inboxId
    const inboxAddress = `*@${activeInboxId}-${process.env.MAIL_DOMAIN || 'mailassert.com'}`
    const inboxes = (res as any).inboxes || [];

    return (
        <InboxView
            initialEmails={initialEmails as any[]}
            inboxAddress={inboxAddress}
            initialInboxes={inboxes}
            currentInboxId={activeInboxId}
            mailDomain={process.env.MAIL_DOMAIN || 'mailassert.com'}
        />
    )
}
