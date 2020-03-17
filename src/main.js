const Apify = require('apify');

const { log } = Apify.utils;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: 'https://www.amazon.com/Best-Sellers/zgbs/amazon-devices/ref=zg_bs_nav_0' });
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
            // get category name
            const title = await page.title();
            log.info(`Processing... ${title}`);

            // Info for the best selling items
            // TODO: deal with items that are not found
            const itemName = await page.$eval('div.p13n-sc-truncated', el => el.innerHTML);
            const itemUrl = await page.$eval('a.a-link-normal', el => el.href);
            const itemPrice = await page.$eval('span.p13n-sc-price', el => el.innerHTML);


            const results = {
                category: title,
                items: {
                    item: itemName,
                    url: itemUrl,
                    price: itemPrice,
                },
            };

            console.log(results);

            await Apify.utils.enqueueLinks({
                page,
                selector: 'li > a',
                pseudoUrls,
                requestQueue,
            });
        },
        maxRequestsPerCrawl: 5,
        maxConcurrency: 10,
    });

    await crawler.run();
});
