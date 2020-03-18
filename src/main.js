const Apify = require('apify');

const { log } = Apify.utils;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();

    const baseUrl = [
        'https://www.amazon.com/Best-Sellers/zgbs/',
    ];

    const requestList = await Apify.openRequestList('categories', baseUrl);

    // const pseudoUrls = [new Apify.PseudoUrl('https://www.amazon.com/Best-Sellers[.*]')];

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
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
            console.log('Processing:', request.url);

            if (request.userData.detailPage) {
                // get category name
                const title = await page.title();
                // Info for the best selling items
                // TODO: deal with items that are not found
                const itemName = await page.$$eval('div.p13n-sc-truncated', el => el.innerHTML);
                const itemUrl = await page.$$eval('a.a-link-normal', el => el.href);
                const itemPrice = await page.$$eval('span.p13n-sc-price', el => el.innerHTML);

                const results = {
                    category: title,
                    categoryUrl: request.url,
                    items: {
                        item: itemName,
                        url: itemUrl,
                        price: itemPrice,
                    },
                };
                await Apify.pushData(results);
                console.log('RESULTS: ', results);
            }

            if (!request.userData.detailPage) {
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'ul > li > a',
                    transformRequestFunction: req => {
                        req.userData.detailPage = true;
                        return req;
                    },
                });
            }
        },
        maxRequestsPerCrawl: 10,
        maxConcurrency: 10,
    });

    await crawler.run();
});
