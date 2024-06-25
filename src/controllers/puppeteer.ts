import puppeteer from "puppeteer";

export async function runPuppeteer() {
  const url = "https://facebook.com";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const data = await page.evaluate(() => {
    return document.body.innerText;
  });

  await browser.close();
  return data; // Trả về dữ liệu
}
