import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import InboxList from "./InboxList";

export default async function InboxesPage() {
    const session = await auth();
    if (!session?.user?.email) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Authentication required. Please login.
                </div>
            </div>
        );
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            inboxes: {
                where: { status: 'active' },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) return <div>User not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Inboxes</h1>
                <p className="text-gray-500 mt-1">Create and manage your virtual email servers.</p>
            </div>

            <InboxList inboxes={user.inboxes} mailDomain={process.env.MAIL_DOMAIN || 'mailassert.com'} />
        </div>
    );
}
