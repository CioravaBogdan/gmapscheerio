# Google Maps Advanced Scraper (Local Execution)

A customizable scraper for extracting business data from Google Maps using Cheerio, designed to run locally with a simple HTML user interface.

## 📋 Overview

This project provides a solution for extracting business information from Google Maps directly on your local machine. It can be used for market research, lead generation, or data analysis. The scraper supports searching by keywords in specific locations or using custom geographic coordinates, configured via an HTML interface or a local input file.

## ✨ Features

- **Local Execution**: Runs entirely on your machine without needing cloud platforms (requires Node.js).
- **HTML User Interface**: Simple UI ([`gmaps-scraper-ui.html`](gmaps-scraper-ui.html)) for configuring and initiating scrapes (requires modification for fully local operation, see below).
- **Multiple Search Methods**:
    - Search by keywords and location name.
    - Use custom geographic coordinates with a specified radius.
- **Rich Data Extraction**:
    - Business name, category, address, phone number.
    - Operating hours and business status.
    - Ratings and reviews (configurable limit).
    - Images (configurable limit).
    - Website URL.
- **Advanced Capabilities**:
    - Extract contact information (emails, phone numbers) from business websites (optional).
    - Extract social media profiles from business websites (optional).
    - Skip permanently closed places (optional).
- **Configurable**: Control scraping depth, data types, and limits via input settings.

## 🛠️ Technical Architecture

- **[`main.js`](src/main.js)**: Entry point that reads input configuration and starts the crawler.
- **[`crawler.js`](src/crawler.js)**: Core scraping logic using Cheerio to parse Google Maps HTML.
- **Utils**: Helper modules for requests ([`request-utils.js`](src/utils/request-utils.js)), contact extraction ([`extract-contact.js`](src/utils/extract-contact.js)), HTML parsing ([`html-parser.js`](src/utils/html-parser.js)), and cost estimation ([`cost-estimator.js`](src/utils/cost-estimator.js) - less relevant for local runs unless simulating Apify costs).
- **[`gmaps-scraper-ui.html`](gmaps-scraper-ui.html)**: Frontend interface for setting parameters.
- **[`INPUT_SCHEMA.json`](INPUT_SCHEMA.json)**: Defines the structure for input parameters.
- **[`apify_storage/key_value_stores/default/INPUT.json`](apify_storage/key_value_stores/default/INPUT.json)**: Default input file used when running locally via `npm start`.

## 🚀 Local Installation & Setup

1.  **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) (which includes npm) installed.
2.  **Clone**: Clone this repository to your local machine.
3.  **Install Dependencies**: Open a terminal or command prompt in the project directory (`d:\gmapscheerio`) and run:
    ```bash
    npm install
    ```

## ▶️ Running the Scraper Locally

There are two main ways to run the scraper locally:

### 1. Using the Default Input File

-   Modify the `apify_storage/key_value_stores/default/INPUT.json` file with your desired search parameters (keywords, location, limits, etc.).
-   Run the scraper from your terminal:
    ```bash
    npm start
    ```
-   The scraper will read the configuration from `INPUT.json` and start scraping. Results will be saved to the `apify_storage/datasets/default` directory as JSON files.

### 2. Using the HTML User Interface (Requires Modification for Full Local Use)

-   **Current State**: The provided [`gmaps-scraper-ui.html`](gmaps-scraper-ui.html) is designed to submit scraping jobs to the Apify *platform* API.
-   **To Use Locally**:
    1.  **Option A (Simple File Opening - No Backend):** You can open [`gmaps-scraper-ui.html`](gmaps-scraper-ui.html) directly in your web browser. Configure the settings in the form. Instead of clicking "Start Scraping", manually copy the desired settings (keywords, location, max places, etc.) into the `apify_storage/key_value_stores/default/INPUT.json` file. Then, run `npm start` in your terminal.
    2.  **Option B (Requires Backend Development):** To make the "Start Scraping" button trigger the local script directly, you would need to:
        *   Set up a simple local web server (e.g., using Node.js with Express).
        *   Modify the `<script>` section in [`gmaps-scraper-ui.html`](gmaps-scraper-ui.html) to send the form data to your local server endpoint instead of the Apify API.
        *   The local server endpoint would then receive the data, write it to `INPUT.json` (or pass it directly), and execute the `node src/main.js` command using Node's `child_process`. This requires additional development.

## 📝 Configuration Options

Configure the scraper by editing `apify_storage/key_value_stores/default/INPUT.json`. Key options include:

| Parameter                 | Type    | Description                                                                 | Default (Example) |
| :------------------------ | :------ | :-------------------------------------------------------------------------- | :---------------- |
| `searchStringsArray`      | Array   | List of search keywords (e.g., "restaurants", "plumbers").                  | `["metal", "fabrica"]` |
| `searchLocation`          | String  | Location name (e.g., "New York", "London").                                 | `"bacau"`         |
| `customGeolocation`       | Object  | Specific coordinates and radius (overrides `searchLocation` if provided). | See file          |
| `maxCrawledPlaces`        | Number  | Total maximum places to extract across all searches (0 = unlimited).        | `200`             |
| `maxCrawledPlacesPerSearch` | Number  | Maximum places per search keyword (0 = unlimited).                          | `50`              |
| `scrapePlaceDetailPage`   | Boolean | Fetch full details (reviews, images)? Slower but more data.               | `true`            |
| `scrapeContacts`          | Boolean | Visit website to find emails/social media? Much slower, may fail often.   | `true`            |
| `skipClosedPlaces`        | Boolean | Ignore permanently closed businesses?                                       | `false`           |
| `maxImages`               | Number  | Max images per place (0 = none).                                            | `5`               |
| `maxReviews`              | Number  | Max reviews per place (0 = none).                                           | `5`               |
| `proxyConfig`             | Object  | Proxy settings (less critical for small local runs, see Apify docs).      | See file          |

*(Refer to [`INPUT_SCHEMA.json`](INPUT_SCHEMA.json) for all options)*

## 📊 Output Data

Scraped data is saved in JSON format within the `apify_storage/datasets/default/` directory. Each JSON file represents one scraped place and typically includes:

-   Business name, category, address, phone, website
-   Coordinates (latitude, longitude)
-   Rating, review count, reviews (if requested)
-   Operating hours, business status
-   Images (URLs, if requested)
-   Extracted emails and social media links (if requested)

## ⚠️ Disclaimer

Web scraping can be resource-intensive and may violate the terms of service of websites like Google Maps. Use responsibly and ethically. This tool is provided for educational purposes. Ensure your usage complies with all applicable laws and Google's terms. Frequent, large-scale scraping without proxies may lead to IP blocks.