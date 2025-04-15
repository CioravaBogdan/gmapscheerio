// filepath: c:\scrapers\GMpas cheerio\src\utils\request-utils.js
const axios = require('axios');
const { Actor } = require('apify');

class RequestUtils {
    constructor(proxyConfig = {}) {
        this.proxyConfig = proxyConfig;
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    }
    
    async getProxyUrl() {
        if (!this.proxyConfig.useApifyProxy) {
            return null;
        }
        
        const proxy = await Actor.createProxyConfiguration(this.proxyConfig);
        return await proxy.newUrl();
    }
    
    async makeRequest(url, options = {}) {
        const proxyUrl = await this.getProxyUrl();
        const config = {
            url,
            method: options.method || 'GET',
            headers: {
                'User-Agent': this.userAgent,
                ...options.headers,
            },
            timeout: options.timeout || 30000,
            ...options,
        };
        
        if (proxyUrl) {
            config.proxy = {
                protocol: proxyUrl.protocol,
                host: proxyUrl.hostname,
                port: proxyUrl.port,
                auth: {
                    username: proxyUrl.username,
                    password: proxyUrl.password,
                },
            };
        }
        
        try {
            return await axios(config);
        } catch (error) {
            console.error(`Request failed for ${url}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = RequestUtils;
