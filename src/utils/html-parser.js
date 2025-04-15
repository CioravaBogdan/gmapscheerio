// filepath: c:\scrapers\GMpas cheerio\src\utils\html-parser.js
const cheerio = require('cheerio');

class HtmlParser {
    parse(html) {
        return cheerio.load(html);
    }
    
    extractStructuredData($) {
        const scripts = $('script[type="application/ld+json"]');
        const data = [];
        
        scripts.each((i, el) => {
            try {
                const scriptContent = $(el).html();
                if (scriptContent) {
                    const parsed = JSON.parse(scriptContent);
                    data.push(parsed);
                }
            } catch (e) {
                // Skip invalid JSON
            }
        });
        
        return data;
    }
    
    extractMetaTags($) {
        const metaTags = {};
        $('meta').each((i, el) => {
            const name = $(el).attr('name') || $(el).attr('property');
            const content = $(el).attr('content');
            if (name && content) {
                metaTags[name] = content;
            }
        });
        
        return metaTags;
    }
}

module.exports = HtmlParser;
