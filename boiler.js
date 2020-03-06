const Apify = require('apify');

Apify.main(async () => {
	const sources = [
		'https://apify.com/store?category=TRAVEL',
		'https://apify.com/store?category=ECOMMERCE',
		'https://apify.com/store?category=ENTERTAINMENT'
	];

	const requestList = await Apify.openRequestList('categories', sources);
	const requestQueue = await Apify.openRequestQueue();

	const crawler = new Apify.CheerioCrawler({
		maxRequestsPerCrawl: 50,
		requestList,
		requestQueue,
		handlePageFunction: async ({ $, request }) => {
			console.log(`Processing ${request.url}`);

			// This is our new scraping logic.
			if (request.userData.detailPage) {
				const urlArr = request.url.split('/').slice(-2);

				const results = {
					url: request.url,
					uniqueIdentifier: urlArr.join('/'),
					owner: urlArr[0],
					title: $('header h1').text(),
					description: $('header p[class^=Text__Paragraph]').text(),
					lastRunDate: new Date(Number($('time').eq(1).attr('datetime'))),
					runCount: Number($('ul.stats li:nth-of-type(3)').text().match(/\d+/)[0])
				};
				console.log('RESULTS', results);
			}

			// Only enqueue new links from the category pages.
			if (!request.userData.detailPage) {
				await Apify.utils.enqueueLinks({
					$,
					requestQueue,
					selector: 'div.item > a',
					baseUrl: request.loadedUrl,
					transformRequestFunction: (req) => {
						req.userData.detailPage = true;
						return req;
					}
				});
			}
		}
	});

	await crawler.run();
});
