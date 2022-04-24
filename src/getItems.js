/* eslint-disable max-len */
const Apify = require('apify');

const { puppeteer } = Apify.utils;
const { LABEL } = require('./consts');
const { parsePrice, parseCurrency } = require('./utils');

async function waitForNewPageToLoad(page, selector) {
    // need to wait after page 1
    await page.waitForSelector(selector);

    for (let i = 1; i < 5; i++) {
        await puppeteer.infiniteScroll(page, { scrollDownAndUp: true, timeoutSecs: i, waitForSecs: 5 });
        await page.waitForTimeout(5000);
    }
}

async function getNewPageDesignItems(page, pageData) {
    const ITEM_SELECTOR = '#gridItemRoot .zg-grid-general-faceout';

    await waitForNewPageToLoad(page, ITEM_SELECTOR);
    const allItems = await page.$$(ITEM_SELECTOR);

    const resultItems = [];

    for (const [_index, item] of allItems.entries()) {
        const obj = { ...pageData };

        obj.name = await item.$eval('div > a:nth-child(2) > span > div', (el) => el.innerHTML);

        // format: '£8.99', sometimes with additional details
        const soloPriceExists = (await item.$('.a-color-price')) || null;
        const soloPriceText = soloPriceExists ? await item.$eval('.a-color-price', (el) => el.innerText) : null;

        // format: '2 offers from £4.99', '.p13n-sc-price' selector targets £4.99 price only
        const offersPriceExists = (await item.$('.p13n-sc-price')) || null;
        const offersPriceText = offersPriceExists ? await item.$eval('.p13n-sc-price', (el) => el.innerText) : null;

        // format: '22 offers from £13.79', store 1 offer as default if no offers are mentioned explicitly
        const offersText = offersPriceExists
            ? await item.$eval('.a-link-normal span.a-color-secondary', (el) => el.innerText)
            : '1';

        const priceText = soloPriceText || offersPriceText;

        obj.price = parsePrice(priceText);
        obj.currency = parseCurrency(priceText);
        obj.numberOfOffers = parseInt(offersText, 10);

        obj.url = await item.$eval('div > a.a-link-normal:nth-of-type(1)', (url) => url.href);
        // p13n-sc-dynamic-image
        // const thumbSelector = await item.$('div[class*="_p13n-sc-dynamic-image"]') || await item.$('div[class*="_p13n-zg-list-grid-desktop_maskStyle"] > img') || '';
        obj.thumbnail = await item.$eval('img', (url) => url.src);

        resultItems.push(obj);
    }

    return resultItems;
}

async function getItems(page, pageData, label) {
    if (label === LABEL.NEW) {
        const items = await getNewPageDesignItems(page, pageData);
        return items;
    }

    const itemsObj = await page.$$eval('div.p13n-sc-truncated', prods => prods.map((prod) => prod.innerHTML));

    const pricesObj = await page.$$eval('span.p13n-sc-price', price => price.map((el) => el.innerHTML));

    const urlsObj = await page.$$eval('span.aok-inline-block > a.a-link-normal', (link) => link.map((url) => url.href));

    const imgsObj = await page.$$eval('a.a-link-normal > span > div.a-section > img', (link) => link.map((url) => url.src));

    // Get rid of duplicate URLs (couldn't avoid scraping them)
    const urlsArr = [...new Set(urlsObj)];

    const items = Object.keys(itemsObj).map((_key, i) => {
        return {
            ...pageData,
            name: itemsObj[i],
            price: parsePrice(pricesObj[i]),
            currency: parseCurrency(pricesObj[i]),
            numberOfOffers: 1, // hardcoded for now, couldn't inspect this old selectors layout
            url: urlsArr[i],
            thumbnail: imgsObj[i],
        };
    })

    return items;
}

module.exports = { getItems };
