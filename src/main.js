const Apify = require('apify');

const { log } = Apify.utils;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();

    // Best Sellers home page where category links are
    const baseUrl = ['https://www.amazon.com/Best-Sellers/zgbs/'];
    const requestList = await Apify.openRequestList('categories', baseUrl);

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
            log.info('Processing:', request.url);

            if (request.userData.detailPage) {
                // get category name
                const title = await page.title();
                // Info for the best selling itemsObj
                // TODO: deal with itemsObj that are not found
                // TODO: add images
                const itemsObj = await page.$$eval('div.p13n-sc-truncated', prods => prods.map(prod => prod.innerHTML));
                const pricesObj = await page.$$eval('span.p13n-sc-price', price => price.map(el => el.innerHTML));
                const urlsObj = await page.$$eval('span.aok-inline-block > a.a-link-normal', link => link.map(url => url.href));

                // Transform the scraped objects into arrays
                const itemsArr = [];
                const pricesArr = [];
                const urlsArr = [];
                for (const product of itemsObj) itemsArr.push(product);
                for (const price of pricesObj) pricesArr.push(price);
                for (const link of urlsObj) {
                    if (!urlsArr.includes(link)) {
                        urlsArr.push(link);
                    }
                }

                const results = {
                    category: title,
                    categoryUrl: request.url,
                    items: {},
                };
                // Add scraped items into the results array
                for (let i = 0; i < itemsArr.length; i++) {
                    results.items[i] = {
                        name: itemsArr[i],
                        price: pricesArr[i],
                        url: urlsArr[i],
                    };
                }

                await Apify.pushData(results);
            }

            // Enqueue category pages on the Best Sellers homepage
            if (!request.userData.detailPage) {
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'ul > li > a',
                    transformRequestFunction: req => {
                        req.userData.detailPage = true;
                        return req;
                    },
                    pseudoUrls: ['http[s?]://www.amazon.com/Best-Sellers[.*]'],
                });
            }
        },
        maxRequestsPerCrawl: 40,
        maxConcurrency: 10,
    });

    await crawler.run();
});
