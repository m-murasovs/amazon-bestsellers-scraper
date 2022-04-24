const Apify = require('apify');
const { LABEL } = require('./consts');
const { getItems } = require('./getItems');

const { utils: { log, puppeteer, enqueueLinks } } = Apify;

/**
 * Enqueues main category pages on the Best Sellers homepage.
 */
async function handleHomepage(page, requestQueue) {
    await enqueueLinks({
        page,
        requestQueue,
        selector: '[role="treeitem"] a',
        transformRequestFunction: (req) => {
            req.userData.detailPage = true;
            req.userData.depthOfCrawl = 1;
            return req;
        },
    });
}

/**
 * Scrapes items from from detail page and saves them into the dataset.
 */
 async function handleDetailPage(page, pageData, label) {
    const resultsArr = [];

    if (label === LABEL.NEW) {
        log.info('New Selectors Detected');
    }

    await puppeteer.injectJQuery(page);

    // Scrape page 1
    const firstPageResults = await getItems(page, pageData, label);
    resultsArr.push(...firstPageResults);

    // Go to page 2 and scrape
    let nextPage;
    try {
        nextPage = await page.waitForSelector('li.a-last > a');
    } catch (e) {
        log.error(`Could not extract second page - only one page returned. ${e}`);
    }

    if (nextPage) {
        await nextPage.click();
        await page.waitForNavigation();

        const secondPageResults = await getItems(page, pageData, label);
        resultsArr.push(...secondPageResults);
    }

    const results = resultsArr.map((result, i) => ({ position: i + 1, ...result }));

    await Apify.pushData(results);
    log.info(`Saved results from: ${await page.title()}`);
}

module.exports = { handleHomepage, handleDetailPage };