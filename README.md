# Amazon Best Sellers Crawler

The actor crawls the Amazon Best Sellers categories and extracts the 50 top-selling items. It extracts the item's name, price, URL, and its thumbnail image.

The actor can currently extract the global (amazon.com) and the UK Best Sellers pages. 

## Sample result

```json
{
    "category": "Amazon.co.uk Best Sellers: The most popular items in Books",
  "categoryUrl": "https://www.amazon.co.uk/Best-Sellers-Books/zgbs/books/ref=zg_bs_nav_0/261-6986927-7102013",
  "items": {
    "0": {
      "name": "The Mirror and the Light (The Wolf Hall Trilogy)",
      "price": "£15.49",
      "url": "https://www.amazon.co.uk/Mirror-Light-Wolf-Hall-Trilogy/dp/0007480997/ref=zg_bs_books_1?_encoding=UTF8&psc=1&refRID=3PNZSWBH3A0H1QCWYPP6",
      "thumbnail": "https://images-eu.ssl-images-amazon.com/images/I/91-UvTTh4lL._AC_UL200_SR200,200_.jpg"
    },
}
```
## Input

![Actor input screen](src/img/INPUT.png)

The actor is set to crawl [amazon.com](https://www.amazon.com/Best-Sellers/zgbs/) by default. Click on the drop-down menu if you would like to crawl the [UK domain](https://www.amazon.co.uk/Best-Sellers/zgbs/).

To limit the number of results that are extracted, set the **Number of options** value to the number of results you need. Otherwise, keep it blank or at 0. This setting is not 100% accurate. Due to concurrent crawling of pages, one or two extra results per crawl will be returned.

## Proxy

For the actor to function properly, proxies are required. It is not recommended to run the actor on a free account for more than obtaining sample results. If you plan to run the actor for more than a few results, subscribe to the Apify platform and receive access to a large pool of proxies.

## Settings

![Settings screen](src/img/SETTINGS.png)

Please ensure that Memory is set to at least **1024 MB** to ensure that the crawler has enough power to complete the task in a timely manner. If your machine allows, feel free to increase the memory allocation for more speed.

## During the run

During the run, the actor will output messages notifying you of which page is being extracted. When the items are extracted, the actor will notify you that they are being added to the dataset. 

In case of an error, the actor will complete its run immediately, without adding any data to the dataset.

When it is finished, the actor will display a **Crawl complete.** message.

## Documentation reference

For more information on the Apify platform, Apify actors, and the Apify CLI, please consult the links below.

- [Apify SDK](https://sdk.apify.com/)
- [Apify Actor documentation](https://docs.apify.com/actor)
- [Apify CLI](https://docs.apify.com/cli)
