const Apify = require('apify');

const { log } = Apify.utils;

async function scrapePage(page, resultsArr, req) {
    if (req.userData.detailPage) {
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
            resultsArr.items[i] = {
                name: itemsObj[i],
                price: pricesObj[i],
                url: urlsArr[i],
                thumbnail: imgsObj[i],
            };
        }
    }
}

module.exports = { scrapePage };
