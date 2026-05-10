
import { type Inbox } from '@prisma/client';

const CONFIG = {
    CLOUDFLARE: {
        GLOBAL_API_KEY: process.env.CLOUDFLARE_GLOBAL_API_TOKEN,
        EMAIL: process.env.CLOUDFLARE_EMAIL,
        ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
        ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    },
    MAIL_DOMAIN: process.env.MAIL_DOMAIN || 'mailassert.com'
};

const DNS_RECORDS = [
    { type: 'MX', content: 'route1.mx.cloudflare.net', priority: 55 },
    { type: 'MX', content: 'route2.mx.cloudflare.net', priority: 25 },
    { type: 'MX', content: 'route3.mx.cloudflare.net', priority: 90 },
    { type: 'TXT', content: 'v=spf1 include:_spf.mx.cloudflare.net ~all' }
];

async function cfRequest(endpoint: string, method: string = 'GET', body: any = null) {
    if (!CONFIG.CLOUDFLARE.GLOBAL_API_KEY || !CONFIG.CLOUDFLARE.EMAIL || !CONFIG.CLOUDFLARE.ZONE_ID) {
        throw new Error('Missing Cloudflare configuration');
    }

    const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.CLOUDFLARE.ZONE_ID}${endpoint}`;

    const options: RequestInit = {
        method,
        headers: {
            'X-Auth-Key': CONFIG.CLOUDFLARE.GLOBAL_API_KEY,
            'X-Auth-Email': CONFIG.CLOUDFLARE.EMAIL,
            'Content-Type': 'application/json',
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors || data)}`);
    }

    return data.result;
}

export async function createInboxResources(inboxId: string, destinationEmail: string) {
    const routingDomain = `${inboxId}-${CONFIG.MAIL_DOMAIN}`;

    console.log(`Creating resources for inbox: ${inboxId} (${routingDomain})`);

    // 1. Create DNS Records
    const createdDnsRecords = [];
    try {
        for (const record of DNS_RECORDS) {
            const body: any = {
                type: record.type,
                name: routingDomain,
                content: record.content,
                ttl: 60, // 1 minute
                proxied: false
            };
            if (record.priority) body.priority = record.priority;

            const result = await cfRequest('/dns_records', 'POST', body);
            createdDnsRecords.push(result.id);
        }
    } catch (error) {
        console.error('Failed to create DNS records, cleaning up:', error);
        await cleanupDnsRecords(routingDomain); // Try to cleanup by domain if possible or IDs
        throw error;
    }

    // 2. Create Email Routing Rule
    try {
        const body = {
            matchers: [{ type: 'literal', field: 'to', value: `*@${routingDomain}` }],
            actions: [{ type: 'forward', value: [destinationEmail] }],
            enabled: true,
            name: `Route for ${inboxId}`,
            priority: 0
        };

        const result = await cfRequest('/email/routing/rules', 'POST', body);
        return {
            dnsRecords: createdDnsRecords,
            routingRule: result.id,
            routingDomain
        };
    } catch (error) {
        console.error('Failed to create routing rule, cleaning up DNS:', error);
        // Cleanup DNS records
        for (const id of createdDnsRecords) {
            await cfRequest(`/dns_records/${id}`, 'DELETE').catch(() => { });
        }
        throw error;
    }
}

export async function removeInboxResources(inboxId: string) {
    const routingDomain = `${inboxId}-${CONFIG.MAIL_DOMAIN}`;
    console.log(`Removing resources for inbox: ${inboxId}`);

    // 1. Find and Delete Routing Rule
    try {
        // List rules to find the one for this inbox
        // Cloudflare doesn't let us filter strictly by name easily in list, but we can search or iterate
        // For simplicity, we might store the rule ID in DB, or search by matcher

        // Better approach: list rules and find the one matching the domain
        const rules = await cfRequest('/email/routing/rules');
        const rule = rules.find((r: any) => r.matchers.some((m: any) => m.value === `*@${routingDomain}`));

        if (rule) {
            await cfRequest(`/email/routing/rules/${rule.id}`, 'DELETE');
            console.log(`Deleted routing rule: ${rule.id}`);
        }
    } catch (error) {
        console.error('Error removing routing rule:', error);
    }

    // 2. Find and Delete DNS Records
    await cleanupDnsRecords(routingDomain);
}

async function cleanupDnsRecords(domainName: string) {
    try {
        // List DNS records for the domain
        const records = await cfRequest(`/dns_records?name=${domainName}`);

        for (const record of records) {
            await cfRequest(`/dns_records/${record.id}`, 'DELETE');
            console.log(`Deleted DNS record: ${record.id}`);
        }
    } catch (error) {
        console.error('Error cleaning up DNS records:', error);
    }
}
