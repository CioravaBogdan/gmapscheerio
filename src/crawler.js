const cheerio = require('cheerio');
const { log, RequestQueue } = require('apify');
const RequestUtils = require('./utils/request-utils');
const ContactExtractor = require('./utils/extract-contact');
const HtmlParser = require('./utils/html-parser');

class Crawler {
    constructor(proxyConfig = {}) {
        this.proxyConfig = proxyConfig;
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            // Add more user agents
        ];
        this.requestUtils = new RequestUtils(proxyConfig);
        this.contactExtractor = new ContactExtractor();
        this.htmlParser = new HtmlParser();
        this.requestQueue = new RequestQueue();
        this.costEstimator = options.costEstimator;
        this.placesScraped = 0;
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async makeRequest(url, options = {}) {
        // ...
        headers: {
            'User-Agent': this.getRandomUserAgent(),
            // ...
        }
        // ...
    }

    async run() {
        // Initialize request queue with start URLs or search terms
        if (this.options.startUrls && this.options.startUrls.length > 0) {
            for (const url of this.options.startUrls) {
                await this.requestQueue.addRequest({ url: url.url || url });
            }
        } else {
            await this.addSearchRequests();
        }

        // Process request queue
        while (this.costEstimator.shouldContinue() && 
               (!this.options.maxCrawledPlaces || this.placesScraped < this.options.maxCrawledPlaces)) {
            
            const request = await this.requestQueue.fetchNextRequest();
            if (!request) break;

            try {
                log.info(`Processing ${request.url}`);
                const response = await this.makeRequestWithDelay(request.url);
                const $ = cheerio.load(response.data);
                
                // Extract place data
                if (request.url.includes('maps.google.com') || request.url.includes('google.com/maps')) {
                    await this.processGoogleMapsPage($, request.url);
                }
                
            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
                await this.requestQueue.markRequestHandled(request);
            }
        }

        log.info(`Finished processing. Total places scraped: ${this.placesScraped}`);
    }

