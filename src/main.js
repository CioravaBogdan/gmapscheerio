const { Actor, log } = require('apify');
const { Crawler } = require('./crawler');
const CostEstimator = require('./utils/cost-estimator');
const fs = require('fs');
const path = require('path');

// --- Main Actor Logic ---
Actor.main(async () => {
    log.info('Reading input...');
    
    // Try to get input from Actor.getInput() first
    let input = await Actor.getInput();
    
    // If input is null, try to read from local file
    if (!input) {
        try {
            const inputPath = path.join(process.env.APIFY_LOCAL_STORAGE_DIR || '', 
                              'key_value_stores', 
                              'default', 
                              'INPUT.json');
            log.info(`Trying to read input from ${inputPath}`);
            
            if (fs.existsSync(inputPath)) {
                const inputData = fs.readFileSync(inputPath, 'utf8');
                input = JSON.parse(inputData);
                log.info('Successfully loaded input from local file');
            }
        } catch (error) {
            log.error(`Error reading local input file: ${error}`);
        }
    }
    
    // If still no input, use default values
    if (!input) {
        log.info('No input provided, using default values');
        input = {
            searchStringsArray: ['restaurants'],
            searchLocation: 'New York',
            maxCrawledPlacesPerSearch: 5,
            maxCrawledPlaces: 10,
            scrapeContacts: true,
            scrapePlaceDetailPage: true,
            maxImages: 1,
            maxReviews: 1,
            proxyConfig: { useApifyProxy: false }
        };
    }

    // --- Input Processing & Validation ---
    const {
        searchStringsArray = [],
        searchLocation = '',
        customGeolocation = null,
        startUrls = [],
        maxCrawledPlacesPerSearch = 0,
        maxCrawledPlaces = 0,
        maxCostPerRun = 0,
        scrapeContacts = true,
        scrapePlaceDetailPage = true,
        skipClosedPlaces = false,
        maxImages = 5,
        maxReviews = 5,
        language = 'en',
        proxyConfig = { useApifyProxy: false },
    } = input;

    if (!startUrls.length && (!searchStringsArray.length || (!searchLocation && !customGeolocation))) {
        throw new Error('Either "startUrls", "searchStringsArray" with "searchLocation", or "customGeolocation" must be provided');
    }

    // --- Initialize Cost Estimator ---
    const costEstimator = new CostEstimator(maxCostPerRun);

    // --- Initialize Crawler ---
    const crawler = new Crawler({
        startUrls,
        searchStringsArray,
        searchLocation,
        customGeolocation,
        maxCrawledPlacesPerSearch,
        maxCrawledPlaces,
        scrapeContacts,
        scrapePlaceDetailPage,
        skipClosedPlaces,
        maxImages,
        maxReviews,
        language,
        proxyConfig,
        costEstimator,
    });

    // --- Start Crawler & Finish ---
    log.info('Starting the crawler run...');
    await crawler.run();
    log.info('Crawler finished.');

    // Log final cost report
    await costEstimator.logReport();
});
