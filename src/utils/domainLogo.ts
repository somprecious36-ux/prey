// Domain Logo Detection Utility
export class DomainLogoDetector {
  private static logoCache = new Map<string, string>();
  
  // Common domain to logo mappings
  private static knownLogos: Record<string, string> = {
    'gmail.com': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    'outlook.com': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg',
    'hotmail.com': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg',
    'yahoo.com': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Yahoo%21_logo.svg',
    'apple.com': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    'microsoft.com': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    'google.com': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    'amazon.com': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'facebook.com': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    'twitter.com': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
    'linkedin.com': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    'github.com': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    'dropbox.com': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg',
    'adobe.com': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg',
    'salesforce.com': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    'slack.com': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    'zoom.us': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg',
    'netflix.com': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    'spotify.com': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    'paypal.com': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
    'ebay.com': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    'reddit.com': 'https://upload.wikimedia.org/wikipedia/commons/5/58/Reddit_logo_new.svg',
    'pinterest.com': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png',
    'instagram.com': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    'whatsapp.com': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    'telegram.org': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
    'discord.com': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Discord_icon.svg',
    'twitch.tv': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Twitch_logo.svg',
    'tiktok.com': 'https://upload.wikimedia.org/wikipedia/commons/3/34/Ionicons_logo-tiktok.svg',
    'snapchat.com': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Snapchat_ghost_icon.svg'
  };

  static extractDomain(email: string): string {
    const parts = email.split('@');
    return parts.length > 1 ? parts[1].toLowerCase() : '';
  }

  static async getDomainLogo(email: string): Promise<string | null> {
    const domain = this.extractDomain(email);
    
    if (!domain) {
      return null;
    }

    // Check cache first
    if (this.logoCache.has(domain)) {
      return this.logoCache.get(domain) || null;
    }

    // Check known logos first
    if (this.knownLogos[domain]) {
      const logoUrl = this.knownLogos[domain];
      this.logoCache.set(domain, logoUrl);
      return logoUrl;
    }

    // Try to fetch logo from various sources
    const logoUrl = await this.fetchDomainLogo(domain);
    
    if (logoUrl) {
      this.logoCache.set(domain, logoUrl);
      return logoUrl;
    }

    // Cache null result to avoid repeated failed attempts
    this.logoCache.set(domain, '');
    return null;
  }

  private static async fetchDomainLogo(domain: string): Promise<string | null> {
    const attempts = [
      // Try favicon first
      `https://${domain}/favicon.ico`,
      `https://www.${domain}/favicon.ico`,
      
      // Try common logo paths
      `https://${domain}/logo.png`,
      `https://www.${domain}/logo.png`,
      `https://${domain}/assets/logo.png`,
      `https://www.${domain}/assets/logo.png`,
      
      // Try Clearbit Logo API (free tier)
      `https://logo.clearbit.com/${domain}`,
      
      // Try Google's favicon service
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      
      // Try DuckDuckGo's icon service
      `https://icons.duckduckgo.com/ip3/${domain}.ico`
    ];

    for (const url of attempts) {
      try {
        const isValid = await this.validateImageUrl(url);
        if (isValid) {
          return url;
        }
      } catch (error) {
        // Continue to next attempt
        continue;
      }
    }

    return null;
  }

  private static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // This will help with CORS issues
      });
      
      // For no-cors mode, we can't check the actual response
      // So we'll try to load it as an image instead
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        
        // Timeout after 3 seconds
        setTimeout(() => resolve(false), 3000);
      });
    } catch (error) {
      return false;
    }
  }

  static getCompanyName(domain: string): string {
    // Extract company name from domain
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}