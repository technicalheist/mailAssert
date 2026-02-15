// Email template utilities and all notification templates

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const mailDomain = process.env.MAIL_DOMAIN || 'mailassert.com'
const supportEmail = process.env.SUPPORT_EMAIL || 'support@mailassert.com'

// Base email template wrapper
function emailTemplate(content: string, title: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MailAssert</h1>
                            <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 14px;">Email Testing Made Simple</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                This email was sent by <strong>MailAssert</strong>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                <a href="${baseUrl}/settings" style="color: #3b82f6; text-decoration: none;">Manage notification preferences</a> | 
                                <a href="${baseUrl}" style="color: #3b82f6; text-decoration: none;">Visit MailAssert</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
}

// 1. Login Notification Template
export function loginNotificationTemplate(data: {
    userName: string
    email: string
    loginTime: string
    ipAddress?: string
    userAgent?: string
    location?: string
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            New Login Detected
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            We detected a new login to your MailAssert account. If this was you, you can safely ignore this email.
        </p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Login Details:</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; font-size: 14px; width: 120px;"><strong>Email:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.email}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Time:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.loginTime}</td>
                </tr>
                ${data.ipAddress ? `
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>IP Address:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.ipAddress}</td>
                </tr>
                ` : ''}
                ${data.location ? `
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Location:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.location}</td>
                </tr>
                ` : ''}
                ${data.userAgent ? `
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Device:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.userAgent}</td>
                </tr>
                ` : ''}
            </table>
        </div>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Didn't recognize this login?</strong><br>
                If you didn't log in, please secure your account immediately by changing your password.
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="${baseUrl}/settings" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Review Account Security
            </a>
        </div>
    `

    return emailTemplate(content, 'New Login Detected - MailAssert')
}

// 2. Password Change Notification Template
export function passwordChangeNotificationTemplate(data: {
    userName: string
    email: string
    changeTime: string
    ipAddress?: string
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            Password Changed Successfully
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your MailAssert account password was recently changed. If you made this change, you can safely ignore this email.
        </p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid: #10b981; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Change Details:</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; font-size: 14px; width: 120px;"><strong>Account:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.email}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Changed At:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.changeTime}</td>
                </tr>
                ${data.ipAddress ? `
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>IP Address:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.ipAddress}</td>
                </tr>
                ` : ''}
            </table>
        </div>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Didn't change your password?</strong><br>
                If you didn't make this change, your account may be compromised. Please contact our support team immediately.
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="mailto:${supportEmail}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Contact Support
            </a>
        </div>
    `

    return emailTemplate(content, 'Password Changed - MailAssert')
}

// 3. API Key Created Notification Template
export function apiKeyCreatedNotificationTemplate(data: {
    userName: string
    keyName: string
    createdAt: string
    keyPreview: string
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            New API Key Created
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            A new API key was created for your MailAssert account.
        </p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">API Key Details:</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; font-size: 14px; width: 120px;"><strong>Key Name:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.keyName}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Created:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.createdAt}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Key Preview:</strong></td>
                    <td style="color: #111827; font-size: 14px; font-family: monospace;">${data.keyPreview}...</td>
                </tr>
            </table>
        </div>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                <strong>💡 Security Tip:</strong><br>
                Keep your API keys secure and never share them publicly. You can revoke this key anytime from your dashboard.
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="${baseUrl}/api-keys" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Manage API Keys
            </a>
        </div>
    `

    return emailTemplate(content, 'New API Key Created - MailAssert')
}

// 4. API Key Deleted Notification Template
export function apiKeyDeletedNotificationTemplate(data: {
    userName: string
    keyName: string
    deletedAt: string
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            API Key Deleted
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            An API key was deleted from your MailAssert account.
        </p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Deletion Details:</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; font-size: 14px; width: 120px;"><strong>Key Name:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.keyName}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Deleted:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.deletedAt}</td>
                </tr>
            </table>
        </div>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 14px; line-height: 1.6;">
            Any applications using this API key will no longer be able to access your MailAssert account.
        </p>
        
        <div style="text-align: center;">
            <a href="${baseUrl}/api-keys" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View API Keys
            </a>
        </div>
    `

    return emailTemplate(content, 'API Key Deleted - MailAssert')
}

