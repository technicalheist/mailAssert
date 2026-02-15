
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import prisma from '@/lib/prisma';

const CONFIG = {
    IMAP: {
        user: process.env.IMAP_USERNAME!,
        password: process.env.IMAP_PASSWORD!,
        host: process.env.IMAP_SERVER!,
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 3000
    }
};

export async function syncEmails() {
    console.log('Starting IMAP sync...');

    // 1. Get the last synced UID globally (or start from 1)
    // We assume all emails go to the same catch-all inbox, so UIDs are sequential for that folder.
    const lastEmail = await prisma.email.findFirst({
        orderBy: { imapUid: 'desc' },
        select: { imapUid: true }
    });

    const lastUid = lastEmail?.imapUid || 0;
    console.log(`Last synced UID: ${lastUid}`);

    let connection;

    try {
        connection = await imaps.connect({ imap: CONFIG.IMAP });
        await connection.openBox('INBOX');

        // 2. Fetch messages with UID > lastUid
        // imap-simple search criteria: [['UID', '23:*']] -> returns 23 and higher.
        // We want > lastUid. So we search (lastUid + 1):*

        const searchCriteria = [['UID', `${lastUid + 1}:*`]];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            struct: true,
            markSeen: false
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        console.log(`Found ${messages.length} new messages.`);

        for (const item of messages) {
            const uid = item.attributes.uid;

            // Double check UID > lastUid to be safe
            if (uid <= lastUid) continue;

            const allParts = item.parts;
            const headerPart = allParts.find(p => p.which === 'HEADER');
            const textPart = allParts.find(p => p.which === 'TEXT');
            const bodyPart = allParts.find(p => p.which === ''); // Empty string usually means full body? Or we use simpleParser on the source.

            // With mailparser, it's easier to fetch the whole source and parse it.
            // But fetching full body for all messages might be heavy.
            // imap-simple 'bodies': [''] fetches the whole raw message.
            const rawBodyFn = item.parts.find(p => p.which === '');
            if (!rawBodyFn) continue;

            const rawBody = rawBodyFn.body;

            const parsed = await simpleParser(rawBody);

            // 3. Extract To Address and Find Inbox
            // parsed.to can be an array or object.
            const toAddress = Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to?.text;

            if (!toAddress) {
                console.log(`Skipping message ${uid}: No To address`);
                continue;
            }

            // Parse Inbox ID from To Address: <any>@<inboxId>-<domain>
            // Example: hello@abcdef-mytest.mailassert.com
            // We need to extract 'abcdef' from 'abcdef-mytest.mailassert.com'
            // Or simpler: We just match the `toAddress` against our Inboxes? 
            // But the `any` part is variable.
            // We know the format: something@<inboxId>-<MAIL_DOMAIN>

            // Extract domain part
            const domainPart = toAddress.split('@')[1]; // abcdef-mytest.mailassert.com
            if (!domainPart) continue;

            // We assume the inboxId is the prefix before the mail domain
            // But mail domain might have hyphens too?
            // Best to store the full `mailDomain` in Inbox table and match partial?
            // Or we just query the DB for an inbox where `hostname` matches?

            // Let's assume the user's Inbox model has `inboxId`.
            // And we generated the domain as `${inboxId}-${CONFIG.MAIL_DOMAIN}`.

            // So if MAIL_DOMAIN is "mailassert.com" and domainPart is "user1-mailassert.com",
            // then inboxId is "user1".

            const mailDomain = process.env.MAIL_DOMAIN || 'mailassert.com';
            // Check if domainPart ends with mailDomain
            if (!domainPart.endsWith(mailDomain)) {
                console.log(`Skipping message ${uid}: Domain mismatch (${domainPart})`);
                continue;
            }

            // Extract inboxId. 
            // domainPart = <inboxId>-<mailDomain>
            // valid if domainPart.length > mailDomain.length + 1

            const prefixWithHyphen = domainPart.slice(0, -(mailDomain.length + 1)); // "user1"
            // wait, if domainPart is "user1-mailassert.com", mailDomain is "mailassert.com"
            // length of "mailassert.com" is 14.
            // "user1-mailassert.com" is 20.
            // slice(0, -15) -> "user1".

            const inboxId = prefixWithHyphen;

            if (!inboxId) {
                console.log(`Skipping message ${uid}: Could not parse inboxId`);
                continue;
            }

            // 4. Find Inbox in DB
            const inbox = await prisma.inbox.findUnique({
                where: { inboxId: inboxId }
            });

            if (!inbox) {
                console.log(`Skipping message ${uid}: Inbox not found for id ${inboxId}`);
                continue;
            }

            // 5. Store Email
            try {
                await prisma.email.create({
                    data: {
                        inboxId: inbox.id,
                        messageId: parsed.messageId || `uid-${uid}`,
                        fromAddress: parsed.from?.text || '',
                        toAddress: toAddress as string, // Cast to string as we checked it exists
                        subject: parsed.subject || '',
                        bodyText: parsed.text,
                        bodyHtml: parsed.html as string,
                        headers: parsed.headers ? JSON.parse(JSON.stringify(Object.fromEntries(parsed.headers))) : {}, // Fix Json type
                        imapUid: uid,
                        receivedAt: parsed.date || new Date()
                    }
                });
                console.log(`Stored message ${uid} for inbox ${inboxId}`);
            } catch (e) {
                // Check if unique constraint failed (P2002)
                if ((e as any).code === 'P2002') {
                    console.log(`Message ${uid} already exists`);
                } else {
                    console.error(`Error storing message ${uid}:`, e);
                }
            }
        }

    } catch (error) {
        console.error('IMAP Sync Error:', error);
    } finally {
        if (connection) {
            connection.end();
        }
        // No need to disconnect prisma singleton
    }
}
