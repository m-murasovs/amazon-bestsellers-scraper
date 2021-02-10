const Apify = require('apify');

const { log, enqueueLinks } = Apify.utils;
const { scrapeDetailsPage } = require('./getItems.js');

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    const input = await Apify.getValue('INPUT');

    const { proxy, domain, categoryUrls, depthOfCrawl } = input;
    // Select which domain to scrape
    if (categoryUrls && categoryUrls.length > 0) {
        for (const categoryRequest of categoryUrls) {
            await requestQueue.addRequest({ url: categoryRequest.url, userData: { detailPage: true, depthOfCrawl: 1 }}); // we it is not detail but it is how it was :)
        }
    } else {
        await requestQueue.addRequest({ url: domain });
    }

    const proxyConfiguration = await Apify.createProxyConfiguration(proxy);

    const crawler = new Apify.PuppeteerCrawler({
        maxRequestRetries: 15,
        maxConcurrency: 10, // To prevent too many browser activity
        requestQueue,
        proxyConfiguration,
        launchPuppeteerOptions: {
            headless: true,
            stealth: true,
            useChrome: false,
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
            log.info(`Processing: ${title}. Depth: ${request.userData.depthOfCrawl},`
                + `is detail page: ${request.userData.detailPage} URL: ${request.url}`);

            const results = {
                category: title,
                categoryUrl: request.url,
                items: [],
            };

            // Enqueue main category pages on the Best Sellers homepage
            if (!request.userData.detailPage) {
                await enqueueLinks({
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
            if (depthOfCrawl > 1 && request.userData.depthOfCrawl === 1) {
                await enqueueLinks({
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

            // ADD IN CASE MORE DATA IS NEEDED (ADDING 3RD SUBCATEGORY LEVEL)
            // // Enqueue 3rd subcategory level
            // if (depthOfCrawl === 3 && request.userData.depthOfCrawl === 2) {
            //     await enqueueLinks({
            //         page,
            //         requestQueue,
            //         selector: 'ul > ul > ul > li > a',
            //         transformRequestFunction: (req) => {
            //             req.userData.detailPage = true;
            //             req.userData.depthOfCrawl = 3;
            //             return req;
            //         },
            //     });
            // }

            // Log number of pending URLs (works only locally)
            // log.info(`Pending URLs: ${requestQueue.pendingCount}`);

            // Scrape items from enqueued pages
            if (request.userData.detailPage) {
                await scrapeDetailsPage(page, results);
            }
        },
    });

    await crawler.run();
    log.info('Crawl complete.');
});
