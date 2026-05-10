#!/usr/bin/env node

/**
 * Email Routing Test Script
 * 
 * This script validates the full lifecycle of dynamic email routing:
 * 1. Generate inbox identifier
 * 2. Create email routing via Cloudflare API
 * 3. Send test email via SMTP
 * 4. Verify delivery via IMAP
 */

require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Domain configuration
    MAIL_DOMAIN: process.env.MAIL_DOMAIN || 'mytest.mailassert.com',

    // Cloudflare configuration
    CLOUDFLARE: {
        GLOBAL_API_KEY: process.env.CLOUDFLARE_GLOBAL_API_TOKEN,
        EMAIL: process.env.CLOUDFLARE_EMAIL || process.env.MAIL_USERNAME, // Cloudflare account email
        ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
        ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    },

    // SMTP configuration
    SMTP: {
        HOST: process.env.MAIL_SERVER,
        PORT: parseInt(process.env.MAIL_PORT || '587'),
        USER: process.env.MAIL_USERNAME,
        PASS: process.env.MAIL_PASSWORD,
        FROM: process.env.MAIL_DEFAULT_SENDER || 'noreply@mailassert.com',
    },

    // IMAP configuration
    IMAP: {
        HOST: process.env.IMAP_SERVER,
        PORT: 993,
        USER: process.env.IMAP_USERNAME,
        PASS: process.env.IMAP_PASSWORD,
        TLS: true,
    },

    // Test configuration
    TEST: {
        RETRY_INTERVAL: 20000, // 20 seconds
        MAX_RETRIES: 5,
        TIMEOUT: 120000, // 2 minutes total timeout
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a random inbox ID
 */
function generateInboxId(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Log with timestamp and color
 */
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        error: '\x1b[31m',   // Red
        warning: '\x1b[33m', // Yellow
        reset: '\x1b[0m'
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CLOUDFLARE API FUNCTIONS
// ============================================================================

/**
 * Create email routing rule via Cloudflare API
 */
async function createEmailRouting(inboxId, destinationEmail, routingDomain) {
    log(`Creating email routing for: *@${routingDomain}`, 'info');

    // Debug: Show auth details (masked)
    log(`  Using Global API Key: ${CONFIG.CLOUDFLARE.GLOBAL_API_KEY?.substring(0, 10)}...`, 'info');
    log(`  Using Email: ${CONFIG.CLOUDFLARE.EMAIL}`, 'info');

    try {
        // Cloudflare Email Routing API endpoint
        const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.CLOUDFLARE.ZONE_ID}/email/routing/rules`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Auth-Key': CONFIG.CLOUDFLARE.GLOBAL_API_KEY,
                'X-Auth-Email': CONFIG.CLOUDFLARE.EMAIL,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                matchers: [
                    {
                        type: 'literal',
                        field: 'to',
                        value: `*@${routingDomain}`
                    }
                ],
                actions: [
                    {
                        type: 'forward',
                        value: [destinationEmail]
                    }
                ],
                enabled: true,
                name: `Route for ${inboxId}`,
                priority: 0
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors || data)}`);
        }

        log(`✓ Email routing created successfully`, 'success');
        log(`  Rule ID: ${data.result.id}`, 'info');
        log(`  Routing: *@${routingDomain} → ${destinationEmail}`, 'info');

        return {
            success: true,
            ruleId: data.result.id,
            routingDomain
        };

    } catch (error) {
        log(`✗ Failed to create email routing: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

const DNS_RECORDS = [
    { type: 'MX', content: 'route1.mx.cloudflare.net', priority: 55 },
    { type: 'MX', content: 'route2.mx.cloudflare.net', priority: 25 },
    { type: 'MX', content: 'route3.mx.cloudflare.net', priority: 90 },
    { type: 'TXT', content: 'v=spf1 include:_spf.mx.cloudflare.net ~all' }
];

/**
 * Create DNS records for the subdomain
 */
async function createDnsRecords(routingDomain) {
    log(`Creating DNS records for: ${routingDomain}`, 'info');

    const createdRecordIds = [];

    try {
        const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.CLOUDFLARE.ZONE_ID}/dns_records`;

        // We need to determine the record name. 
        // If routingDomain is "sub.example.com", the name is correct.
        const recordName = routingDomain;

        for (const record of DNS_RECORDS) {
            const body = {
                type: record.type,
                name: recordName,
                content: record.content,
                ttl: 60, // 1 minute (lowest possible) for fast testing
                proxied: false
            };

            if (record.priority) {
                body.priority = record.priority;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Auth-Key': CONFIG.CLOUDFLARE.GLOBAL_API_KEY,
                    'X-Auth-Email': CONFIG.CLOUDFLARE.EMAIL,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // If it fails, log but continue (maybe it already exists?)
                // But for a random subdomain, it shouldn't exist.
                log(`  Warning: Failed to create ${record.type} record: ${JSON.stringify(data.errors || data)}`, 'warning');
            } else {
                createdRecordIds.push(data.result.id);
                log(`  ✓ Created ${record.type} record (${record.content})`, 'success');
            }
        }

        return {
            success: true,
            recordIds: createdRecordIds
        };

    } catch (error) {
        log(`✗ Failed to create DNS records: ${error.message}`, 'error');
        // Clean up any that were created
        await deleteDnsRecords(createdRecordIds);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Delete DNS records (cleanup)
 */
async function deleteDnsRecords(recordIds) {
    if (!recordIds || recordIds.length === 0) return;

    log(`Cleaning up ${recordIds.length} DNS records...`, 'info');

    for (const id of recordIds) {
        try {
            const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.CLOUDFLARE.ZONE_ID}/dns_records/${id}`;
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-Auth-Key': CONFIG.CLOUDFLARE.GLOBAL_API_KEY,
                    'X-Auth-Email': CONFIG.CLOUDFLARE.EMAIL,
                }
            });
        } catch (error) {
            console.error(`Failed to delete DNS record ${id}:`, error.message);
        }
    }
    log(`✓ DNS records deleted`, 'success');
}

/**
 * Delete email routing rule (cleanup)
 */
async function deleteEmailRouting(ruleId) {
    if (!ruleId) return;

    try {
        const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.CLOUDFLARE.ZONE_ID}/email/routing/rules/${ruleId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-Auth-Key': CONFIG.CLOUDFLARE.GLOBAL_API_KEY,
                'X-Auth-Email': CONFIG.CLOUDFLARE.EMAIL,
            }
        });

        const data = await response.json();

        if (data.success) {
            log(`✓ Email routing rule deleted (cleanup)`, 'success');
        }
    } catch (error) {
        log(`Warning: Failed to delete routing rule: ${error.message}`, 'warning');
    }
}

// ============================================================================
// SMTP FUNCTIONS
// ============================================================================

/**
 * Send test email via SMTP
 */
async function sendTestEmail(toAddress, inboxId) {
    log(`Sending test email to: ${toAddress}`, 'info');

    try {
        const transporter = nodemailer.createTransport({
            host: CONFIG.SMTP.HOST,
            port: CONFIG.SMTP.PORT,
            secure: CONFIG.SMTP.PORT === 465,
            auth: {
                user: CONFIG.SMTP.USER,
                pass: CONFIG.SMTP.PASS,
            },
        });

        const testId = Date.now();
        const mailOptions = {
            from: CONFIG.SMTP.FROM,
            to: toAddress,
            subject: `MailAssert Test Email - ${inboxId} - ${testId}`,
            text: `This is a test email for inbox: ${inboxId}\n\nTest ID: ${testId}\nTimestamp: ${new Date().toISOString()}\n\nIf you received this, the email routing is working correctly!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3b82f6;">MailAssert Test Email</h2>
                    <p><strong>Inbox ID:</strong> ${inboxId}</p>
                    <p><strong>Test ID:</strong> ${testId}</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                    <p>If you received this email, the email routing is working correctly! ✓</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        log(`✓ Email sent successfully`, 'success');
        log(`  Message ID: ${info.messageId}`, 'info');
        log(`  Test ID: ${testId}`, 'info');

        return {
            success: true,
            messageId: info.messageId,
            testId,
            toAddress
        };

    } catch (error) {
        log(`✗ Failed to send email: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================================================
// IMAP FUNCTIONS
// ============================================================================

/**
 * Search for email via IMAP
 */
async function searchEmailViaIMAP(toAddress, maxRetries = CONFIG.TEST.MAX_RETRIES) {
    log(`Searching for email in IMAP inbox...`, 'info');
    log(`  Target: ${toAddress}`, 'info');
    log(`  Max retries: ${maxRetries}`, 'info');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        log(`Attempt ${attempt}/${maxRetries}...`, 'info');

        try {
            const result = await searchIMAPOnce(toAddress);

            if (result.success) {
                log(`✓ Email found in IMAP inbox!`, 'success');
                log(`  Subject: ${result.subject}`, 'info');
                log(`  From: ${result.from}`, 'info');
                log(`  Received: ${result.date}`, 'info');
                return result;
            }

            if (attempt < maxRetries) {
                log(`Email not found yet, waiting ${CONFIG.TEST.RETRY_INTERVAL / 1000}s before retry...`, 'warning');
                await sleep(CONFIG.TEST.RETRY_INTERVAL);
            }

        } catch (error) {
            log(`Error during IMAP search: ${error.message}`, 'error');

            if (attempt < maxRetries) {
                await sleep(CONFIG.TEST.RETRY_INTERVAL);
            }
        }
    }

    log(`✗ Email not found after ${maxRetries} attempts`, 'error');
    return {
        success: false,
        error: 'Email not found within retry limit'
    };
}

/**
 * Perform single IMAP search
 */
function searchIMAPOnce(toAddress) {
    return new Promise((resolve, reject) => {
        const imap = new Imap({
            user: CONFIG.IMAP.USER,
            password: CONFIG.IMAP.PASS,
            host: CONFIG.IMAP.HOST,
            port: CONFIG.IMAP.PORT,
            tls: CONFIG.IMAP.TLS,
            tlsOptions: { rejectUnauthorized: false }
        });

        imap.once('ready', () => {
            imap.openBox('INBOX', false, (err, box) => {
                if (err) {
                    imap.end();
                    return reject(err);
                }

                // Search for emails sent to the specific address
                imap.search([['TO', toAddress]], (err, results) => {
                    if (err) {
                        imap.end();
                        return reject(err);
                    }

                    if (!results || results.length === 0) {
                        imap.end();
                        return resolve({ success: false });
                    }

                    // Fetch the most recent matching email
                    const fetch = imap.fetch(results.slice(-1), { bodies: '' });

                    fetch.on('message', (msg) => {
                        msg.on('body', (stream) => {
                            simpleParser(stream, (err, parsed) => {
                                if (err) {
                                    imap.end();
                                    return reject(err);
                                }

                                imap.end();
                                resolve({
                                    success: true,
                                    subject: parsed.subject,
                                    from: parsed.from.text,
                                    to: parsed.to.text,
                                    date: parsed.date,
                                    messageId: parsed.messageId
                                });
                            });
                        });
                    });

                    fetch.once('error', (err) => {
                        imap.end();
                        reject(err);
                    });
                });
            });
        });

        imap.once('error', (err) => {
            reject(err);
        });

        imap.connect();
    });
}

// ============================================================================
// MAIN TEST FUNCTION
// ============================================================================

async function runTest(customInboxId = null) {
    console.log('\n' + '='.repeat(80));
    log('EMAIL ROUTING TEST STARTED', 'info');
    console.log('='.repeat(80) + '\n');

    // Validate configuration
    log('Validating configuration...', 'info');
    const requiredVars = [
        'MAIL_DOMAIN',
        'CLOUDFLARE_GLOBAL_API_TOKEN',
        'CLOUDFLARE_ZONE_ID',
        'MAIL_SERVER',
        'MAIL_USERNAME',
        'MAIL_PASSWORD',
        'IMAP_SERVER',
        'IMAP_USERNAME',
        'IMAP_PASSWORD'
    ];

    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        log(`✗ Missing required environment variables: ${missing.join(', ')}`, 'error');
        process.exit(1);
    }
    log('✓ Configuration validated', 'success');

    // Step 1: Generate inbox identifier
    const inboxId = customInboxId || generateInboxId();
    const routingDomain = `${inboxId}-${CONFIG.MAIL_DOMAIN}`;
    const testEmail = `hello@${routingDomain}`;
    const destinationEmail = CONFIG.IMAP.USER;

    log(`\n📋 Test Configuration:`, 'info');
    log(`  Inbox ID: ${inboxId}`, 'info');
    log(`  Routing Domain: ${routingDomain}`, 'info');
    log(`  Test Email: ${testEmail}`, 'info');
    log(`  Destination: ${destinationEmail}`, 'info');

    let ruleId = null;
    let dnsRecordIds = [];

    try {
        // Step 1: Create DNS records
        log(`\n🔧 Step 1: Creating DNS records...`, 'info');
        const dnsResult = await createDnsRecords(routingDomain);

        if (!dnsResult.success) {
            throw new Error(`Failed to create DNS records: ${dnsResult.error}`);
        }
        dnsRecordIds = dnsResult.recordIds;

        // Step 2: Create email routing
        log(`\n🔧 Step 2: Creating email routing...`, 'info');
        const routingResult = await createEmailRouting(inboxId, destinationEmail, routingDomain);

        if (!routingResult.success) {
            throw new Error(`Failed to create email routing: ${routingResult.error}`);
        }

        ruleId = routingResult.ruleId;

        // Wait a bit for DNS propagation
        log(`\n⏳ Waiting 20 seconds for DNS propagation...`, 'info');
        await sleep(20000);

        // Step 3: Send test email
        log(`\n📧 Step 3: Sending test email...`, 'info');
        const sendResult = await sendTestEmail(testEmail, inboxId);

        if (!sendResult.success) {
            throw new Error(`Failed to send email: ${sendResult.error}`);
        }

        // Step 4: Verify delivery via IMAP
        log(`\n🔍 Step 4: Verifying email delivery via IMAP...`, 'info');
        const imapResult = await searchEmailViaIMAP(testEmail);

        if (!imapResult.success) {
            throw new Error(`Failed to verify email delivery: ${imapResult.error}`);
        }

        // Test passed!
        console.log('\n' + '='.repeat(80));
        log('✓ TEST PASSED - All steps completed successfully!', 'success');
        console.log('='.repeat(80) + '\n');

        log('Test Summary:', 'success');
        log(`  ✓ Email routing created`, 'success');
        log(`  ✓ Test email sent`, 'success');
        log(`  ✓ Email delivered and verified`, 'success');

        // Cleanup
        log(`\n🧹 Cleaning up...`, 'info');
        if (ruleId) await deleteEmailRouting(ruleId);
        if (dnsRecordIds.length > 0) await deleteDnsRecords(dnsRecordIds);

        process.exit(0);

    } catch (error) {
        console.log('\n' + '='.repeat(80));
        log('✗ TEST FAILED', 'error');
        console.log('='.repeat(80) + '\n');
        log(`Error: ${error.message}`, 'error');

        // Cleanup on failure
        log(`\n🧹 Cleaning up...`, 'info');
        if (ruleId) await deleteEmailRouting(ruleId);
        if (dnsRecordIds.length > 0) await deleteDnsRecords(dnsRecordIds);

        process.exit(1);
    }
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
    // Get custom inbox ID from command line argument
    const customInboxId = process.argv[2];

    if (customInboxId) {
        log(`Using custom inbox ID: ${customInboxId}`, 'info');
    } else {
        log(`Generating random inbox ID...`, 'info');
    }

    runTest(customInboxId).catch(error => {
        log(`Unhandled error: ${error.message}`, 'error');
        process.exit(1);
    });
}

module.exports = { runTest };
