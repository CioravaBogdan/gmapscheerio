// filepath: c:\scrapers\GMpas cheerio\src\utils\extract-contact.js
const cheerio = require('cheerio');
const axios = require('axios');

class ContactExtractor {
    constructor() {
        this.emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        this.phoneRegex = /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g;
        this.socialMediaPatterns = [
            { domain: 'facebook.com', name: 'Facebook' },
            { domain: 'instagram.com', name: 'Instagram' },
            { domain: 'twitter.com', name: 'Twitter' },
            { domain: 'linkedin.com', name: 'LinkedIn' },
            { domain: 'youtube.com', name: 'YouTube' },
            { domain: 'pinterest.com', name: 'Pinterest' },
            { domain: 'tiktok.com', name: 'TikTok' }
        ];
    }

    async extractFromWebsite(websiteUrl) {
        if (!websiteUrl) return { emails: [], phones: [], socialMedia: [] };
        
        try {
            const response = await axios.get(websiteUrl, { 
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            const $ = cheerio.load(response.data);
            const htmlText = response.data;
            
            // Extract contact info
            const emails = this.extractEmails(htmlText);
            const phones = this.extractPhones(htmlText);
            const socialMedia = this.extractSocialMedia($);
            
            return { emails, phones, socialMedia };
        } catch (error) {
            console.error(`Error extracting contacts from ${websiteUrl}: ${error.message}`);
            return { emails: [], phones: [], socialMedia: [] };
        }
    }
    
    extractEmails(text) {
        const emails = text.match(this.emailRegex) || [];
        return [...new Set(emails)]; // Remove duplicates
    }
    
    extractPhones(text) {
        const phones = text.match(this.phoneRegex) || [];
        return [...new Set(phones)]; // Remove duplicates
    }
    
    extractSocialMedia($) {
        const socialMedia = [];
        
        // Extract from a tags
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (!href) return;
            
            this.socialMediaPatterns.forEach(platform => {
                if (href.includes(platform.domain)) {
                    socialMedia.push({
                        platform: platform.name,
                        url: href.startsWith('http') ? href : `https://${href}`
                    });
                }
            });
        });
        
        return [...new Set(socialMedia.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
    }
}

module.exports = ContactExtractor;