// 5. New Email Alert Template (READY - Will implement later)
export function newEmailAlertTemplate(data: {
    userName: string
    inboxId: string
    from: string
    subject: string
    receivedAt: string
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            New Email Received
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            You've received a new email in your <strong>${data.inboxId}</strong> inbox.
        </p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Email Details:</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; font-size: 14px; width: 120px;"><strong>From:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.from}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Subject:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.subject || '(No Subject)'}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Received:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.receivedAt}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Inbox:</strong></td>
                    <td style="color: #111827; font-size: 14px; font-family: monospace;">*@${data.inboxId}-${mailDomain}</td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center;">
            <a href="${baseUrl}/inbox" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Email
            </a>
        </div>
    `

    return emailTemplate(content, 'New Email Received - MailAssert')
}

// 6. Inbox Created Notification Template (READY - Will implement later)
export function inboxCreatedNotificationTemplate(data: {
    userName: string
    inboxId: string
    inboxName: string
    createdAt: string
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M12 4v16m8-8H4"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            New Inbox Created
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            A new inbox has been created in your MailAssert account.
        </p>
        
        <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Inbox Details:</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; font-size: 14px; width: 120px;"><strong>Name:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.inboxName}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Address:</strong></td>
                    <td style="color: #111827; font-size: 14px; font-family: monospace;">*@${data.inboxId}-${mailDomain}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Created:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.createdAt}</td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center;">
            <a href="${baseUrl}/settings" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Manage Inboxes
            </a>
        </div>
    `

    return emailTemplate(content, 'New Inbox Created - MailAssert')
}

// 7. Inbox Deleted Notification Template (READY - Will implement later)
export function inboxDeletedNotificationTemplate(data: {
    userName: string
    inboxId: string
    inboxName: string
    deletedAt: string
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            Inbox Deleted
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            An inbox has been deleted from your MailAssert account.
        </p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Deleted Inbox:</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; font-size: 14px; width: 120px;"><strong>Name:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.inboxName}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Address:</strong></td>
                    <td style="color: #111827; font-size: 14px; font-family: monospace;">*@${data.inboxId}-${mailDomain}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; font-size: 14px;"><strong>Deleted:</strong></td>
                    <td style="color: #111827; font-size: 14px;">${data.deletedAt}</td>
                </tr>
            </table>
        </div>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 14px; line-height: 1.6;">
            All emails in this inbox have been permanently deleted.
        </p>
        
        <div style="text-align: center;">
            <a href="${baseUrl}/settings" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Inboxes
            </a>
        </div>
    `

    return emailTemplate(content, 'Inbox Deleted - MailAssert')
}

// 8. Weekly Summary Template (READY - Will implement later)
export function weeklySummaryTemplate(data: {
    userName: string
    weekStart: string
    weekEnd: string
    totalEmails: number
    totalInboxes: number
    topInbox?: { name: string; count: number }
    newInboxes: number
}) {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
            </div>
        </div>
        
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
            Your Weekly Summary
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${data.userName}</strong>,
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Here's a summary of your MailAssert activity from <strong>${data.weekStart}</strong> to <strong>${data.weekEnd}</strong>.
        </p>
        
        <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600; text-align: center;">Activity Overview</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 5px;">${data.totalEmails}</div>
                    <div style="font-size: 14px; color: #6b7280;">Emails Received</div>
                </div>
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #8b5cf6; margin-bottom: 5px;">${data.totalInboxes}</div>
                    <div style="font-size: 14px; color: #6b7280;">Active Inboxes</div>
                </div>
            </div>
            
            ${data.topInbox ? `
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Most Active Inbox:</div>
                <div style="font-size: 16px; font-weight: 600; color: #111827;">${data.topInbox.name} (${data.topInbox.count} emails)</div>
            </div>
            ` : ''}
            
            ${data.newInboxes > 0 ? `
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px;">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">New Inboxes Created:</div>
                <div style="font-size: 16px; font-weight: 600; color: #111827;">${data.newInboxes}</div>
            </div>
            ` : ''}
        </div>
        
        <div style="text-align: center;">
            <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Dashboard
            </a>
        </div>
    `

    return emailTemplate(content, 'Your Weekly Summary - MailAssert')
}
