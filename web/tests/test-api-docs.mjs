const API_KEY = process.env.API_KEY || 'ma_mDKxI8zUlyBf6IFA90u4qJpX2KgX5V0f';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4090'; // Use local docker container by default

async function main() {
    console.log(`Starting API Docs integration test against: ${BASE_URL}`);
    console.log(`Using API_KEY: ${API_KEY.substring(0, 10)}... (redacted for security)`);

    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        // 1. Get List of Inbox IDs
        console.log('\n=======================================');
        console.log('[1] GET /api/inboxes/ids');
        let res = await fetch(`${BASE_URL}/api/inboxes/ids`, { headers });
        let data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (!res.ok) {
            throw new Error(`Failed to fetch inbox IDs: ${data.error || res.statusText}`);
        }

        const inboxIds = data.inboxIds || [];
        const inboxesLength = inboxIds.length;

        let firstInboxId = null;
        if (inboxesLength > 0) {
            firstInboxId = inboxIds[0];
            console.log(`Found ${inboxesLength} inboxes. Will test per-inbox API with: ${firstInboxId}`);
        } else {
            console.log('No inboxes found for this user. Skipping per-inbox tests.');
        }

        // 2. Get Emails by Inbox ID
        if (firstInboxId) {
            console.log('\n=======================================');
            console.log(`[2] GET /api/inboxes/${firstInboxId}/emails`);
            res = await fetch(`${BASE_URL}/api/inboxes/${firstInboxId}/emails`, { headers });
            data = await res.json();
            console.log(`Status: ${res.status}`);

            const stringified = JSON.stringify(data, null, 2);
            console.log('Response:', stringified.length > 500 ? stringified.substring(0, 500) + '\n...[truncated]' : stringified);

            if (!res.ok) throw new Error('Failed to fetch inbox emails');
        }

        // 3. Get All Messages
        console.log('\n=======================================');
        console.log('[3] GET /api/emails');
        res = await fetch(`${BASE_URL}/api/emails`, { headers });
        data = await res.json();
        console.log(`Status: ${res.status}`);

        let firstEmailId = null;
        if (res.ok && data.emails && data.emails.length > 0) {
            firstEmailId = data.emails[0].id;
        }

        const allMessagesStringified = JSON.stringify(data, null, 2);
        console.log('Response:', allMessagesStringified.length > 500 ? allMessagesStringified.substring(0, 500) + '\n...[truncated]' : allMessagesStringified);

        if (!res.ok) throw new Error('Failed to fetch all messages');

        // 4. Search Emails
        console.log('\n=======================================');
        console.log('[4] POST /api/emails/search');
        res = await fetch(`${BASE_URL}/api/emails/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ q: 'test' })
        });
        data = await res.json();
        console.log(`Status: ${res.status}`);

        const searchStringified = JSON.stringify(data, null, 2);
        console.log('Response:', searchStringified.length > 500 ? searchStringified.substring(0, 500) + '\n...[truncated]' : searchStringified);

        if (!res.ok) throw new Error('Failed to search emails');

        // 5. Get Email by ID
        if (firstEmailId) {
            console.log('\n=======================================');
            console.log(`[5] GET /api/emails/${firstEmailId}`);
            res = await fetch(`${BASE_URL}/api/emails/${firstEmailId}`, { headers });
            data = await res.json();
            console.log(`Status: ${res.status}`);

            const emailIdStringified = JSON.stringify(data, null, 2);
            console.log('Response:', emailIdStringified.length > 1000 ? emailIdStringified.substring(0, 1000) + '\n...[truncated]' : emailIdStringified);

            if (!res.ok) throw new Error('Failed to fetch email by ID');

            // 6. Delete Email by ID
            console.log('\n=======================================');
            console.log(`[6] DELETE /api/emails/${firstEmailId}`);
            res = await fetch(`${BASE_URL}/api/emails/${firstEmailId}`, { method: 'DELETE', headers });
            data = await res.json();
            console.log(`Status: ${res.status}`);
            console.log('Response:', JSON.stringify(data, null, 2));

            if (!res.ok) throw new Error('Failed to delete email by ID');

            // 7. Verify Deletion
            console.log('\n=======================================');
            console.log(`[7] GET /api/emails/${firstEmailId} (Verify Deletion)`);
            res = await fetch(`${BASE_URL}/api/emails/${firstEmailId}`, { headers });
            console.log(`Status: ${res.status}`);
            if (res.status === 404) {
                console.log('Verified: Email is permanently deleted and returns 404 Not Found.');
            } else {
                data = await res.json().catch(() => ({}));
                console.log('Response:', JSON.stringify(data, null, 2));
                throw new Error(`Expected 404 for deleted email, but got ${res.status}`);
            }
        } else {
            console.log('\n=======================================');
            console.log('[5] GET /api/emails/[id] - SKIPPED (No emails found in account to test detail fetch)');
        }

        console.log('\n✅ All API Integration Tests Completed Successfully!');

    } catch (e) {
        console.error('\n❌ Test Failed:', e.message);
        process.exit(1);
    }
}

main();
