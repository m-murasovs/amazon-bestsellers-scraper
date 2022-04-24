const Apify = require('apify');
const cheerio = require('cheerio');

const { LABEL } = require('./consts');
const { handleHomepage, handleDetailPage } = require('./routes.js');
const { validateLoadedPage, initializeRequestQueue, enqueueNextCategoryLevel, validateInput } = require('./utils');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const input = await Apify.getValue('INPUT');
    validateInput(input);

    const {
        proxy,
        domain,
        categoryUrls = [],
        depthOfCrawl: desiredDepth = 1
    } = input;

    const requestQueue = await initializeRequestQueue(categoryUrls, domain, desiredDepth);
    const proxyConfiguration = await Apify.createProxyConfiguration(proxy);

    const crawler = new Apify.PuppeteerCrawler({
        maxRequestRetries: 15,
        maxConcurrency: 10,
        requestQueue,
        navigationTimeoutSecs: 240,
        handlePageTimeoutSecs: 180,
        proxyConfiguration,
        browserPoolOptions: {
            useFingerprints: true,
        },
        launchContext: {
            useChrome: true,
            launchOptions: {
                headless: false,
            },
        },
        preNavigationHooks: [
            async (_, gotoOptions) => {
                // default is sometimes super slow & times out while navigating, domcontentloaded seems to be enough
                gotoOptions.waitUntil = 'domcontentloaded';
            },
        ],
        useSessionPool: true,
        handlePageFunction: async (context) => {
            const { page, request: { url, userData }, response, session } = context;
            const { detailPage, currentDepth, desiredDepth } = userData;

            const title = await page.title();
            const html = await page.content();
            const $ = cheerio.load(html);

            await validateLoadedPage(response, session, html);

            log.info(`Processing: ${title}`, { url, detailPage, currentDepth });

            // Handle homepage or bestseller's detail page
            if (detailPage) {
                const pageData = { category: title, categoryUrl: url };
                const label = $('.a-dynamic-image').length > 0 ? LABEL.NEW : LABEL.OLD;

                await handleDetailPage(page, pageData, label);
            } else {
                await handleHomepage(page, requestQueue);
            }

            // Enqueue next subcategory level
            if (currentDepth < desiredDepth) {
                log.info(`Enqueuing next category level of depth ${currentDepth + 1}`);
                await enqueueNextCategoryLevel(page, requestQueue, currentDepth + 1);
            }

            // Log number of pending URLs (works only locally)
            // log.info(`Pending URLs: ${requestQueue.pendingCount}`);
        },
    });

    log.info('Starting the crawl...');
    await crawler.run();
    log.info('Crawl finished');
});
