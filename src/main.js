const Apify = require('apify');

const { log } = Apify.utils;
const { saveItem } = require('./utils.js');

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    const input = await Apify.getValue('INPUT');
    const env = await Apify.getEnv();
    // Best Sellers home page where category links are
    const domain = input.domain === 'amazon.co.uk' ? 'https://www.amazon.co.uk/Best-Sellers/zgbs/' : 'https://www.amazon.com/Best-Sellers/zgbs/';
    await requestQueue.addRequest({ url: domain });

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
        handlePageFunction: async ({ request, page, session }) => {
            log.info(`Processing: ${await page.title()}, URL: ${request.url}`);

            if (request.userData.detailPage) {
                // get category name
                const title = await page.title();

                // Scrape all items that match the selector
                const itemsObj = await page.$$eval('div.p13n-sc-truncated', prods => prods.map(prod => prod.innerHTML));

                const pricesObj = await page.$$eval('span.p13n-sc-price', price => price.map(el => el.innerHTML));

                const urlsObj = await page.$$eval('span.aok-inline-block > a.a-link-normal', link => link.map(url => url.href));

                const imgsObj = await page.$$eval('a.a-link-normal > span > div.a-section > img', link => link.map(url => url.src));

                // Get rid of duplicate URLs (couldn't avoid scraping them)
                const urlsArr = [];
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

                // Add scraped items to results
                log.info('Creating results...');
                for (let i = 0; i < Object.keys(itemsObj).length; i++) {
                    results.items[i] = {
                        name: itemsObj[i],
                        price: pricesObj[i],
                        url: urlsArr[i],
                        thumbnail: imgsObj[i],
                    };
                }
                await saveItem(results, input, env.defaultDatasetId, session);
            }
            // if (!request.userData.detailPage) {
            // Enqueue category pages on the Best Sellers homepage
            await Apify.utils.enqueueLinks({
                page,
                requestQueue,
                selector: 'ul > ul > li > a',
                transformRequestFunction: (req) => {
                    req.userData.detailPage = true;
                    return req;
                },
                // To return all 100 results, I
                // Need to find a regex that has the request.url with '/ref=zg_bs_pg_2?_encoding=UTF8&pg=2' at the end.
                // pseudoUrls: ['http[s?]://www.amazon.[.*]/Best-Sellers[.*]'],
            });
            // }
        },
        maxRequestsPerCrawl: input.maxResults,
        maxConcurrency: 10,
        maxRequestRetries: 3,
    });

    await crawler.run();
    log.info('Crawl complete.');
});
