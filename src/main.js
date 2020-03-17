const Apify = require('apify');

const { log } = Apify.utils;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: 'https://www.amazon.com/Best-Sellers/zgbs/' });
    const pseudoUrls = [new Apify.PseudoUrl('https://www.amazon.com/Best-Sellers[.*]')];

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
            const title = await page.title();
            log.info(`The title of ${request.url} is: ${title}`);
            await Apify.utils.enqueueLinks({
                page,
                selector: 'li > a',
                pseudoUrls,
                requestQueue,
            });
        },
        maxRequestsPerCrawl: 10,
        maxConcurrency: 10,
    });

    await crawler.run();
});
