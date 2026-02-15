import fetch from 'node-fetch';

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

async function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

async function testSendEmail() {
    log('Testing POST /api/v1/send...');
    const payload = {
        to: process.env.TEST_RECIPIENT || 'bindassnix@gmail.com',
        subject: `Integration Test Email ${Date.now()}`,
        text: 'This is a test email sent from the integration script.',
        html: '<p>This is a <b>test email</b> sent from the <i>integration script</i>.</p>'
    };

    try {
        const response = await fetch(`${BASE_URL}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            log('✅ Send Email: SUCCESS');
            return { success: true, subject: payload.subject };
        } else {
            log(`❌ Send Email: FAILED (${response.status}) - ${JSON.stringify(data)}`);
            return { success: false };
        }
    } catch (error) {
        log(`❌ Send Email: ERROR - ${error.message}`);
        return { success: false };
    }
}

async function testCheckInbox(expectedSubject) {
    log('Testing GET /api/v1/inbox...');

    try {
        // Query for the specific email we just sent to verify
        const url = expectedSubject
            ? `${BASE_URL}/inbox?limit=10` // fetching latest 10 to check
            : `${BASE_URL}/inbox?limit=5`;

        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.emails)) {
            log(`✅ Check Inbox: SUCCESS - Retrieved ${data.emails.length} emails`);

            if (expectedSubject) {
                const found = data.emails.find(e => e.subject === expectedSubject);
                if (found) {
                    log(`✅ Verification: Found email with subject "${expectedSubject}"`);
                    return true;
                } else {
                    log(`⚠️ Verification: Did NOT find email with subject "${expectedSubject}" in the latest list.`);
                    if (data.emails.length > 0) {
                        log(`   Latest email found: ${data.emails[0].subject}`);
                    }
                    return false;
                }
            }
            return true;
        } else {
            log(`❌ Check Inbox: FAILED (${response.status}) - ${JSON.stringify(data)}`);
            return false;
        }
    } catch (error) {
        log(`❌ Check Inbox: ERROR - ${error.message}`);
        return false;
    }
}

async function runTests() {
    log(`Starting Integration Tests against ${BASE_URL}...`);

    // 1. Send Email
    const sendResult = await testSendEmail();

    // 2. Wait and Check Inbox
    if (sendResult.success) {
        log('Waiting 5 seconds for email delivery/processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        const inboxSuccess = await testCheckInbox(sendResult.subject);

        if (inboxSuccess) {
            log('🎉 All Tests Passed!');
            process.exit(0);
        } else {
            log('⚠️ Inbox verification failed (email might be delayed or filtered).');
            process.exit(1);
        }
    } else {
        log('🛑 Stopping tests due to send failure.');
        process.exit(1);
    }
}

runTests();
