import puppeteer, { Browser, ElementHandle, Page } from "puppeteer-core";
import {
  getGenderParsed,
  getRandomInt,
  parseCookieString,
  sleep,
} from "../utils/utils";
import path from "path";
import { app } from "electron";
import fs from "fs";
import os from "os";

const chromiumInfo = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "chromium-info.json"), "utf-8")
);

function getPlatformKey() {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === "win32") return "win64";
  if (platform === "darwin") {
    return arch === "arm64" ? "mac-arm64" : "mac-x64";
  }
  throw new Error("Unsupported platform");
}

interface RESULT_PAGE {
  browser: Browser;
  page: Page;
}
interface ScrapingOptions {
  isStopRequested: () => boolean;
}
export async function facebookGetUIDFromProfile(
  url: string,
  cookieString: string
): Promise<any> {
  try {
    let tmp = null;
    try {
      tmp = await newPageAndAddCookie(url, cookieString);
    } catch (error) {
      console.log("facebookGetUIDFromProfile newPageAndAddCookie", error);
    }
    if (tmp) {
      const browser = tmp.browser;
      const page: Page = tmp.page;
      page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
      let result: any = await page.evaluate(() => {
        const pageContent = document.body.innerHTML;

        try {
          // Tìm vị trí bắt đầu và kết thúc của đoạn "restrictable_profile_owner"
          let type = 0;
          let startIndex = 0;
          let endIndex = 0;

          while (true) {
            startIndex = pageContent.indexOf(
              '"restrictable_profile_owner":',
              endIndex
            );
            if (startIndex === -1) {
              type = 1;
              startIndex = pageContent.indexOf('"profile_owner":', endIndex);
            }
            endIndex = pageContent.indexOf("}", startIndex) + 1;

            // Trích xuất chuỗi JSON
            const jsonString = pageContent.substring(startIndex, endIndex);

            // Thêm dấu ngoặc nhọn bao quanh để tạo thành một đối tượng JSON hợp lệ
            const jsonObject = JSON.parse(`{${jsonString}}`);
            // Lấy thông tin cần thiết
            if (type == 0) {
              const { id, gender, name } =
                jsonObject.restrictable_profile_owner;
              if (name == null || name == "") {
                continue;
              }
              return {
                id: id,
                uid: id,
                gender: gender || "",
                name: name || "",
                link: "",
                phone: "",
              };
            } else {
              const { id, gender, name } = jsonObject.profile_owner;
              if (name == null || name == "") {
                continue;
              }
              return {
                id: id,
                uid: id,
                gender: gender || "",
                name: name || "",
                link: "",
                phone: "",
              };
            }
          }
        } catch (error) {}

        return null;
      });

      if (result != null) {
        result.link = url;
        result.gender = getGenderParsed(result.gender);
      }

      await browser.close();
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

export async function facebookGetUIDFromLinkArticle(
  option: ScrapingOptions,
  mainWindow: any,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  if (url.includes("watch?v=")) {
    return facebookGetUIDFromLinkArticleVideo(
      option,
      mainWindow,
      url,
      cookieString,
      interactions
    );
  } else {
    return facebookGetUIDFromLinkArticlePost(
      option,
      mainWindow,
      url,
      cookieString,
      interactions
    );
  }
}

//https://www.facebook.com/watch?v=7560172530769474
export async function facebookGetUIDFromLinkArticleVideo(
  option: ScrapingOptions,
  mainWindow: any,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  try {
    const tmp = await newPageAndAddCookie(url, cookieString);
    const browser = tmp.browser;
    const page: Page = tmp.page;

    await page.exposeFunction(
      "facebookGetUIDFromProfile",
      (url: string, cookieString: string) => {
        return facebookGetUIDFromProfile(url, cookieString);
      }
    );

    let allElements: any[] = [];

    // ======= GET LIST REACTION =======
    if (interactions.like == true) {
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
      let _allElements: any[] = await getListURLProfileFromPopupUser(
        option,
        page,
        mainWindow,
        cookieString
      );
      console.log(`Total unique elements collected: ${allElements.length}`);
      console.log(allElements);
      allElements = [...allElements, ..._allElements];
      // Close popup Reaction
      await sleep(2000);
      await page.click('xpath=//div[@aria-label="Close" and @role="button"]');
    }

    // ======= GET LIST USER COMMENT =======
    if (interactions.comment == true) {
      console.log("Start get comment");
      let dataLinks: any[] = [];
      const scrapeItems = async () => {
        return await page.evaluate(async () => {
          const xpath =
            '//*[@id="watch_feed"]/div/div[1]/div/div/div[2]/div[3]/div[1]/div[2]';
          const getContainer = () =>
            document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue as HTMLElement | null;

          let container = getContainer();
          if (!container) return { items: [], hasMore: false };

          const randomDelay = () =>
            new Promise((resolve) =>
              setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000)
            ); // Random delay từ 1s đến 3s

          const scrollToBottom = async (element: HTMLElement) => {
            const duration = Math.random() * 1000 + 1000; // Random từ 1s đến 2s
            const startTime = Date.now();
            const startScrollTop = element.scrollTop;
            const endScrollTop = element.scrollHeight - element.clientHeight;

            const easeInOutQuad = (t: number) =>
              t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

            return new Promise<void>((resolve) => {
              const scroll = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeInOutQuad(progress);

                element.scrollTop =
                  startScrollTop +
                  (endScrollTop - startScrollTop) * easedProgress;

                if (progress < 1) {
                  requestAnimationFrame(scroll);
                } else {
                  resolve();
                }
              };

              requestAnimationFrame(scroll);
            });
          };

          function cleanFacebookUrl(url: string): { url: string; uid: string } {
            let result = { url: url, uid: "" };
            try {
              const parsedUrl = new URL(url);
              const searchParams = new URLSearchParams(parsedUrl.search);

              // Lấy giá trị của tham số 'id' (nếu có)
              const id = searchParams.get("id");

              // Xóa tất cả các tham số
              parsedUrl.search = "";

              // Nếu có 'id', thêm lại vào URL
              if (id) {
                parsedUrl.searchParams.set("id", id);
                result.uid = id;
              }

              // Cập nhật URL đã được làm sạch
              result.url = parsedUrl.toString();
            } catch (error) {
              console.error("Error cleaning URL:", error);
            }
            return result;
          }

          const clickButtons = async (element: Element): Promise<boolean> => {
            let clicked = false;
            const buttons = Array.from(
              element.querySelectorAll('div[role="button"]')
            );
            for (const button of buttons) {
              const spanText = button
                .querySelector("span span")
                ?.textContent?.toLowerCase();
              if (
                spanText &&
                (spanText.includes("view all") || spanText.includes("view 1"))
              ) {
                (button as HTMLElement).click();
                await randomDelay();
                clicked = true;
                // Cập nhật container sau mỗi lần click
                container = getContainer();
                if (container) {
                  // Kiểm tra lại các button trong nội dung mới
                  const newClicked = await clickButtons(container);
                  clicked = clicked || newClicked;
                }
              }
            }
            return clicked;
          };

          const items: any[] = [];
          let hasMore = true;

          if (!container) {
            hasMore = false;
          } else {
            const itemDivs = Array.from(container.children).slice(0, -1); // Loại bỏ nút "view more"

            for (const itemDiv of itemDivs) {
              await clickButtons(itemDiv);
              // Cập nhật lại container sau mỗi lần xử lý itemDiv
              container = getContainer();
              if (!container) {
                hasMore = false;
              } else {
                const links = Array.from(itemDiv.querySelectorAll("a"))
                  .map((a) => cleanFacebookUrl(a.href))
                  .map((result) => ({ uid: result.uid, url: result.url }));

                if (links.length > 0) {
                  for (const link of links) {
                    let item = {
                      link: link.url,
                      name: "",
                      uid: link.uid,
                      id: link.uid,
                      gender: "",
                      phone: "",
                      type: "like",
                    };
                    items.push(item);
                  }
                }
              }
            }

            container = getContainer(); // Cập nhật lại container
            if (!container) {
              hasMore = false;
            } else {
              const viewMoreButton =
                container.lastElementChild as HTMLElement | null;
              if (
                viewMoreButton &&
                viewMoreButton.textContent?.toLowerCase().includes("view more")
              ) {
                await scrollToBottom(container);
                // Sử dụng Event để click thay vì gọi trực tiếp .click()
                const buttonsViewMore = Array.from(
                  viewMoreButton.querySelectorAll('div[role="button"]')
                );
                (buttonsViewMore[0] as HTMLElement).click();
                await randomDelay();
                container = getContainer(); // Cập nhật lại container sau khi load more
                if (container) {
                  //await scrollToBottom(container);
                } else {
                  hasMore = false;
                }
              } else {
                hasMore = false;
              }
            }
          }
          return { items, hasMore: hasMore };
        });
      };

      let allElements: any[] = [];
      let previousLength = 0;

      let i = 1;
      while (true) {
        console.log(`Scraping comment page ${i}`);
        const result = await scrapeItems();
        console.log("Result", result);
        console.log(`Result comment page ${i}`);
        i++;
        // Thêm các phần tử mới vào mảng tổng
        let items = removeDuplicatesWithLink(
          result.items.slice(previousLength)
        );
        for (let item of items) {
          const exists = isItemInArray(item, allElements);
          console.log(`exists ${item.uid}=${exists}`);
          if (!exists) {
            const profile_tmp = await facebookGetUIDFromProfile(
              item.link,
              cookieString
            );
            if (profile_tmp != null) {
              item = profile_tmp;
            }
            await sleep(getRandomInt(1, 2) * 1000);
            allElements.push(item);
            // Gửi dữ liệu mới về renderer process
            console.log("Update 388", option.isStopRequested());
            if (option.isStopRequested()) {
              break;
            }
            if (mainWindow) {
              mainWindow.webContents.send(
                "update-data-get-uid-article",
                allElements
              );
            }
          }
        }
        previousLength = result.items.length;

        // Scroll đến phần tử cuối cùng
        await page.evaluate(() => {
          const elements = document.evaluate(
            '//*[@id="watch_feed"]/div/div[1]/div/div/div[2]/div[3]/div[1]/div[2]',
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

        console.log("Update 422", option.isStopRequested());
        if (option.isStopRequested()) {
          break;
        }
        if (mainWindow) {
          mainWindow.webContents.send(
            "update-data-get-uid-article",
            allElements
          );
        }
        if (result.hasMore == false) {
          break;
        }
        if (option.isStopRequested()) {
          break;
        }
        // Đợi để trang load thêm nội dung
        await sleep((getRandomInt(1, 4) + 2) * 1000);
      }
    }

    await browser.close();
    return allElements;
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

//https://www.facebook.com/rockwaterbay/posts/pfbid0381kU9cju76zs4LToXTLp9HTzVUkBDYC9YEe36d5HMCfEpxnv8jYrS8ew79ofuskpl
export async function facebookGetUIDFromLinkArticlePost(
  option: ScrapingOptions,
  mainWindow: any,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  try {
    const tmp = await newPageAndAddCookie(url, cookieString);
    const browser = tmp.browser;
    const page: Page = tmp.page;

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.exposeFunction(
      "facebookGetUIDFromProfile",
      (url: string, cookieString: string) => {
        return facebookGetUIDFromProfile(url, cookieString);
      }
    );

    let allElements: any[] = [];

    // ======= GET LIST REACTION =======
    if (interactions.like == true) {
      // 1. Tìm và click vào span có aria-label="See who reacted to this"
      await sleep(2000);
      const xpath =
        '//span[@aria-label="See who reacted to this" and @role="toolbar"]';

      // Tìm phần tử đồng cấp div/span/div và click vào nó
      await page.evaluate((xpath) => {
        const element = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (element && element instanceof Element) {
          const adjacentElement = element.nextElementSibling;
          if (adjacentElement) {
            // Tìm div có role="button" trong adjacentElement
            const buttonDiv =
              adjacentElement.querySelector('div[role="button"]');
            if (buttonDiv) {
              (buttonDiv as HTMLElement).scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              (buttonDiv as HTMLElement).click();
            } else {
              console.log("Không tìm thấy div có role='button'");
            }
          }
        }
      }, xpath);

      // 2. Tìm và click vào div chứa tất cả các reaction
      await sleep(2000);
      await page.click('xpath=//div[starts-with(@aria-label, "All, ")]');
      console.log("Page click");
      await sleep(3000);

      // 3. Lấy tất cả các phần tử của popup user
      let _allElements: any[] = [];
      try {
        _allElements = await getListURLProfileFromPopupUser(
          option,
          page,
          mainWindow,
          cookieString
        );
      } catch (error) {
        console.log("getListURLProfileFromPopupUser:", error);
      }
      console.log(`Total unique elements collected: ${allElements.length}`);
      console.log(allElements);
      allElements = [...allElements, ..._allElements];
      // Close popup Reaction
      await sleep(2000);
      await page.click('xpath=//div[@aria-label="Close" and @role="button"]');
    }

    // ======= GET LIST USER COMMENT =======
    if (interactions.comment == true) {
      console.log("Start get comment");
      // Scroll đến phần tử cuối cùng
      await page.evaluate(() => {
        const elements = document.evaluate(
          '//form[@role="presentation"]',
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

      let dataLinks: any[] = [];
      const scrapeItems = async () => {
        return await page.evaluate(async () => {
          const xpath =
            '//div[@data-visualcompletion="ignore-dynamic"]/div/div[2]/div[contains(@class, "html-div")]';
          const getContainer = () =>
            document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue as HTMLElement | null;

          let container = getContainer();
          if (!container) return { items: [], hasMore: false };

          const randomDelay = () =>
            new Promise((resolve) =>
              setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000)
            ); // Random delay từ 1s đến 3s

          function cleanFacebookUrl(url: string): { url: string; uid: string } {
            let result = { url: "", uid: "" };
            try {
              const parsedUrl = new URL(url);

              // Trường hợp 1: URL có tham số 'id'
              const searchParams = new URLSearchParams(parsedUrl.search);
              const id = searchParams.get("id");
              if (id) {
                parsedUrl.search = "";
                parsedUrl.searchParams.set("id", id);
                result.url = parsedUrl.toString();
                result.uid = id;
                return result;
              }

              // Trường hợp 2: URL có cấu trúc https://www.facebook.com/username
              if (
                parsedUrl.hostname.indexOf("facebook.com") > -1 &&
                parsedUrl.pathname.split("/").length === 2
              ) {
                const username = parsedUrl.pathname.split("/")[1];
                if (username && username !== "") {
                  if (username != "photo.php") {
                    result.url = `https://facebook.com/${username}`;
                    result.uid = "";
                    return result;
                  }
                }
              }

              // Nếu không thuộc hai trường hợp trên, trả về kết quả rỗng
              return result;
            } catch (error) {
              console.error("Error cleaning URL:", error);
              return result;
            }
          }

          const clickButtons = async (element: Element) => {
            const recursiveClick = async (el: Element) => {
              if (
                el.tagName.toLowerCase() === "div" &&
                el.getAttribute("role") === "button"
              ) {
                const spanText = el
                  .querySelector("span span")
                  ?.textContent?.toLowerCase();
                if (
                  spanText &&
                  (spanText.includes("view all") || spanText.includes("view 1"))
                ) {
                  console.log("Clicking button with text:", spanText);
                  (el as HTMLElement).click();
                  await new Promise((resolve) =>
                    setTimeout(resolve, Math.random() * 1000 + 1000)
                  );
                }
              }

              for (const child of Array.from(el.children)) {
                await recursiveClick(child);
              }
            };

            await recursiveClick(element);
          };

          const getLinks = (element: Element) => {
            const links: { uid: string; url: string }[] = [];

            const recursiveGetLinks = (el: Element) => {
              // Kiểm tra nếu element hiện tại là thẻ a có tabindex="0" và role="link"
              if (
                el.tagName.toLowerCase() === "a" &&
                el.getAttribute("tabindex") === "0" &&
                el.getAttribute("role") === "link"
              ) {
                const href = (el as HTMLAnchorElement).href;
                //console.log("href", href);
                const cleanedUrl = cleanFacebookUrl(href);
                links.push({ uid: cleanedUrl.uid, url: cleanedUrl.url });
              }

              // Đệ quy qua tất cả các phần tử con
              for (const child of Array.from(el.children)) {
                recursiveGetLinks(child);
              }
            };

            recursiveGetLinks(element);
            return links;
          };

          const items: any[] = [];
          let hasMore = true;

          if (!container) {
            hasMore = false;
          } else {
            const itemDivs = Array.from(container.children).slice(0, -1); // Loại bỏ nút "view more"

            for (const itemDiv of itemDivs) {
              await clickButtons(itemDiv);
              // Cập nhật lại container sau mỗi lần xử lý itemDiv
              container = getContainer();
              if (!container) {
                hasMore = false;
              } else {
                const links = getLinks(itemDiv);

                if (links.length > 0) {
                  for (const link of links) {
                    console.log("link, ", link.url);
                    let item = {
                      link: link.url,
                      name: "",
                      uid: link.uid,
                      id: link.uid,
                      gender: "",
                      phone: "",
                      type: "like",
                    };
                    items.push(item);
                  }
                }
              }
            }

            container = getContainer(); // Cập nhật lại container
            if (!container) {
              hasMore = false;
            } else {
              await randomDelay();
            }
          }
          return { items, hasMore: hasMore };
        });
      };

      let allElements: any[] = [];
      let previousLength = 0;

      let i = 1;
      while (true) {
        console.log(`Scraping comment page ${i}`);
        let result = null;
        try {
          result = await scrapeItems();
        } catch (error) {
          console.log("result = await scrapeItems();", error);
        }
        if (result) {
          console.log("Result", result);
          console.log(`Result comment page ${i}`);
          i++;
          // Thêm các phần tử mới vào mảng tổng
          let items = removeDuplicatesWithLink(
            result.items.slice(previousLength)
          );
          for (let item of items) {
            const exists = isItemInArray(item, allElements);
            console.log(`exists ${item.uid}=${exists}`);
            if (!exists) {
              const profile_tmp = await facebookGetUIDFromProfile(
                item.link,
                cookieString
              );
              if (profile_tmp != null) {
                item = profile_tmp;
              }
              await sleep(getRandomInt(1, 2) * 1000);
              allElements.push(item);
              // Gửi dữ liệu mới về renderer process
              console.log("Update 748", option.isStopRequested());
              if (option.isStopRequested()) {
                break;
              }
              if (mainWindow) {
                mainWindow.webContents.send(
                  "update-data-get-uid-article",
                  allElements
                );
              }
            }
          }
          previousLength = result.items.length;

          // Scroll đến phần tử cuối cùng
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            //document.documentElement.scrollTop = document.documentElement.scrollHeight;
          });

          // Đợi để trang load thêm nội dung
          await sleep((getRandomInt(1, 4) + 2) * 1000);

          console.log("Update 771", option.isStopRequested());
          if (option.isStopRequested()) {
            break;
          }
          // Gửi dữ liệu mới về renderer process
          if (mainWindow) {
            mainWindow.webContents.send(
              "update-data-get-uid-article",
              allElements
            );
          }
          if (result.hasMore == false) {
            break;
          }
          if (option.isStopRequested()) {
            break;
          }
        }
        // Đợi để trang load thêm nội dung
        await sleep((getRandomInt(1, 4) + 2) * 1000);
      }
    }

    //await browser.close();
    return allElements;
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

async function newPageAndAddCookie(
  url: string,
  cookieString: string
): Promise<RESULT_PAGE> {
  const platformKey = getPlatformKey();
  const chromiumConfig = chromiumInfo[platformKey];

  let executablePath;

  if (app.isPackaged) {
    // Đường dẫn khi ứng dụng được đóng gói
    executablePath = path.join(
      process.resourcesPath,
      chromiumConfig.executablePath
    );
    console.log("executablePath main", executablePath);
  } else {
    // Đường dẫn khi đang phát triển
    executablePath = path.join(
      __dirname,
      "..",
      "..",
      chromiumConfig.executablePath
    );
    console.log("executablePath dev", executablePath);
  }

  if (!fs.existsSync(executablePath)) {
    throw new Error(`Chromium executable not found at ${executablePath}`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

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
  option: ScrapingOptions,
  page: Page,
  mainWindow: any,
  cookieString: string
): Promise<any[]> {
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

          let item = {
            link: "",
            name: "",
            uid: "",
            id: "",
            gender: "",
            phone: "",
            type: "like",
          };
          if (linkElement) {
            const tmp = cleanFacebookUrl(linkElement.href || "");
            item = {
              link: tmp.url,
              name: linkElement.textContent?.trim() || "",
              uid: tmp.uid,
              id: tmp.uid,
              gender: "",
              phone: "",
              type: "like",
            };
          }

          results.push(item);
        }
        return results;
      },
      xpath,
      cookieString
    );
    // console.log(
    //   `allElements: ${allElements.length} - newElements: ${newElements.length}, previousLength: ${previousLength}`
    // );
    // Thêm các phần tử mới vào mảng tổng
    allElements = [...allElements, ...newElements.slice(previousLength)];

    let tmp_arr = [];
    for (let item of allElements) {
      if (item.uid === "" || item.name === "" || item.gender === "") {
        const profile_tmp = await facebookGetUIDFromProfile(
          item.link,
          cookieString
        );
        if (profile_tmp != null) {
          item = profile_tmp;
        }
        await sleep(2000);
      }
      tmp_arr.push(item);
      console.log("Update 940", option.isStopRequested());
      if (option.isStopRequested()) {
        break;
      }
      if (mainWindow) {
        mainWindow.webContents.send("update-data-get-uid-article", tmp_arr);
      }
    }
    //console.log(`Total unique elements collected: ${allElements.length}`);
    //console.log(`tmp_arr: ${tmp_arr.length}`);
    allElements = [...tmp_arr];
    //console.log(`allElements: ${allElements.length}`);
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

    console.log("Update 972", option.isStopRequested());
    if (option.isStopRequested()) {
      break;
    }
    // Gửi dữ liệu mới về renderer process
    if (mainWindow) {
      mainWindow.webContents.send("update-data-get-uid-article", allElements);
    }

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
    await sleep((getRandomInt(1, 4) + 3) * 1000);

    // if (allElements.length > 100) {
    //   break;
    // }
  }

  return allElements;
}

function removeDuplicatesWithLink(items: any[]): any[] {
  const uniqueMap = new Map<string, any>();

  for (const item of items) {
    console.log("removeDuplicates", item.link);
    if (item.link != null && item.link != "") {
      console.log("removeDuplicates set 0", item.link);
      if (!uniqueMap.has(item.link)) {
        uniqueMap.set(item.link, item);
        console.log("removeDuplicates set 1", item.link);
      }
    }
  }

  return Array.from(uniqueMap.values());
}
function removeDuplicatesWithUID(items: any[]): any[] {
  const uniqueMap = new Map<string, any>();

  for (const item of items) {
    console.log("removeDuplicates uid[", item.uid, "]", item.link);
    if (item.uid != null && item.uid != "") {
      console.log("removeDuplicates set 0", item.link);
      if (!uniqueMap.has(item.uid)) {
        uniqueMap.set(item.uid, item);
        console.log("removeDuplicates set 1", item.link);
      }
    } else {
      if (!uniqueMap.has(item.link)) {
        uniqueMap.set(item.link, item);
        console.log("removeDuplicates set 2", item.link);
      }
    }
  }

  return Array.from(uniqueMap.values());
}

function isItemInArray(item: any, array: any[]): boolean {
  return array.some((arrayItem) => arrayItem.link === item.link);
}
