const Apify = require('apify');

const { log } = Apify.utils;

async function getItems(pageObj, resultsArr) {
    // Scrape all items that match the selector
    const itemsObj = await pageObj.$$eval('div.p13n-sc-truncated', prods => prods.map(prod => prod.innerHTML));

    const pricesObj = await pageObj.$$eval('span.p13n-sc-price', price => price.map(el => el.innerHTML));

    const urlsObj = await pageObj.$$eval('span.aok-inline-block > a.a-link-normal', link => link.map(url => url.href));

    const imgsObj = await pageObj.$$eval('a.a-link-normal > span > div.a-section > img', link => link.map(url => url.src));

    // Get rid of duplicate URLs (couldn't avoid scraping them)
    const urlsArr = [];
    for (const link of urlsObj) {
        if (!urlsArr.includes(link)) {
            urlsArr.push(link);
        }
    }

    // Add scraped items to results array
    for (let i = 0; i < Object.keys(itemsObj).length; i++) {
        resultsArr.items.push({
            ID: resultsArr.items.length,
            name: itemsObj[i],
            price: pricesObj[i],
            url: urlsArr[i],
            thumbnail: imgsObj[i],
        });
    }
}

async function scrapeDetailsPage(req, pageObj, resultsArr) {
    if (req.userData.detailPage) {
        // Scrape page 1
        await getItems(pageObj, resultsArr, req);
        // Go to page 2 and scrape
        const nextPage = await pageObj.waitFor('li.a-last > a');
        await nextPage.click();
        await pageObj.waitForNavigation();
        await getItems(pageObj, resultsArr, req);
        await Apify.pushData(resultsArr);
        log.info('Saving results...');
    }
}

module.exports = { scrapeDetailsPage };
