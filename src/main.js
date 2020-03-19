const Apify = require('apify');

const { log } = Apify.utils;
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
        handlePageFunction: async ({ request, page, session }) => {
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
                // For now, don't need maxResult, so don't need this
                // await saveItem(results, input, env.defaultDatasetId, session);
                await Apify.pushData(results);
            }
        },
        maxRequestsPerCrawl: 0,
        // remove when done, as the platform doesn't need it
        maxConcurrency: 10,
        maxRequestRetries: 3,
    });

    await crawler.run();
    log.info('Crawl complete.');
});
