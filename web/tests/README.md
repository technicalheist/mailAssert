# Email Routing Test Suite

Automated testing for the MailAssert email routing system using Cloudflare, SMTP, and IMAP.

## Overview

This test script validates the complete email routing workflow:

1. **Generate Inbox ID** - Creates or uses a custom inbox identifier
2. **Create Cloudflare Routing** - Sets up email routing via Cloudflare API
3. **Send Test Email** - Sends email via SMTP to the routed address
4. **Verify Delivery** - Confirms email delivery via IMAP with retry logic

## Prerequisites

### Environment Variables

Create or update `.env` in the `web/` directory with the following variables:

```env
# Domain Configuration
MAIL_DOMAIN=mytest.mailassert.com

# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id

# SMTP Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=noreply@mailassert.com

# IMAP Configuration
IMAP_SERVER=imap.gmail.com
IMAP_USERNAME=your_email@gmail.com
IMAP_PASSWORD=your_app_password
```

### Dependencies

Install required packages:

```bash
npm install --save-dev nodemailer imap mailparser dotenv
```

## Usage

### Run with Random Inbox ID

```bash
cd web
node tests/email-routing.test.js
```

This will generate a random 8-character inbox ID (e.g., `abc123de`).

### Run with Custom Inbox ID

```bash
cd web
node tests/email-routing.test.js myinbox
```

This will use `myinbox` as the inbox ID.

### Make Script Executable

```bash
chmod +x web/tests/email-routing.test.js
cd web
./tests/email-routing.test.js
```

## Test Flow

### 1. Configuration Validation
- Checks all required environment variables
- Validates configuration before proceeding

### 2. Inbox ID Generation
- Uses custom ID if provided
- Generates random ID otherwise
- Format: `[inboxId]-[MAIL_DOMAIN]`
- Example: `abc123de-mytest.mailassert.com`

### 3. Cloudflare Email Routing
- Creates routing rule via Cloudflare API
- Catch-all rule: `*@abc123de-mytest.mailassert.com`
- Routes to destination email (IMAP inbox)

### 4. SMTP Email Sending
- Sends test email to: `hello@abc123de-mytest.mailassert.com`
- Includes unique test ID and timestamp
- HTML and plain text versions

### 5. IMAP Verification
- Searches for email in IMAP inbox
- Filters by TO field: exact match required
- Retry logic:
  - Interval: 20 seconds
  - Max attempts: 5
  - Total timeout: ~2 minutes

### 6. Cleanup
- Deletes Cloudflare routing rule
- Cleans up test artifacts

## Expected Output

### Success

```
================================================================================
[2026-02-15T05:00:00.000Z] EMAIL ROUTING TEST STARTED
================================================================================

[2026-02-15T05:00:00.100Z] Validating configuration...
[2026-02-15T05:00:00.150Z] ✓ Configuration validated

[2026-02-15T05:00:00.200Z] 📋 Test Configuration:
[2026-02-15T05:00:00.201Z]   Inbox ID: abc123de
[2026-02-15T05:00:00.202Z]   Routing Domain: abc123de-mytest.mailassert.com
[2026-02-15T05:00:00.203Z]   Test Email: hello@abc123de-mytest.mailassert.com
[2026-02-15T05:00:00.204Z]   Destination: your_email@gmail.com

[2026-02-15T05:00:00.300Z] 🔧 Step 1: Creating email routing...
[2026-02-15T05:00:01.000Z] ✓ Email routing created successfully
[2026-02-15T05:00:01.001Z]   Rule ID: abc123...
[2026-02-15T05:00:01.002Z]   Routing: *@abc123de-mytest.mailassert.com → your_email@gmail.com

[2026-02-15T05:00:11.000Z] 📧 Step 2: Sending test email...
[2026-02-15T05:00:12.000Z] ✓ Email sent successfully
[2026-02-15T05:00:12.001Z]   Message ID: <abc@mail.gmail.com>
[2026-02-15T05:00:12.002Z]   Test ID: 1708000812000

[2026-02-15T05:00:12.100Z] 🔍 Step 3: Verifying email delivery via IMAP...
[2026-02-15T05:00:12.101Z] Attempt 1/5...
[2026-02-15T05:00:15.000Z] ✓ Email found in IMAP inbox!
[2026-02-15T05:00:15.001Z]   Subject: MailAssert Test Email - abc123de - 1708000812000
[2026-02-15T05:00:15.002Z]   From: noreply@mailassert.com
[2026-02-15T05:00:15.003Z]   Received: 2026-02-15T05:00:14.000Z

================================================================================
[2026-02-15T05:00:15.100Z] ✓ TEST PASSED - All steps completed successfully!
================================================================================

[2026-02-15T05:00:15.101Z] Test Summary:
[2026-02-15T05:00:15.102Z]   ✓ Email routing created
[2026-02-15T05:00:15.103Z]   ✓ Test email sent
[2026-02-15T05:00:15.104Z]   ✓ Email delivered and verified

[2026-02-15T05:00:15.200Z] 🧹 Cleaning up...
[2026-02-15T05:00:16.000Z] ✓ Email routing rule deleted (cleanup)
```

