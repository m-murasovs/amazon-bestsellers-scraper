const Apify = require('apify');

const { log } = Apify.utils;
const { getItems } = require('./getItems.js');
// const { saveItem } = require('./utils.js');

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
            log.info(`Processing: ${title}, URL: ${request.url}`);

            // Enqueue category pages on the Best Sellers homepage
            await Apify.utils.enqueueLinks({
                page,
                requestQueue,
                selector: 'div > ul > ul > li > a',
                transformRequestFunction: (req) => {
                    req.userData.detailPage = true;
                    req.userData.crawlDepth = 1;
                    return req;
                },
            });

            const results = {
                category: title,
                categoryUrl: request.url,
                items: {},
            };

            if (request.userData.detailPage && request.userData.crawlDepth === 1) {
                await getItems(page, results, request);

                // go to page 2
                const nextPage = await page.waitFor('li.a-last > a');
                await nextPage.click();
                await page.waitForNavigation({ waitUntil: 'load' });
                await getItems(page, results, request);
            }

            await Apify.pushData(results);

            // await saveItem(results, input, env.defaultDatasetId, session);
        },
        maxRequestsPerCrawl: 0,
        maxRequestRetries: 3,
    });

    await crawler.run();
    log.info('Crawl complete.');
});
