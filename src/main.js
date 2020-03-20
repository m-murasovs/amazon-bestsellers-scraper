const Apify = require('apify');

const { log } = Apify.utils;
const { scrapeDetailsPage } = require('./getItems.js');

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    const input = await Apify.getValue('INPUT');
    // Select which domain to scrape
    await requestQueue.addRequest({ url: input.domain });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        launchPuppeteerOptions: {
            headless: true,
            stealth: true,
            useChrome: true,
            stealthOptions: {
                addPlugins: false,
                emulateWindowFrame: false,
                emulateWebGL: false,
                emulateConsoleDebug: false,
                addLanguage: false,
                hideWebDriver: true,
                hackPermissions: false,
                mockChrome: false,
                mockChromeInIframe: false,
                mockDeviceMemory: false,
            },
        },
        handlePageFunction: async ({ request, page }) => {
            // get and log category name
            const title = await page.title();
            log.info(`Processing: ${title}. URL: ${request.url}`);

            const results = {
                category: title,
                categoryUrl: request.url,
                items: [],
            };

            // Enqueue main category pages on the Best Sellers homepage
            if (!request.userData.detailPage) {
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'div > ul > ul > li > a',
                    transformRequestFunction: (req) => {
                        req.userData.detailPage = true;
                        req.userData.depthOfCrawl = 1;
                        return req;
                    },
                });
            }

            // Enqueue second subcategory level
            if (input.depthOfCrawl > 1 && request.userData.depthOfCrawl === 1) {
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'ul > ul > ul > li > a',
                    transformRequestFunction: (req) => {
                        req.userData.detailPage = true;
                        req.userData.depthOfCrawl = 2;
                        return req;
                    },
                });
            }

            // Enqueue 3rd subcategory level
            if (input.depthOfCrawl === 3 && request.userData.depthOfCrawl === 2) {
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'ul > ul > ul > li > a',
                    transformRequestFunction: (req) => {
                        req.userData.detailPage = true;
                        req.userData.depthOfCrawl = 3;
                        return req;
                    },
                });
            }
            // Log number of pending URLs
            log.info(`Pending URLs: ${requestQueue.pendingCount}`);

            // Scrape items from enqueued pages
            if (request.userData.detailPage) {
                await scrapeDetailsPage(page, results);
            }
        },
        maxRequestsPerCrawl: 0,
        maxRequestRetries: 2,
    });

    await crawler.run();
    log.info('Crawl complete.');
});
