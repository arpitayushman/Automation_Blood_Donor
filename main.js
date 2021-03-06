const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');
let xlsx = require("xlsx");
const pdfkit = require('pdfkit');
let mainCity = "New Delhi";//change this
let firstNearCity = "Gurgaon" //change this
let secondNearCity = "Faridabad"; //change this
let bloodGroup = "O+"; ////change this
let page;
let FolderNAME = (mainCity+"_"+firstNearCity+"_"+secondNearCity);
(async function fn() {
    console.log("Please wait while we initiate the search!!");
    let browser = await puppeteer.launch({
        headless: false, defaultViewport: null,
        args: ["--start-maximized"],
    })
    page = await browser.newPage();
    console.log("Search Initiated");
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
        // await page.waitForTimeout(500);
        for (let i = 0; i < bloodGroup.length; i++) {
            await page.keyboard.press(bloodGroup[i]);
        }
        console.log("Please wait while we get the data");
        await page.waitForTimeout(500);
        await page.click('.btn.btn-primary.btn-block.btn-flat');
        await page.waitForSelector("body > div.container > div:nth-child(3) > div.box.center > ul > li:nth-child(3) > a");
        let rowList = await page.$$(".container .col-md-12 .col-md-12");
        console.log("Almost there!!");
        await page.waitForTimeout(500);
        console.log("Total availabe donors: ", rowList.length);

        //body > div.container > div:nth-child(3) > div:nth-child(1) > div > div:nth-child(1)

        for (let i = 1; i <= rowList.length; i++) {
            let name = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div:nth-child(1)", el => el.textContent);
            arrayPusher(nameArr,name);
            let bgp = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div.col-md-1", el => el.textContent);
            arrayPusher(bloodGroupArr,bgp);
            let place = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div:nth-child(3)", el => el.textContent);
            arrayPusher(placeArr,place);
            let firstNumber = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div.col-md-2", el => el.textContent);
            if (firstNumber == "") {
                firstNumberArr.push("NA");
            } else {
                firstNumberArr.push(firstNumber);
            }
            let secondNumber = await page.$eval("body > div.container > div:nth-child(3) > div:nth-child(" + i + ") > div > div:nth-child(5)", el => el.textContent);
            arrayPusher(secondNumberArr,secondNumber);
            await page.waitForTimeout(500)
            //     console.log("Waiting");
            // await page.waitForTimeout(2000);
        }
    }
    // console.log(`Name  BloodGroup  Location  Mob.No  PhoneNo`)
    for(let i = 0;i<nameArr.length;i++){
        console.log(`${nameArr[i]}  ${bloodGroupArr[i]}  ${placeArr[i]}  ${firstNumberArr[i]}   ${secondNumberArr[i]}`)
        
        }
        let a=[];
        for (let j = 0; j < nameArr.length; j++) {
            let aoa = { "Name": '', "Blood Group": '', "Location": '', "Mobile Number": '', "Alternate Number": ''};
            aoa["Name"] = nameArr[j];
            aoa["Blood Group"] = bloodGroupArr[j];
            aoa["Location"] = placeArr[j];
            aoa["Mobile Number"] = firstNumberArr[j];
            aoa["Alternate Number"] = secondNumberArr[j];
            a.push(aoa);
        }
        // for(let tab=0;tab<aoa.length;tab++){
        //     for(let l=0;l<nameArr.length;l++){

        //     }
        // }
        let folderpath = path.join(__dirname, FolderNAME);
        dirCreator(folderpath);
        let filePath = path.join(folderpath,FolderNAME+".json");
        fs.writeFile(filePath, JSON.stringify(a), err => err ? console.log(err): null);
        let excelFilePath = path.join(folderpath, FolderNAME+".xlsx");
        excelWriter(excelFilePath,a,mainCity);
        let text = JSON.stringify(a);
        let pdfDoc = new pdfkit();
        let pdfFilePath = path.join(folderpath,FolderNAME+".pdf");
        pdfDoc.pipe(fs.createWriteStream(pdfFilePath));
        pdfDoc.text(text);
        pdfDoc.end();
        //convert.js
        console.log("Please find the file in "+FolderNAME+" folder");
        await browser.close();
})();
function dirCreator(folderpath){
    if(fs.existsSync(folderpath)==false){
        fs.mkdirSync(folderpath);
    }
} 
function excelWriter(filePath, json, sheetName) {
    // workbook create
    let newWB = xlsx.utils.book_new();
    // worksheet
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    // excel file create 
    xlsx.writeFile(newWB, filePath);
}
function arrayPusher(arr,n){
    if(n==""){
        arr.push("NA");
    }
    else{
        arr.push(n);
    }
}