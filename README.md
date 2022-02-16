## What does Amazon Best Sellers Scraper do?
Our free Amazon Best Sellers Scraper allows you to scrape the 100 top-selling items on Amazon. You can extract the names, prices, URLs, and thumbnail images of the 100 best-selling items on Amazon.

The actor can currently extract from .com, .co.uk, .de, .fr, .es, and .it domains. If you would like to add support for another domain, please [get in touch](mailto:support@apify.com) or you can just [edit the source code yourself](https://github.com/m-murasovs/amazon-bestsellers-scraper).

If you would prefer a more general Amazon product or data scraper, you should try [Amazon Scraper](https://apify.com/vaclavrut/amazon-crawler).

## Why you should scrape Amazon Best Sellers
If you're web scraping Amazon for retail or market research, the Amazon [Best Sellers list](https://www.amazon.com/gp/help/customer/display.html?nodeId=525376) features the top-selling items across Amazon, which can tell you a lot about the top trends in [e-commerce](https://apify.com/industries/ecommerce-and-retail). Competing directly against these products can be difficult, but the Best Sellers list can be a source of inspiration for new products and help e-commerce retailers [stay ahead of the competition](https://apify.com/use-cases/price-comparison). Getting your item into the Best Sellers list and keeping it there is one of the surest ways to guarantee sales for your business. Once a product reaches the Best Sellers list, e-commerce retailers increasingly turn to [web scraping](https://apify.com/apify/web-scraper) to track up-and-coming products, and adjust their own products to compete.

## How much will it cost me to scrape Amazon Best Sellers?
For every 100 pages scraped, the actor will consume 0.6 compute units. This means that you can scrape around **160 pages** for 1 compute unit. That will cost you just **25 cents**. 

## Input settings
-   Domain you want to extract
-   Depth of extraction - how many subcategories you want to scrape
-   Proxy

## Tips
- By default, this Amazon scraper extracts the 37 top Best Seller subcategories. A deeper level of extraction can be added to allow you to scrape the top-selling items from the first level of the main categories' sub-divisions.

- The default depth of the crawl is limited to two subcategories. There is a way around this restriction. Start on the main category, scrape two departments. Then remove duplicate category URLs from there and feed them back into the scraper again.

- Make sure that memory is set to at least 1024 MB so the scraper will have enough power to complete the task in a timely manner. If your machine allows, feel free to increase the memory allocation for more speed.

## Proxy configuration
The proxy configuration (`proxyConfiguration`) option enables you to set proxies that will be used by the scraper in order to prevent its detection by target websites. You can use both [Apify Proxy](https://apify.com/proxy) and custom HTTP or SOCKS5 proxy servers.

The following table lists the available options of the proxy configuration setting:

**None**: The scraper will not use any proxies. All web pages will be loaded directly from IP addresses of Apify servers running on Amazon Web Services.

**Apify Proxy** **(automatic)**: 
The scraper will load all web pages using [Apify Proxy](https://apify.com/proxy) in automatic mode. In this mode, the proxy uses all proxy groups that are available to the user, and for each new web page it automatically selects the proxy that hasn't been used in the longest time for the specific hostname, in order to reduce the chance of detection by the website. You can view the list of available proxy groups on the [proxy](https://my.apify.com/proxy) page in the app.

**Apify Proxy** **(selected groups)**: The scraper will load all web pages using [Apify Proxy](https://apify.com/proxy) with specific groups of target proxy servers.

**Custom proxies**: The scraper will use a custom list of proxy servers. The proxies must be specified in the `scheme://user:password@host:port` format, multiple proxies should be separated by a space or new line. The URL scheme can be either HTTP or SOCKS5. User and password might be omitted, but the port must always be present.

## Results
The actor stores its result in the default [dataset](https://apify.com/docs/storage#dataset) associated with the actor run. You can export it from there to various formats, such as JSON, XML, CSV, or Excel.

The API will return results like this (in JSON format):

```json
{

"category":  "Amazon.co.uk Best Sellers: The most popular items in Books",

"categoryUrl":  "https://www.amazon.co.uk/Best-Sellers-Books/zgbs/books/ref=zg_bs_nav_0/261-6986927-7102013",

"items":  {

"0":  {

"name":  "The Mirror and the Light (The Wolf Hall Trilogy)",

"price":  "£15.49",

"url":  "https://www.amazon.co.uk/Mirror-Light-Wolf-Hall-Trilogy/dp/0007480997/ref=zg_bs_books_1?_encoding=UTF8&psc=1&refRID=3PNZSWBH3A0H1QCWYPP6",

"thumbnail":  "https://images-eu.ssl-images-amazon.com/images/I/91-UvTTh4lL._AC_UL200_SR200,200_.jpg"

},

}

}

```

The results can be downloaded using [get dataset items](https://www.apify.com/docs/api/v2#/reference/datasets/item-collection/get-items)

## During the run
- During the run, the actor will output messages notifying you of which page is being extracted. When the items are extracted, the actor will notify you that they are being saved.
- Due to concurrent extraction of pages, these notifications may not be displayed in order.
- In the event of an error, the actor will complete its run immediately, without adding any data to the dataset.
