# Amazon Best Sellers Crawler

The Actor crawls the Amazon Best Sellers categories and extracts the 100 top selling items. It extracts the item's name, price, URL, and its thumbnail image.

The Actor can currently extract the .com, .co.uk, .de, .fr, .es, and .it domains.  If you would like to add support for another domain, please get in touch or edit the source code [yourself](https://github.com/m-murasovs/amazon-bestsellers-scraper).

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
}
```
## Input

The Actor is set to crawl [amazon.com](https://www.amazon.com/Best-Sellers/zgbs/) by default. Click on the drop-down menu if you would like to crawl another domain. Currently, the .co.uk, .de, .fr, .es, and .it domains are supported. 

To limit the number of results that are extracted, set the **Depth of crawl** value to the number of subcategories you would like to extract. 

Amazon Best Sellers includes 37 main categories. Several of these have another two levels of subcategorisation. Setting a crawl depth of 2 extracts 556 pages. A crawl depth of 3 extracts upward of 1600 pages.

## Proxy configuration

The **Proxy configuration** (`proxyConfiguration`) option enables you to set
proxies that will be used by the scraper in order to prevent its detection by target websites.
You can use both [Apify Proxy](https://apify.com/proxy)
as well as custom HTTP or SOCKS5 proxy servers.

The following table lists the available options of the proxy configuration setting:

<table class="table table-bordered table-condensed">
    <tbody>
    <tr>
        <th><b>None</b></td>
        <td>
            The scraper will not use any proxies.
            All web pages will be loaded directly from IP addresses of Apify servers running on Amazon Web Services.
        </td>
    </tr>
    <tr>
        <th><b>Apify&nbsp;Proxy&nbsp;(automatic)</b></td>
        <td>
            The scraper will load all web pages using <a href="https://apify.com/proxy">Apify Proxy</a>
            in the automatic mode. In this mode, the proxy uses all proxy groups
            that are available to the user, and for each new web page it automatically selects the proxy
            that hasn't been used in the longest time for the specific hostname,
            in order to reduce the chance of detection by the website.
            You can view the list of available proxy groups
            on the <a href="https://my.apify.com/proxy" target="_blank" rel="noopener">Proxy</a> page in the app.
        </td>
    </tr>
    <tr>
        <th><b>Apify&nbsp;Proxy&nbsp;(selected&nbsp;groups)</b></td>
        <td>
            The scraper will load all web pages using <a href="https://apify.com/proxy">Apify Proxy</a>
            with specific groups of target proxy servers.
        </td>
    </tr>
    <tr>
        <th><b>Custom&nbsp;proxies</b></td>
        <td>
            <p>
            The scraper will use a custom list of proxy servers.
            The proxies must be specified in the <code>scheme://user:password@host:port</code> format,
            multiple proxies should be separated by a space or new line.
            The URL scheme can be either <code>http</code> or <code>socks5</code>.
            User and password might be omitted, but the port must always be present.
            </p>
            <p>
                Example:
            </p>
            <pre><code class="language-none">http://bob:password@proxy1.example.com:8000
http://bob:password@proxy2.example.com:8000</code></pre>
        </td>
    </tr>
    </tbody>
</table>

The proxy configuration can be set programmatically when calling the actor using the API
by setting the `proxyConfiguration` field.
It accepts a JSON object with the following structure:

```javascript
{
    // Indicates whether to use Apify Proxy or not.
    "useApifyProxy": Boolean,

    // Array of Apify Proxy groups, only used if "useApifyProxy" is true.
    // If missing or null, Apify Proxy will use the automatic mode.
    "apifyProxyGroups": String[],

    // Array of custom proxy URLs, in "scheme://user:password@host:port" format.
    // If missing or null, custom proxies are not used.
    "proxyUrls": String[],
}
```

## Settings

Please ensure that Memory is set to at least **1024 MB** to ensure that the crawler has enough power to complete the task in a timely manner. If your machine allows, feel free to increase the memory allocation for more speed.

## During the run

During the run, the Actor will output messages notifying you of which page is being extracted. When the items are extracted, the Actor will notify you that they are being saved. 

Due to concurrent extraction of pages, these notifications may not be displayed in order.

The number of pending URLs is displayed throughout the run.

In case of an error, the Actor will complete its run immediately, without adding any data to the dataset.

When it is finished, the Actor will display a **Crawl complete.** message.

## CU usage

For every 100 pages scraped, the Actor will consume 0.6 Compute Units. This means that with 1 Compute Unit, you can scrape around 160 pages.

## Documentation reference

For more information on the Apify platform, Apify Actors, and the Apify CLI, please consult the links below.

- [Apify SDK](https://sdk.apify.com/)
- [Apify Actor documentation](https://docs.apify.com/actor)
- [Apify CLI](https://docs.apify.com/cli)
