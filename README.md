# Google Maps Advanced Scraper
Google Maps Advanced Scraper
A high-performance, configurable scraper for extracting business and location data from Google Maps using Cheerio instead of a full browser, maximizing throughput and minimizing costs.

Features
Efficient Data Extraction: Uses Cheerio to parse HTML instead of full browser rendering
Comprehensive Data Collection: Gathers business information including contact details, hours, reviews, ratings, and images
Multiple Search Methods: Search by keywords, locations, or direct URLs
Contact Information Extraction: Extracts emails and social media profiles from business websites
Cost Optimization: Tracks usage costs and can stop before exceeding budget limits
Proxy Support: Built-in Apify proxy integration to prevent rate limiting
Geolocation Features: Supports custom coordinates and radius-based searches
Complete Customization: Configure the depth and breadth of your scraping
Installation
Prerequisites
Node.js 14 or newer
npm or yarn
Local Setup
Configuration
Input Parameters
All configuration is provided through input parameters. You can set them in:

INPUT.json for local runs
Apify Console UI when running as an Actor
API requests when using via API
Key Parameters
Parameter	Type	Description
searchStringsArray	Array	List of search terms to use
searchLocation	String	Location to search in (e.g., "New York")
customGeolocation	Object	Define a specific area with coordinates and radius
startUrls	Array	Direct URLs to Google Maps places
maxCrawledPlacesPerSearch	Number	Maximum places per search term (0 = unlimited)
maxCrawledPlaces	Number	Total maximum places to extract (0 = unlimited)
scrapeContacts	Boolean	Extract emails/social from websites
scrapePlaceDetailPage	Boolean	Visit place detail pages for more data
maxImages	Number	Maximum images per place (0 = none)
maxReviews	Number	Maximum reviews per place (0 = none)
proxyConfig	Object	Proxy settings for Apify
maxCostPerRun	Number	Budget limit in USD (0 = unlimited)
Usage
Running Locally
Create an INPUT.json file in default with your configuration
Run the scraper:
Results will be stored in apify_storage/datasets/default/
Using the Apify Platform
Go to Apify and create a new task for the Google Maps Advanced Scraper actor
Configure input parameters in the Apify Console
Run the task and access your data in the "Dataset" tab
Using the API
Authentication
To use the Actor via API, you need an Apify API token:

API Endpoints
When using the Apify API, you can:

Start a Scraping Run:

Get Run Status:

Get Scraped Results:
GET https://api.apify.com/v2/datasets/XXXXXXXXXX/items

Stop a Running Task:
POST https://api.apify.com/v2/acts/your-username~google-maps-advanced-scraper/runs

Output Format
The scraper outputs data in the following structure:

{
  "category": "Restaurant",
  "name": "Sample Restaurant",
  "phone": "+1 (123) 456-7890",
  "googleMapsUrl": "https://www.google.com/maps/place/...",
  "website": "https://www.samplerestaurant.com",
  "emails": ["contact@samplerestaurant.com"],
  "address": "123 Main St, New York, NY 10001, USA",
  "totalReviews": "542",
  "rating": "4.7",
  "businessStatus": "Open",
  "hours": ["Monday: 9:00 AM – 10:00 PM", "Tuesday: 9:00 AM – 10:00 PM"],
  "socialMedia": [
    {
      "platform": "Facebook",
      "url": "https://www.facebook.com/samplerestaurant"
    }
  ],
  "images": ["https://example.com/image1.jpg"]
}

Cost Optimization Tips
The scraper includes built-in cost estimation to help manage your budget:

Use maxCrawledPlaces and maxCrawledPlacesPerSearch to limit the scope
Set scrapeContacts: false if you don't need email/social media information
Reduce maxImages and maxReviews to decrease computational costs
Enable costOptimizedMode for automatic resource optimization
Set maxCostPerRun to prevent exceeding your budget
Legal Considerations
When using this scraper, be aware of:

Google's Terms of Service
Data privacy regulations in your jurisdiction
Rate limiting and responsible scraping practices
This tool is provided for educational purposes. Use responsibly and ethically.

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

License
ISC License