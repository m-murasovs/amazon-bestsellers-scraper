const Apify = require('apify');
// const { URL } = require('url');
const { log, enqueueLinks } = Apify.utils;

Apify.main(async () => {
    // Create a request queue instance and add a request
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: 'https://www.amazon.com/Best-Sellers/zgbs',
    });

    const handlePageFunction = async ({ request, $ }) => {
        const title = $('span[id^=productTitle] ').text();

        const price = $('span[id^=priceblock_ourprice]')
            .text()
            .replace(/(\r\n|\n|\r)/gm, '');

        const rating = `${$('span[data-hook^=rating-out-of-text]').text().trim()} stars`;

        const availability = $('div[id^=availability] span')
            .text()
            .replace(/(\r\n|\n|\r)/gm, '')
            .trim();

        // Find out how to address inconsistencies before using this
        // const description = $('ul li span').text();

        const results = {
            url: request.url,
            title: title.trim(),
            price: price.trim(),
            available: availability,
            rating: rating.trim(),
        };

        // not sure why this doesn't work when not a const - find out
        const enqueued = await enqueueLinks({
            $,
            requestQueue,
            selector: 'div.a-section a[href]',
            pseudoUrls: ['http[s?]://www.amazon.com[.*]/dp/[.*]'],
            baseUrl: request.loadedUrl,
        });

        await log.info(results);
        await Apify.pushData(results);
    };

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 10,
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});