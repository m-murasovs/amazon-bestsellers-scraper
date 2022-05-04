/* eslint-disable max-len */
const Apify = require('apify');
const { load } = require('cheerio');

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

async function getNewPageDesignItems(request, page, pageData) {
    const ITEM_SELECTOR = '#gridItemRoot .zg-grid-general-faceout';
    await waitForNewPageToLoad(page, ITEM_SELECTOR);

    const $ = load(await page.content());

    const resultItems = [];

    $(ITEM_SELECTOR).each((_index, element) => {
        const obj = { ...pageData };

        obj.name = $(element).find('div > a:nth-child(2) > span > div').html();

        // format: '£8.99', sometimes with additional details
        const soloPriceText = $(element).find('.a-color-price').text() || null;

        // format: '2 offers from £4.99', '.p13n-sc-price' selector targets £4.99 price only
        const offersPriceText = $(element).find('.p13n-sc-price').text() || null;

        // format: '22 offers from £13.79', store 1 offer as default if no offers are mentioned explicitly
        const offersText = offersPriceText
            ? $(element).find('.a-link-normal span.a-color-secondary').text()
            : '1';

        const priceText = soloPriceText || offersPriceText;

        obj.price = parsePrice(priceText);
        obj.currency = parseCurrency(priceText);
        obj.numberOfOffers = parseInt(offersText, 10);

        const foundUrl = $(element).find('div > a.a-link-normal:nth-of-type(1)').attr('href');
        obj.url = foundUrl ? `https://${new URL(request.url).host}${foundUrl}` : null;
        // p13n-sc-dynamic-image
        // const thumbSelector = await item.$('div[class*="_p13n-sc-dynamic-image"]') || await item.$('div[class*="_p13n-zg-list-grid-desktop_maskStyle"] > img') || '';
        obj.thumbnail = $(element).find('img').attr('src');

        resultItems.push(obj);
    });

    return resultItems;
}

async function getItems(request, page, pageData, label) {
    if (label === LABEL.NEW) {
        const items = await getNewPageDesignItems(request, page, pageData);
        return items;
    }

    const $ = load(await page.content());

    const itemsObj = $('div.p13n-sc-truncated').html();

    const pricesObj = $('span.p13n-sc-price').html();

    const urlsObj = $('span.aok-inline-block > a.a-link-normal').attr('href');

    const imgsObj = $('a.a-link-normal > span > div.a-section > img').attr('src');

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
