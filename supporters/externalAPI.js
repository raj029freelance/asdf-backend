const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

module.exports = async function scrape(searchText = "") {
  // try {
  puppeteer.use(StealthPlugin());

  searchText = searchText.toString().toLowerCase();
  console.log(searchText);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `https://www.google.com/search?q=${searchText}+customer+care+number`
  );

  const title = await page.evaluate(() => {
    return document.querySelectorAll("span");
  });

  console.log("Dimensions : ", title);

  await browser.close();

  // const html = await page.content();
  // await page.screenshot({ path: "bot-test-result.png", fullPage: true });

  // var CompanyNameElement = await page.wait("a");
  // var CompanyName = await page.evaluate(
  //   (CompanyNameElement) => CompanyNameElement.getAttribute(),
  //   CompanyNameElement
  // );
  // console.log(CompanyName);
  // const data = await page.evaluate(() => {
  //   const tds = Array.from(document.querySelectorAll("a"));
  //   console.log(tds);
  //   // return tds.map((td) => td.innerHTML);
  //   return "";
  // });
  // var CompanyTypeElement = await page.waitForSelector(".wwUB2c > span");
  // var CompanyTypeName = await page.evaluate(
  //   (CompanyTypeElement) => CompanyTypeElement.textContent,
  //   CompanyTypeElement
  // );

  // var CompanyDescriptionElement = await page.waitForSelector(
  //   ".kno-rdesc  > span"
  // );
  // var CompanyDescription = await page.evaluate(
  //   (CompanyDescriptionElement) => CompanyDescriptionElement.textContent,
  //   CompanyDescriptionElement
  // );

  // var CustomerCareNumberElement = await page.waitForSelector(
  //   ".LrzXr.zdqRlf.kno-fv > span"
  // );
  // var CustomerCareNumber = await page.evaluate(
  //   (CustomerCareNumberElement) => CustomerCareNumberElement.textContent,
  //   CustomerCareNumberElement
  // );

  // var CompanyURLElement = await page.waitForSelector(".yuRUbf > a");
  // var CompanyURL = await page.evaluate(
  //   (CompanyURLElement) => CompanyURLElement.getAttribute("href"),
  //   CompanyURLElement
  // );

  // console.log(CompanyName);
  // console.log(CompanyTypeName);
  // console.log(CompanyDescription);
  // console.log(CustomerCareNumber);
  // console.log(CompanyURL);

  // browser.close();

  // return {
  //   CompanyName,
  //   CompanyTypeName,
  //   CallBackAvailable: "YES",
  //   DepartmentYourCalling: "Customer Service",
  //   CallPickedUpByARealPerson: "YES",
  //   BestTimeToDail: "",
  //   CallCenterHours: "24 hours, 7 days",
  //   description: CompanyDescription,
  //   PhoneNumber: CustomerCareNumber,
  //   CompanyUrl: CompanyURL,
  //   external: "true",
  // };
  // } catch (err) {
  // return null;
  // }
};

// scrape("pepsi");
