const Apify = require('apify');

const { log } = Apify.utils;
const { getItems } = require('./getItems.js');
const { saveItem } = require('./utils.js');

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    const input = await Apify.getValue('INPUT');
    const env = await Apify.getEnv();
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
            log.info(`Processing: ${title}, URL: ${request.url}`);

            // Enqueue category pages on the Best Sellers homepage
            await Apify.utils.enqueueLinks({
                page,
                requestQueue,
                selector: 'div > ul > ul > li > a',
                transformRequestFunction: (req) => {
                    req.userData.detailPage = true;
                    return req;
                },
            });

            const results = {
                category: title,
                categoryUrl: request.url,
                items: {},
            };

            if (request.userData.detailPage) {
                await getItems(page, results);
                // return results;
            }

            await Apify.pushData(results);

            // await saveItem(results, input, env.defaultDatasetId, session);
        },
        maxRequestsPerCrawl: 0,
        // remove when done
        maxConcurrency: 10,
        maxRequestRetries: 3,
    });

    await crawler.run();
    log.info('Crawl complete.');
});
