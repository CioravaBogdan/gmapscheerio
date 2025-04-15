// filepath: c:\scrapers\GMpas cheerio\src\utils\cost-estimator.js
const { log } = require('apify');

class CostEstimator {
    constructor(maxCostUsd = 0) {
        this.maxCostUsd = maxCostUsd;
        this.placesScraped = 0;
        this.detailPagesFetched = 0;
        this.websitesVisited = 0;
        this.imagesScraped = 0;
        this.reviewsScraped = 0;
        
        // Cost parameters in USD
        this.COST_PER_PLACE = 0.0005;
        this.COST_PER_DETAIL = 0.001;
        this.COST_PER_WEBSITE = 0.002;
        this.COST_PER_IMAGE = 0.0001;
        this.COST_PER_REVIEW = 0.0001;
    }
    
    getTotalCost() {
        return (
            this.placesScraped * this.COST_PER_PLACE +
            this.detailPagesFetched * this.COST_PER_DETAIL +
            this.websitesVisited * this.COST_PER_WEBSITE +
            this.imagesScraped * this.COST_PER_IMAGE +
            this.reviewsScraped * this.COST_PER_REVIEW
        );
    }
    
    shouldContinue() {
        if (this.maxCostUsd <= 0) return true;
        return this.getTotalCost() < this.maxCostUsd;
    }
    
    addPlace() {
        this.placesScraped++;
        return this.shouldContinue();
    }
    
    addDetailPage() {
        this.detailPagesFetched++;
        return this.shouldContinue();
    }
    
    addWebsite() {
        this.websitesVisited++;
        return this.shouldContinue();
    }
    
    addImages(count = 1) {
        this.imagesScraped += count;
        return this.shouldContinue();
    }
    
    addReviews(count = 1) {
        this.reviewsScraped += count;
        return this.shouldContinue();
    }
    
    async logReport() {
        const totalCost = this.getTotalCost();
        log.info('Cost estimation report:');
        log.info(`Places scraped: ${this.placesScraped}`);
        log.info(`Detail pages: ${this.detailPagesFetched}`);
        log.info(`Websites visited: ${this.websitesVisited}`);
        log.info(`Images scraped: ${this.imagesScraped}`);
        log.info(`Reviews scraped: ${this.reviewsScraped}`);
        log.info(`Total estimated cost: $${totalCost.toFixed(4)} USD`);
        
        if (this.maxCostUsd > 0) {
            log.info(`Budget limit: $${this.maxCostUsd.toFixed(2)} USD`);
            if (totalCost >= this.maxCostUsd) {
                log.warning('Budget limit reached during execution');
            }
        }
    }
}

module.exports = CostEstimator;
