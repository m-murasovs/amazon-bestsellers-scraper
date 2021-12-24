/* eslint-disable max-len */
const Apify = require('apify');

const { log } = Apify.utils;
const { LABEL } = require('./consts');

async function getItems(pageObj, pageData, resultsArr, label) {
    if (label === LABEL.NEW) {
        // need to wait after page 1
        await pageObj.waitForSelector('.zg-grid-general-faceout');
        // 5 seconds goes right to the next page button, if you remove t/o secs and scroll to bottom you will miss the content
        await Apify.utils.puppeteer.infiniteScroll(pageObj, { scrollDownAndUp: true, timeoutSecs: 2, waitForSecs: 10 });
        await Apify.utils.puppeteer.infiniteScroll(pageObj, { scrollDownAndUp: true, timeoutSecs: 6, waitForSecs: 10 });

        const allItems = await pageObj.$$('.zg-grid-general-faceout');

        for (const [index, item] of allItems.entries()) {
            const obj = {
                ...pageData,
                ID: index,
            };
            obj.name = await item.$eval('div > a.a-link-normal:nth-of-type(2) > span > div', el => el.innerHTML);
            const priceExists = (await item.$('.a-color-price')) || null;
            obj.price = priceExists ? await item.$eval('.a-color-price', el => el.innerText) : null;
            obj.url = await item.$eval('div > a.a-link-normal:nth-of-type(1)', url => url.href);
            obj.thumbnail = await item.$eval('div[class*="_p13n-zg-list-grid-desktop_maskStyle"] > img', url => url.src);
            resultsArr.push(obj);
        }
        return;
    }
    const itemsObj = await pageObj.$$eval('div.p13n-sc-truncated', prods => prods.map(prod => prod.innerHTML));

    const pricesObj = await pageObj.$$eval('span.p13n-sc-price', price => price.map(el => el.innerHTML));

    const urlsObj = await pageObj.$$eval('span.aok-inline-block > a.a-link-normal', link => link.map(url => url.href));

    const imgsObj = await pageObj.$$eval('a.a-link-normal > span > div.a-section > img', link => link.map(url => url.src));

    // Scrape all items that match the selector


    // Get rid of duplicate URLs (couldn't avoid scraping them)
    const urlsArr = [];
    for (const link of urlsObj) {
        if (!urlsArr.includes(link)) {
            urlsArr.push(link);
        }
    }

    // Add scraped items to results array
    for (let i = 0; i < Object.keys(itemsObj).length; i++) {
        resultsArr.push({
            ...pageData,
            ID: resultsArr.length,
            name: itemsObj[i],
            price: pricesObj[i],
            url: urlsArr[i],
            thumbnail: imgsObj[i],
        });
    }
}

async function scrapeDetailsPage(pageObj, pageData, label) {
    const resultsArr = [];
    // Scrape page 1
    await getItems(pageObj, pageData, resultsArr, label);
    // Go to page 2 and scrape
    let nextPage;
    try {
        nextPage = await pageObj.waitForSelector('li.a-last > a');
    } catch (e) {
        log.error(`Could not extract second page - only one page returned. ${e}`);
    }
    if (nextPage) {
        await nextPage.click();
        await pageObj.waitForNavigation();
        await getItems(pageObj, pageData, resultsArr, label);
        await Apify.pushData(resultsArr);
        log.info(`Saving results from ${await pageObj.title()}`);
    }
}

module.exports = { scrapeDetailsPage };
