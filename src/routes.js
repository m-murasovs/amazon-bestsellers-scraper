const Apify = require('apify');
const { LABEL } = require('./consts');
const { getItems } = require('./getItems');
const { injectItemPositions } = require('./utils');

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
 async function handleDetailPage(request, page, pageData, label) {
    if (label === LABEL.NEW) {
        log.info('New Selectors Detected');
    }

    await puppeteer.injectJQuery(page);

    // Scrape page 1
    const firstPageResults = await getItems(request, page, pageData, label);
    await Apify.pushData(injectItemPositions(firstPageResults));

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

        const secondPageResults = await getItems(request, page, pageData, label);
        const positionOffset = firstPageResults.length;
        await Apify.pushData(injectItemPositions(secondPageResults, positionOffset));
    }

    log.info(`Saved results from: ${await page.title()}`);
}

module.exports = { handleHomepage, handleDetailPage };