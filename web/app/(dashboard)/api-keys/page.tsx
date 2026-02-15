import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApiKeyList from "./ApiKeyList";

export default async function ApiKeysPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { apiKeys: { orderBy: { createdAt: 'desc' } } }
    });

    if (!user) return <div>User not found</div>;

    // Convert keys to serializable component props
    const apiKeys = user.apiKeys.map(k => ({
        ...k,
        // Prisma dates are objects, plain props need date strings or numbers? Next 13 App Router supports dates usually if server components passed to client components.
        // But for safety let's assume they might need manual handling if passed in a way that requires serialization.
        // Actually Server Component -> Client Component props must be serializable. Date objects are not serializable in recent Next.js versions via props.
        // Wait, Next.js App Router (RSC) passes data to Client Components via serialization that supports Dates? No, JSON.stringify behavior applies usually.
        // Let's pass them as dates, if it fails I'll fix. Actually recent Next.js complains.
        // Better to be safe.
        // created_at is Date.
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API Keys</h1>
                <p className="text-gray-500 mt-1">Manage API keys for programmatic access to MailAssert.</p>
            </div>

            <ApiKeyList apiKeys={apiKeys} />
        </div>
    );
}
