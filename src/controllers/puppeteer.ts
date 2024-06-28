import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import {
  getGenderParsed,
  getRandomInt,
  parseCookieString,
  sleep,
} from "../utils/utils";

interface RESULT_PAGE {
  browser: Browser;
  page: Page;
}
export async function facebookGetUIDFromProfile(
  url: string,
  cookieString: string
): Promise<any> {
  try {
    const tmp = await newPageAndAddCookie(url, cookieString);
    const browser = tmp.browser;
    const page: Page = tmp.page;

    let result: any = await page.evaluate(() => {
      const pageContent = document.body.innerHTML;

      try {
        // Tìm vị trí bắt đầu và kết thúc của đoạn "restrictable_profile_owner"
        const startIndex = pageContent.indexOf('"restrictable_profile_owner":');
        const endIndex = pageContent.indexOf("}", startIndex) + 1;

        // Trích xuất chuỗi JSON
        const jsonString = pageContent.substring(startIndex, endIndex);

        // Thêm dấu ngoặc nhọn bao quanh để tạo thành một đối tượng JSON hợp lệ
        const jsonObject = JSON.parse(`{${jsonString}}`);

        // Lấy thông tin cần thiết
        const { id, gender, name, short_name } =
          jsonObject.restrictable_profile_owner;

        return {
          id: id,
          uid: id,
          gender: gender || "",
          name: name || "",
          link: "",
          phone: "",
        };
      } catch (error) {}

      return null;
    });

    if (result != null) {
      result.link = url;
      result.gender = getGenderParsed(result.gender);
    }

    await browser.close();
    return result;
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

//https://www.facebook.com/watch?v=7560172530769474
//https://www.facebook.com/rockwaterbay/posts/pfbid0381kU9cju76zs4LToXTLp9HTzVUkBDYC9YEe36d5HMCfEpxnv8jYrS8ew79ofuskpl
export async function facebookGetUIDFromLinkArticle(
  mainWindow: any,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  if (url.includes("watch?v=")) {
    return facebookGetUIDFromLinkArticleVideo(
      mainWindow,
      url,
      cookieString,
      interactions
    );
  } else {
    return facebookGetUIDFromLinkArticlePost(
      mainWindow,
      url,
      cookieString,
      interactions
    );
  }
}

export async function facebookGetUIDFromLinkArticleVideo(
  mainWindow: any,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  try {
    const tmp = await newPageAndAddCookie(url, cookieString);
    const browser = tmp.browser;
    const page: Page = tmp.page;

    // ======= GET LIST REACTION =======

    // 1. Tìm và click vào span có aria-label="See who reacted to this"
    await sleep(2000);
    await page.click(
      'xpath=//*[@id="watch_feed"]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[2]/div/div[1]'
    );
    // 2. Tìm và click vào div chứa tất cả các reaction
    await sleep(2000);
    await page.click('xpath=//div[starts-with(@aria-label, "All, ")]');
    console.log("Page click");
    await sleep(3000);

    // 3. Lấy tất cả các phần tử của popup user
    let allElements: any[] = await getListURLProfileFromPopupUser(
      page,
      mainWindow,
      cookieString
    );
    console.log(`Total unique elements collected: ${allElements.length}`);
    console.log(allElements);

    // Close popup Reaction
    await sleep(2000);
    await page.click('xpath=//div[@aria-label="Close" and @role="button"]');

    // ======= GET LIST COMMENT =======
    await sleep(2000);

    //await browser.close();
    return allElements;
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

export async function facebookGetUIDFromLinkArticlePost(
  mainWindow: any,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  try {
    const tmp = await newPageAndAddCookie(url, cookieString);
    const browser = tmp.browser;
    const page: Page = tmp.page;

    await sleep(2000);
    await page.click(
      'xpath=//*[@id="watch_feed"]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[2]/div/div[1]'
    );
    await sleep(2000);
    await page.click('xpath=//div[starts-with(@aria-label, "All, ")]');
    console.log("Page click");

    // const element = await page.waitForSelector(
    //   "//span[@aria-label='See who reacted to this']"
    // );
    // console.log("Element", element);
    // if (element) {
    //   console.log("Element found");
    //   await element.click();
    // }

    // 1. Tìm và click vào span có aria-label="See who reacted to this"

    //await browser.close();
    return null;
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

async function newPageAndAddCookie(
  url: string,
  cookieString: string
): Promise<RESULT_PAGE> {
  const browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });
  // Set cookies if provided
  try {
    const cookies = parseCookieString(cookieString);
    //console.log("Parsed cookies:", cookies); // Log để kiểm tra

    for (const cookie of cookies) {
      if (cookie.name != "") {
        try {
          await page.setCookie(cookie);
          //console.log(`Successfully set cookie: ${cookie.name}`);
        } catch (error) {
          console.error(`Failed to set cookie [${cookie.name}]:`, error);
        }
      }
    }

    await page.goto(url, { waitUntil: "networkidle0" });

    return { browser: browser, page: page };
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    await browser.close();
    throw error;
  }
}

async function getListURLProfileFromPopupUser(
  page: Page,
  mainWindow: any,
  cookieString: string
): Promise<any[]> {
  await page.exposeFunction(
    "facebookGetUIDFromProfile",
    (url: string, cookieString: string) => {
      return facebookGetUIDFromProfile(url, cookieString);
    }
  );
  const xpath =
    '//div[contains(@class, "html-div")]/div[1]/div[1]/div[@data-visualcompletion="ignore-dynamic" and contains(@style, "padding-left")]';

  let allElements: any[] = [];
  let previousLength = 0;
  let noNewElementsCount = 0;
  const maxNoNewElementsAttempts = 3;

  while (true) {
    // Lấy tất cả các phần tử hiện tại
    const newElements = await page.$$eval(
      "body",
      async (elements, xpathToEvaluate, cookieString) => {
        function sleep_1(ms: number) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }
        function cleanFacebookUrl(url: string): any {
          let result = { url: url, uid: "" };
          try {
            const parsedUrl = new URL(url);
            const searchParams = new URLSearchParams(parsedUrl.search);
            searchParams.delete("__tn__");
            parsedUrl.search = searchParams.toString();
            result.url = parsedUrl.toString();
            result.uid = searchParams.get("id") || "";
          } catch (error) {
            console.error("Error cleaning URL:", error);
          }
          return result;
        }

        const xpathResult = document.evaluate(
          xpathToEvaluate,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        const results = [];
        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          const element = xpathResult.snapshotItem(i) as HTMLElement;

          // Tìm phần tử con theo XPath tương đối
          //const linkXPath = ".//div/div/div[1]/div/a";
          const linkXPath = ".//div/div/div[2]/div[1]/div/div/div/span/div/a";
          const linkElement = document.evaluate(
            linkXPath,
            element,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue as HTMLAnchorElement;

          let href = "";
          let name = "";
          let uid = "";

          let item = {
            link: href,
            name: name,
            uid: uid,
            id: uid,
            gender: "",
            phone: "",
            type: "like",
          };

          if (linkElement) {
            const tmp = cleanFacebookUrl(linkElement.href || "");
            href = tmp.url;
            uid = tmp.uid;
            name = linkElement.textContent?.trim() || "";

            item = {
              link: href,
              name: name,
              uid: uid,
              id: uid,
              gender: "",
              phone: "",
              type: "like",
            };

            if (uid === "") {
              const profile_tmp = await window.facebookGetUIDFromProfile(
                href,
                cookieString
              );
              if (profile_tmp != null) {
                item = profile_tmp;
              }
              await sleep_1(2000);
              console.log("profile_tmp", profile_tmp);
            }
          }

          results.push(item);
        }
        return results;
      },
      xpath,
      cookieString
    );

    // Thêm các phần tử mới vào mảng tổng
    allElements = [...allElements, ...newElements.slice(previousLength)];

    console.log(
      `Found ${newElements.length} elements in total. New elements: ${
        newElements.length - previousLength
      }`
    );

    if (newElements.length === previousLength) {
      noNewElementsCount++;
      if (noNewElementsCount >= maxNoNewElementsAttempts) {
        console.log(
          "No new elements after multiple attempts. Assuming all elements are loaded."
        );
        break;
      }
    } else {
      noNewElementsCount = 0;
    }

    previousLength = newElements.length;

    // Scroll đến phần tử cuối cùng
    await page.evaluate(() => {
      const elements = document.evaluate(
        '//div[contains(@class, "html-div")]/div[1]/div[1]/div[@data-visualcompletion="ignore-dynamic" and contains(@style, "padding-left")]',
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      const lastElement = elements.snapshotItem(
        elements.snapshotLength - 1
      ) as HTMLElement;
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    // Đợi để trang load thêm nội dung
    await sleep((getRandomInt(1, 4) + 2) * 1000);

    // Gửi dữ liệu mới về renderer process
    if (mainWindow) {
      mainWindow.webContents.send("update-data-get-uid-article", allElements);
    }
    if (allElements.length > 100) {
      break;
    }
  }

  return allElements;
}
