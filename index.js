const cheerio = require("cheerio")
const puppeteer = require("puppeteer")

let coinArrays = []

async function getDataFromCoinMarketCap () {
    try {

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
        })
        
        const page = await browser.newPage()

        await page.goto("https://coinmarketcap.com")

        await autoScroll(page)

        await page.screenshot({ path: "image.png",fullPage:true })

        const pageData = await page.evaluate(() => {
            return {
                html: document.documentElement.innerHTML,
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            }
        })
        const $ = cheerio.load(pageData.html)

        const elemSelector = $("table.cmc-table > tbody > tr")
        
        const keys = [
            'rank',
            'name',
            'ticker',
        ]

        $(elemSelector).each((parentIdx,parentElem) => {
            
            let keyIdx = 0
            let coinObj = {}
            if(parentIdx < 100) {
                $(parentElem).children().each((childIdx,childElem) => {
                    if(keyIdx <= 2) {
                        coinObj[keys[0]] = parentIdx + 1
                        coinObj[keys[1]] = $('.cmc-link > div > div > p:first-child ',$(childElem).html()).text()
                        coinObj[keys[2]] = $('.cmc-link > div > div > div > p',$(childElem).html()).text()
                        keyIdx++;
                    }
                })
                coinArrays.push(coinObj)
            }
        })
        
        await browser.close() 
        return coinArrays
        
    } catch(err) {
        console.log(err)
    }
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports.getData = getDataFromCoinMarketCap