
import fetch from 'node-fetch';

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
const TEST_EMAIL_BASE = process.env.TEST_RECIPIENT || 'bindassnix@gmail.com';
// Use timestamp to ensure unique user for registration
const TIMESTAMP = Date.now();
// Handle explicit email or construct a plus-alias
const TEST_EMAIL = TEST_EMAIL_BASE.includes('+')
    ? TEST_EMAIL_BASE
    : TEST_EMAIL_BASE.replace('@', `+auth${TIMESTAMP}@`);

const PASSWORD = 'InitialPassword123!';
const NEW_PASSWORD = 'NewPassword456!';

async function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

async function request(endpoint, method, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data };
}

async function testAuthFlow() {
    log(`Starting Auth Integration Tests...`);
    log(`User Email: ${TEST_EMAIL}`);

    // 1. Registration
    log('1. Testing Registration...');
    const registerRes = await request('/auth/register', 'POST', {
        email: TEST_EMAIL,
        password: PASSWORD
    });

    if (registerRes.status === 200 && registerRes.data.success) {
        log('✅ Registration Success');
    } else {
        log(`❌ Registration Failed: ${JSON.stringify(registerRes.data)}`);
        process.exit(1);
    }

    // 2. Login
    log('2. Testing Login (Original Password)...');
    const loginRes = await request('/auth/login', 'POST', {
        email: TEST_EMAIL,
        password: PASSWORD
    });

    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.token) {
        log('✅ Login Success (Token received)');
    } else {
        log(`❌ Login Failed: ${JSON.stringify(loginRes.data)}`);
        process.exit(1);
    }

    // 3. Forgot Password
    log('3. Testing Forgot Password...');
    const forgotRes = await request('/auth/forgot-password', 'POST', {
        email: TEST_EMAIL
    });

    if (forgotRes.status === 200 && forgotRes.data.success) {
        log('✅ Forgot Password Request Success');
    } else {
        log(`❌ Forgot Password Request Failed: ${JSON.stringify(forgotRes.data)}`);
        process.exit(1);
    }

    // 4. Check Inbox and Extract Token
    log('4. Waiting for Reset Email...');
    let resetToken = null;

    // Poll for up to 30 seconds
    const pollStart = Date.now();
    while (Date.now() - pollStart < 45000) {
        await new Promise(r => setTimeout(r, 5000)); // Wait 5s

        // We filter by our specific test email to find the relevant message
        const inboxRes = await request(`/inbox?to=${encodeURIComponent(TEST_EMAIL)}&limit=5`, 'GET');

        if (inboxRes.status === 200 && inboxRes.data.success) {
            const emails = inboxRes.data.emails || [];
            // Find email with subject "Password Reset Request"
            const resetEmail = emails.find(e => e.subject === 'Password Reset Request');

            if (resetEmail) {
                log('✅ Reset Email Found');
                let body = resetEmail.body;
                // Decode partial Quoted-Printable (=3D for =) and soft formatting (=\r\n)
                body = body.replace(/=3D/g, '=').replace(/=\r?\n/g, '');

                // Regex to find token=([a-f0-9]+)
                // Also handle potential wrapping or other artifacts
                const match = body.match(/token=([a-f0-9]+)/);
                if (match && match[1]) {
                    resetToken = match[1];
                    log(`✅ Token Extracted: ${resetToken}`);
                    break;
                } else {
                    log(`⚠️ Email found but token extraction failed. Body snippet: ${body.substring(0, 100)}...`);
                }
            }
        }
    }

    if (!resetToken) {
        log('❌ Failed to retrieve reset token from email (timeout or not found).');
        process.exit(1);
    }

    // 5. Reset Password
    log('5. Testing Reset Password...');
    const resetRes = await request('/auth/reset-password', 'POST', {
        token: resetToken,
        newPassword: NEW_PASSWORD
    });

    if (resetRes.status === 200 && resetRes.data.success) {
        log('✅ Password Reset Success');
    } else {
        log(`❌ Password Reset Failed: ${JSON.stringify(resetRes.data)}`);
        process.exit(1);
    }

    // 6. Login with Old Password (Should Fail)
    log('6. Testing Login with Old Password (expect failure)...');
    const oldLoginRes = await request('/auth/login', 'POST', {
        email: TEST_EMAIL,
        password: PASSWORD
    });

    if (oldLoginRes.status === 401 || !oldLoginRes.data.success) {
        log('✅ Login with Old Password correctly failed');
    } else {
        log('❌ Login with Old Password SUCCEEDED (unexpected)');
        process.exit(1);
    }

    // 7. Login with New Password
    log('7. Testing Login with New Password...');
    const newLoginRes = await request('/auth/login', 'POST', {
        email: TEST_EMAIL,
        password: NEW_PASSWORD
    });

    if (newLoginRes.status === 200 && newLoginRes.data.success) {
        log('✅ Login with New Password Success');
        log('🎉 All Auth Tests Passed!');
        process.exit(0);
    } else {
        log(`❌ Login with New Password Failed: ${JSON.stringify(newLoginRes.data)}`);
        process.exit(1);
    }
}

testAuthFlow();
