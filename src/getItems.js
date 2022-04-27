/* eslint-disable max-len */
const Apify = require('apify');
const { load } = require('cheerio');

const { log } = Apify.utils;
const { LABEL } = require('./consts');

async function getItems(request, pageObj, pageData, resultsArr, label) {
    if (label === LABEL.NEW) {
        // need to wait after page 1
        await pageObj.waitForSelector('.zg-grid-general-faceout');

        for (let i = 1; i < 5; i++) {
            await Apify.utils.puppeteer.infiniteScroll(pageObj, { scrollDownAndUp: true, timeoutSecs: i, waitForSecs: 5 });
            await pageObj.waitForTimeout(5000);
        }

        const $ = load(await pageObj.content());

        $('.zg-grid-general-faceout').each((index, element) => {
            const obj = {
                ...pageData,
                ID: index,
            };
            obj.name = $(element).find('div > a.a-link-normal:nth-of-type(2) > span > div').html();
            const priceExists = $(element).find('.a-color-price').text() || null;
            obj.price = priceExists ? $(element).find('.a-color-price').text() : null;
            const foundUrl = $(element).find('div > a.a-link-normal:nth-of-type(1)').attr('href');
            obj.url = foundUrl ? `https://${new URL(request.url).host}${foundUrl}` : null;
            // p13n-sc-dynamic-image
            // const thumbSelector = await element.$('div[class*="_p13n-sc-dynamic-image"]') || await element.$('div[class*="_p13n-zg-list-grid-desktop_maskStyle"] > img') || '';
            obj.thumbnail = $(element).find('img').attr('src');
            resultsArr.push(obj);
        });
        return;
    }

    const $ = load(await pageObj.content());

    const itemsObj = $('div.p13n-sc-truncated').html();

    const pricesObj = $('span.p13n-sc-price').html();

    const urlsObj = $('span.aok-inline-block > a.a-link-normal').attr('href');

    const imgsObj = $('a.a-link-normal > span > div.a-section > img').attr('src');

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

async function scrapeDetailsPage(request, pageObj, pageData, label) {
    const resultsArr = [];
    // Scrape page 1
    await getItems(request, pageObj, pageData, resultsArr, label);
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
        await getItems(request, pageObj, pageData, resultsArr, label);
        await Apify.pushData(resultsArr);
        log.info(`Saving results from ${await pageObj.title()}`);
    }
}

module.exports = { scrapeDetailsPage };
