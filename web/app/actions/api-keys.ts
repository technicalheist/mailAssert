'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { nextId } from "@/lib/ids";
import { revalidatePath } from "next/cache";
import crypto from 'crypto';

export async function createApiKey(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const name = formData.get("name") as string || "New API Key";

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return { error: "User not found" };

        const key = `ma_${crypto.randomBytes(24).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').substring(0, 32)}`;

        const apiKey = await prisma.apiKey.create({
            data: {
                id: await nextId("apiKey"),
                userId: user.id,
                name,
                key,
            }
        });

        // Send notification email if enabled
        if (user.notificationEnabled && user.notifyOnApiKeyCreated) {
            const { sendEmail } = await import('@/lib/email');
            const { apiKeyCreatedNotificationTemplate } = await import('@/lib/email-templates');

            const emailHtml = apiKeyCreatedNotificationTemplate({
                userName: user.name || user.email.split('@')[0],
                keyName: name,
                createdAt: new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                }),
                keyPreview: key.substring(0, 12)
            });

            // Send email asynchronously
            sendEmail({
                to: user.email,
                subject: 'New API Key Created - MailAssert',
                html: emailHtml
            }).catch(err => console.error('Failed to send API key notification:', err));
        }

        revalidatePath("/api-keys");
        return { success: "API Key created" };
    } catch (error) {
        return { error: "Failed to create API key" };
    }
}

export async function deleteApiKey(id: number) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { apiKeys: true }
        });

        const key = user?.apiKeys.find(k => k.id === id);
        if (!key) return { error: "Not authorized" };

        await prisma.apiKey.delete({ where: { id } });

        // Send notification email if enabled
        if (user && user.notificationEnabled && user.notifyOnApiKeyCreated) {
            const { sendEmail } = await import('@/lib/email');
            const { apiKeyDeletedNotificationTemplate } = await import('@/lib/email-templates');

            const emailHtml = apiKeyDeletedNotificationTemplate({
                userName: user.name || user.email.split('@')[0],
                keyName: key.name || 'Unnamed Key',
                deletedAt: new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                })
            });

            // Send email asynchronously
            sendEmail({
                to: user.email,
                subject: 'API Key Deleted - MailAssert',
                html: emailHtml
            }).catch(err => console.error('Failed to send API key deletion notification:', err));
        }

        revalidatePath("/api-keys");
        return { success: "API Key deleted" };
    } catch (error) {
        return { error: "Failed to delete API key" };
    }
}