    async addSearchRequests() {
        for (const searchTerm of this.options.searchStringsArray) {
            let searchUrl;
            
            if (this.options.customGeolocation) {
                // Use custom geolocation coordinates
                const { coordinates, radiusKm } = this.options.customGeolocation;
                const [lng, lat] = coordinates;
                searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}/@${lat},${lng},${this.calculateZoomLevel(radiusKm)}z`;
            } else if (this.options.searchLocation) {
                // Use search location name
                searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}+${encodeURIComponent(this.options.searchLocation)}`;
            }
            
            if (searchUrl) {
                log.info(`Adding search URL: ${searchUrl}`);
                await this.requestQueue.addRequest({ url: searchUrl });
            }
        }
    }

    calculateZoomLevel(radiusKm) {
        // Simple logarithmic formula to convert radius to zoom level
        // Smaller radius = higher zoom level
        return Math.round(14 - Math.log2(radiusKm));
    }

    async processGoogleMapsPage($, url) {
        // Check if this is a search results page or place details page
        if (url.includes('/search/') || url.includes('/place/')) {
            if (url.includes('/place/')) {
                await this.extractPlaceDetails($, url);
            } else {
                await this.extractSearchResults($, url);
            }
        }
    }

    async extractSearchResults($, url) {
        // Find place listing elements
        const placeElements = $('[data-result-index]');
        log.info(`Found ${placeElements.length} places on search page`);
        
        let placesProcessed = 0;
        
        for (let i = 0; i < placeElements.length; i++) {
            if (!this.costEstimator.shouldContinue() || 
                (this.options.maxCrawledPlacesPerSearch > 0 && 
                 placesProcessed >= this.options.maxCrawledPlacesPerSearch)) {
                break;
            }
            
            const placeElement = placeElements[i];
            const placeLink = $(placeElement).find('a[href*="/maps/place/"]').first();
            const placeUrl = placeLink.attr('href');
            
            if (placeUrl) {
                // Extract basic info from search result
                const name = $(placeElement).find('.section-result-title').text().trim();
                const rating = $(placeElement).find('.section-result-rating').text().trim();
                const reviewCount = $(placeElement).find('.section-result-num-ratings').text().trim();
                
                // Check if place is permanently closed
                const isClosed = $(placeElement).text().includes('Permanently closed');
                if (this.options.skipClosedPlaces && isClosed) {
                    log.info(`Skipping permanently closed place: ${name}`);
                    continue;
                }
                
                // Add place detail page to queue if option is enabled
                if (this.options.scrapePlaceDetailPage) {
                    await this.requestQueue.addRequest({ 
                        url: placeUrl,
                        userData: {
                            name,
                            rating,
                            reviewCount,
                            isClosed,
                            fromSearch: true
                        }
                    });
                } else {
                    // Save basic place info without visiting detail page
                    await this.savePlaceData({
                        name,
                        rating,
                        reviewCount,
                        isClosed,
                        url: placeUrl
                    });
                    placesProcessed++;
                    this.placesScraped++;
                    this.costEstimator.addPlace();
                }
            }
        }
    }

    async extractPlaceDetails($, url) {
        this.costEstimator.addDetailPage();
        
        // Extract structured data for richer information
        const structuredData = this.htmlParser.extractStructuredData($);
        
        // Basic place information
        const name = $('h1').first().text().trim();
        const category = $('.section-rating-term').first().text().trim() || 
                         $('[jsaction="pane.rating.category"]').text().trim();
        
        // Business status
        const statusText = $('.section-open-hours-status, .section-open-hours-header').text().trim();
        const businessStatus = statusText.includes('Closed') ? 'Closed' : 
                              statusText.includes('Open') ? 'Open' : 'Unknown';
        
        // Rating and reviews
        const rating = $('.section-star-display').text().trim() || 
                       $('[jsaction="pane.rating.rating"]').text().trim();
        const reviewText = $('[jsaction="pane.rating.moreReviews"]').text().trim();
        const totalReviews = reviewText.replace(/[^0-9]/g, '') || '0';
        
        // Address
        const address = $('[data-item-id="address"]').text().trim() || 
                        $('[jsaction*="placeAddress"]').text().trim();
        
        // Phone
        const phone = $('[data-item-id="phone"]').text().trim() || 
                      $('[jsaction*="phone"]').text().trim();
        
        // Website
        const websiteElement = $('[data-item-id="authority"]');
        const website = websiteElement.length ? websiteElement.attr('href') || websiteElement.text().trim() : '';
        
        // Hours
        const hours = [];
        $('.section-open-hours-container .widget-pane-info-open-hours-row').each((i, el) => {
            const day = $(el).find('.widget-pane-info-open-hours-day-name').text().trim();
            const time = $(el).find('.widget-pane-info-open-hours-hour').text().trim();
            hours.push(`${day}: ${time}`);
        });
        
        // Images
        const images = [];
        if (this.options.maxImages > 0) {
            $('[jsaction*="gallery"] img').each((i, el) => {
                if (images.length < this.options.maxImages) {
                    const imgSrc = $(el).attr('src');
                    if (imgSrc && !imgSrc.includes('gstatic.com') && !imgSrc.includes('google.com')) {
                        images.push(imgSrc);
                    }
                }
            });
            this.costEstimator.addImages(images.length);
        }
        
        // Reviews
        const reviews = [];
        if (this.options.maxReviews > 0) {
            $('.section-review').each((i, el) => {
                if (reviews.length < this.options.maxReviews) {
                    const reviewerName = $(el).find('.section-review-title').text().trim();
                    const reviewRating = $(el).find('.section-review-stars').attr('aria-label');
                    const reviewText = $(el).find('.section-review-text').text().trim();
                    
                    reviews.push({
                        reviewer: reviewerName,
                        rating: reviewRating,
                        text: reviewText,
                        date: $(el).find('.section-review-publish-date').text().trim()
                    });
                }
            });
            this.costEstimator.addReviews(reviews.length);
        }
        
        // Extract contact information if enabled
        let contactInfo = { emails: [], phones: [], socialMedia: [] };
        if (this.options.scrapeContacts && website) {
            this.costEstimator.addWebsite();
            contactInfo = await this.contactExtractor.extractFromWebsite(website);
        }
        
        // Combine all data
        const placeData = {
            category,
            name,
            phone,
            googleMapsUrl: url,
            website,
            emails: contactInfo.emails,
            address,
            totalReviews,
            rating,
            businessStatus,
            hours,
            socialMedia: contactInfo.socialMedia,
            images
        };
        
        // Save the place data
        await this.savePlaceData(placeData);
        this.placesScraped++;
        this.costEstimator.addPlace();
    }

    async savePlaceData(placeData) {
        // Push to dataset
        const { Actor } = require('apify');
        await Actor.pushData(placeData);
        
        log.info(`Saved place data: ${placeData.name}`);
    }

    async makeRequestWithDelay(url, options = {}) {
        // Random delay between 2-5 seconds
        const delay = 2000 + Math.random() * 3000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestUtils.makeRequest(url, options);
    }

    // Enhance in crawler.js
async processWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await this.requestUtils.makeRequest(url);
            return response;
        } catch (error) {
            if (attempt === maxRetries) throw error;
            log.warning(`Attempt ${attempt} failed, retrying in 5s...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
}

module.exports = { Crawler };