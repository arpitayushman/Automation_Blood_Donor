const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');
let xlsx = require("xlsx");
// const { dirname } = require("path/posix");
const pdfkit = require('pdfkit');
let page;
let mainCity = "New Delhi";
let firstNearCity = "Gurgaon"
let secondNearCity = "Faridabad";
let bloodGroup = "O+";
let FolderNAME = (mainCity+"_"+firstNearCity+"_"+secondNearCity);
(async function fn() {
    let browser = await puppeteer.launch({
        headless: false, defaultViewport: null,
        args: ["--start-maximized"],
    })
    page = await browser.newPage();
    await page.goto("http://blooddonors.in/search.php");
    await page.waitForSelector('body > div.container > div:nth-child(1) > form > div.col-md-4 > select');
    await page.click('body > div.container > div:nth-child(1) > form > div.col-md-4 > select');
    let nameArr = [];
    let bloodGroupArr = [];
    let placeArr = [];
    let firstNumberArr = [];
    let secondNumberArr = [];
    let t = 3;
    for (let k = 1; k <= 3; k++) {
        if (k == 1) {
            cityName = mainCity;
        }
        if (k == 2) {
            cityName = firstNearCity;
        } if(k==3){
            cityName = secondNearCity;
        }
        await page.click('body > div.container > div:nth-child(1) > form > div.col-md-4 > select');
        console.log("Getting Data for ", cityName);
        for (let i = 0; i < cityName.length; i++) {
            await page.keyboard.press(cityName[i], {delay:500});
        }
        await page.click('body > div.container > div:nth-child(1) > form > div:nth-child(4) > select');
        console.log("Getting info");
        await page.waitForTimeout(2000);
        for (let i = 0; i < bloodGroup.length; i++) {
            await page.keyboard.press(bloodGroup[i]);
        }
        console.log("Please wait while we get the data");
        await page.waitForTimeout(2000);
        await page.click('.btn.btn-primary.btn-block.btn-flat');
        await page.waitForSelector("body > div.container > div:nth-child(3) > div.box.center > ul > li:nth-child(3) > a");
        let rowList = await page.$$(".container .col-md-12 .col-md-12");
        console.log("Almost there!!");
        await page.waitForTimeout(2000);
        console.log("Total availabe donors: ", rowList.length);

        //body > div.container > div:nth-child(3) > div:nth-child(1) > div > div:nth-child(1)

        for (let i = 1; i <= rowList.length; i++) {
            let name = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div:nth-child(1)", el => el.textContent);
            nameArr.push(name);
            let bgp = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div.col-md-1", el => el.textContent);
            bloodGroupArr.push(bgp);
            let place = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div:nth-child(3)", el => el.textContent);
            placeArr.push(place);
            let firstNumber = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div.col-md-2", el => el.textContent);
            if (firstNumber == "") {
                firstNumberArr.push("NA");
            } else {
                firstNumberArr.push(firstNumber);
            }
            let secondNumber = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div:nth-child(5)", el => el.textContent);
            if (secondNumber == "") {
                secondNumberArr.push("NA");
            } else {
                secondNumberArr.push(firstNumber);
            }
        //     console.log("Waiting");
        // await page.waitForTimeout(2000);
        }
    }
    // console.log(`Name  BloodGroup  Location  Mob.No  PhoneNo`)
    // for(let l = 0;l<nameArr.length;l++){

        // }
        // console.table(placeArr);
        
        let aoa = [[],[],[],[],[]];
        aoa.push(nameArr);
        aoa.push(bloodGroupArr);
        aoa.push(placeArr);
        aoa.push(firstNumberArr);
        aoa.push(secondNumberArr);
        // for(let tab=0;tab<aoa.length;tab++){
        //     for(let l=0;l<nameArr.length;l++){

        //         console.log(`${nameArr[l]}  ${bloodGroupArr[l]}  ${placeArr[l]}  ${firstNumberArr[l]}   ${secondNumberArr[l]}`)
        //     }
        // }
        let folderpath = path.join(__dirname, FolderNAME);
        dirCreator(folderpath);
        let filePath = path.join(folderpath,FolderNAME+".pdf");
        let text = JSON.stringify(aoa);
        let pdfDoc = new pdfkit();
        pdfDoc.pipe(fs.createWriteStream(filePath));
        pdfDoc.text(text);
        pdfDoc.end();

})();
function dirCreator(folderpath){
    if(fs.existsSync(folderpath)==false){
        fs.mkdirSync(folderpath);
    }
} 