### Failure

```
================================================================================
[2026-02-15T05:00:00.000Z] ✗ TEST FAILED
================================================================================

[2026-02-15T05:00:00.001Z] Error: Failed to verify email delivery: Email not found within retry limit
```

## Exit Codes

- `0` - Test passed successfully
- `1` - Test failed

## Configuration

### Retry Settings

Edit `CONFIG.TEST` in the script:

```javascript
TEST: {
    RETRY_INTERVAL: 20000, // 20 seconds between retries
    MAX_RETRIES: 5,        // Maximum 5 attempts
    TIMEOUT: 120000,       // 2 minutes total timeout
}
```

### Inbox ID Length

Edit `generateInboxId()` function:

```javascript
function generateInboxId(length = 8) {
    // Change length parameter
}
```

## Troubleshooting

### Missing Environment Variables

```
✗ Missing required environment variables: CLOUDFLARE_API_TOKEN, MAIL_SERVER
```

**Solution:** Add missing variables to `/web/.env`

### Cloudflare API Error

```
✗ Failed to create email routing: Cloudflare API error: ...
```

**Solutions:**
- Verify API token has correct permissions
- Check zone ID is correct
- Ensure email routing is enabled in Cloudflare

### Email Not Found

```
✗ Email not found after 5 attempts
```

**Solutions:**
- Check IMAP credentials are correct
- Verify email routing rule was created
- Check spam/junk folder
- Increase retry count or interval

### SMTP Error

```
✗ Failed to send email: Invalid login
```

**Solutions:**
- Verify SMTP credentials
- For Gmail: Use App Password, not regular password
- Check SMTP server and port

## Cloudflare API Reference

### Email Routing Endpoints

- **Create Rule:** `POST /zones/{zone_id}/email/routing/rules`
- **Delete Rule:** `DELETE /zones/{zone_id}/email/routing/rules/{rule_id}`
- **List Rules:** `GET /zones/{zone_id}/email/routing/rules`

### Required Permissions

API token needs:
- Zone.Email Routing Rules.Edit
- Zone.Email Routing Rules.Read

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Email Routing Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: node tests/email-routing.test.js
        env:
          MAIL_DOMAIN: ${{ secrets.MAIL_DOMAIN }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ZONE_ID: ${{ secrets.CLOUDFLARE_ZONE_ID }}
          # ... other secrets
```

## Next Steps

After successful testing:

1. ✅ Verify all test steps pass
2. ✅ Confirm email routing works reliably
3. 🔄 Implement production email routing system
4. 🔄 Add webhook for real-time email notifications
5. 🔄 Implement inbox management UI

## Notes

- This is a **test script only** - not for production use
- Routing rules are automatically cleaned up after test
- Test emails are sent to your IMAP inbox
- Supports both Gmail and other IMAP providers
- Uses catch-all routing (`*@domain`) for flexibility

## Support

For issues or questions:
- Check environment variables are correct
- Review Cloudflare API documentation
- Verify SMTP/IMAP credentials
- Check firewall/network settings
