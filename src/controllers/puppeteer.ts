import puppeteer, {
  Browser,
  Cookie,
  ElementHandle,
  Page,
  Protocol,
} from "puppeteer-core";
import {
  getGenderParsed,
  getRandomInt,
  parseCookieString,
  replaceKeywords,
  sleep,
} from "../utils/utils";
import path from "path";
import { app, clipboard } from "electron";
import fs from "fs";
import os from "os";
import * as dbOps from "../shared/dbOperations";
import { ScrapedItem } from "../utils/interface.global";
import { v4 as uuidv4 } from "uuid";

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
  cookieString: string,
  mainWindow: any | null
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
      page.on("console", (msg) => console.log("PAGE PROFILE:", msg.text()));

      console.log("Start", url);
      let result: any = {
        id: 0,
        uid: 0,
        gender: "",
        name: "",
        link: "",
        phone: "",
        message: "",
        is_send: 0,
      };
      const check_login: boolean = await checkLogin(page);

      if (check_login) {
        result.message = "Cookie hết hiệu lực. Vui lòng cập nhật cookie mới";
        // try {
        //   await browser.disconnect();
        // } catch (error) {}

        await browser.close();
        console.log("browser.close();");
        return result;
      }

      result = await page.evaluate(() => {
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
                message: "",
                is_send: 0,
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
                message: "",
                is_send: 0,
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

      //   try {
      //     await browser.disconnect();
      //   } catch (error) {}

      await browser.close();
      //console.log("browser.close();", result.link);
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    return null;
  }
}

export async function facebookGetUIDFromLinkArticle(
  option: ScrapingOptions,
  mainWindow: any,
  group_id: number,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  if (url.includes("watch?v=")) {
    return facebookGetUIDFromLinkArticleVideo(
      option,
      mainWindow,
      group_id,
      url,
      cookieString,
      interactions
    );
  } else {
    return facebookGetUIDFromLinkArticlePost(
      option,
      mainWindow,
      group_id,
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
  group_id: number,
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
        return facebookGetUIDFromProfile(url, cookieString, mainWindow);
      }
    );

    const check_login: boolean = await checkLogin(page);

    if (check_login) {
      if (mainWindow) {
        mainWindow.webContents.send("update-alert-to-view", {
          status: false,
          message: "Cookie hết hiệu lực. Vui lòng cập nhật cookie mới",
        });
      }
      //   try {
      //     await browser.disconnect();
      //   } catch (error) {}
      await browser.close();
      return { status: false };
    }

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
      try {
        await getListURLProfileFromPopupUser(
          option,
          page,
          mainWindow,
          cookieString,
          group_id
        );
      } catch (error) {
        console.log("getListURLProfileFromPopupUser:", error);
      }

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
                      type: "comment",
                      group_id: 0,
                      is_send: 0,
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

      let previousLength = 0;

      let i = 1;
      while (true) {
        //console.log(`Scraping comment page ${i}`);
        const result = await scrapeItems();
        //console.log("Result", result);
        //console.log(`Result comment page ${i}`);
        i++;
        // Thêm các phần tử mới vào mảng tổng
        let items = removeDuplicatesWithLink(
          result.items.slice(previousLength)
        );

        let count_item_new = 0;
        for (let item of items) {
          item.group_id = group_id;
          const exists = await isItemInArray(item);
          if (!exists) {
            const profile_tmp = await facebookGetUIDFromProfile(
              item.link,
              cookieString,
              mainWindow
            );
            if (profile_tmp != null) {
              item = profile_tmp;
            }
            if (item.name != "" && item.uid != "") {
              item.group_id = group_id;
              await dbOps.addData(item);
            }
            await sleep(getRandomInt(1, 2) * 1000);

            if (option.isStopRequested()) {
              break;
            }
            if (mainWindow) {
              mainWindow.webContents.send("update-data-get-uid-article", [
                item,
              ]);
            }

            count_item_new++;
          }
        }

        console.log("previousLength", previousLength, result.items.length);
        console.log("count_item_new", count_item_new);

        if (previousLength == result.items.length && count_item_new == 0) {
          break;
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
          mainWindow.webContents.send("update-data-get-uid-article", []);
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
    // try {
    //   await browser.disconnect();
    // } catch (error) {}
    await browser.close();
    return { status: true };
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

//https://www.facebook.com/rockwaterbay/posts/pfbid0381kU9cju76zs4LToXTLp9HTzVUkBDYC9YEe36d5HMCfEpxnv8jYrS8ew79ofuskpl
export async function facebookGetUIDFromLinkArticlePost(
  option: ScrapingOptions,
  mainWindow: any,
  group_id: number,
  url: string,
  cookieString: string,
  interactions: any
): Promise<any> {
  console.log("facebookGetUIDFromLinkArticlePost group_id", group_id);
  try {
    const tmp = await newPageAndAddCookie(url, cookieString);
    const browser = tmp.browser;
    const page: Page = tmp.page;

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.exposeFunction(
      "facebookGetUIDFromProfile",
      (url: string, cookieString: string) => {
        return facebookGetUIDFromProfile(url, cookieString, mainWindow);
      }
    );

    const check_login: boolean = await checkLogin(page);

    if (check_login) {
      if (mainWindow) {
        mainWindow.webContents.send("update-alert-to-view", {
          status: false,
          message: "Cookie hết hiệu lực. Vui lòng cập nhật cookie mới",
        });
      }
      //   try {
      //     await browser.disconnect();
      //   } catch (error) {}
      await browser.close();
      return { status: false };
    }

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
      try {
        await getListURLProfileFromPopupUser(
          option,
          page,
          mainWindow,
          cookieString,
          group_id
        );
      } catch (error) {
        console.log("getListURLProfileFromPopupUser:", error);
      }

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
                  //console.log("Clicking button with text:", spanText);
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
                    //console.log("link, ", link.url);
                    let item = {
                      link: link.url,
                      name: "",
                      uid: link.uid,
                      id: link.uid,
                      gender: "",
                      phone: "",
                      type: "comment",
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
        console.log("Comment result", result);
        if (result) {
          //console.log("Result", result);
          //console.log(`Result comment page ${i}`);
          i++;
          // Thêm các phần tử mới vào mảng tổng
          let items = removeDuplicatesWithLink(
            result.items.slice(previousLength)
          );
          console.log("Comment removeDuplicatesWithLink items", items);
          let count_item_new = 0;
          for (let item of items) {
            item.group_id = group_id;
            const exists = await isItemInArray(item);
            //console.log(`exists ${item.uid}=${exists}`);
            if (!exists) {
              const profile_tmp = await facebookGetUIDFromProfile(
                item.link,
                cookieString,
                mainWindow
              );
              if (profile_tmp != null) {
                item = profile_tmp;
              }
              if (item.name != "" && item.uid != "") {
                item.group_id = group_id;
                console.log("Post, group_id", item, group_id);
                await dbOps.addData(item);
              }
              await sleep(getRandomInt(1, 2) * 1000);

              if (option.isStopRequested()) {
                break;
              }
              if (mainWindow) {
                mainWindow.webContents.send("update-data-get-uid-article", [
                  item,
                ]);
              }

              count_item_new++;
            }
          }
          console.log("previousLength", previousLength, result.items.length);
          console.log("count_item_new", count_item_new);

          if (previousLength == result.items.length && count_item_new == 0) {
            break;
          }
          previousLength = result.items.length;

          // Scroll đến phần tử cuối cùng
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            //document.documentElement.scrollTop = document.documentElement.scrollHeight;
          });

          // Đợi để trang load thêm nội dung
          await sleep((getRandomInt(1, 4) + 2) * 1000);

          //console.log("Update 771", option.isStopRequested());
          if (option.isStopRequested()) {
            break;
          }
          // Gửi dữ liệu mới về renderer process
          if (mainWindow) {
            mainWindow.webContents.send("update-data-get-uid-article", []);
          }
          if (result.hasMore == false) {
            break;
          }
          if (option.isStopRequested()) {
            break;
          }
        } else {
        }
        // Đợi để trang load thêm nội dung
        await sleep((getRandomInt(1, 4) + 2) * 1000);
      }
    }

    // try {
    //   await browser.disconnect();
    // } catch (error) {}
    await browser.close();
    return { status: true };
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

async function getListURLProfileFromPopupUser(
  option: ScrapingOptions,
  page: Page,
  mainWindow: any,
  cookieString: string,
  group_id: number
): Promise<any> {
  const xpath =
    '//div[contains(@class, "html-div")]/div[1]/div[1]/div[@data-visualcompletion="ignore-dynamic" and contains(@style, "padding-left")]';

  let previousLength = 0;
  let noNewElementsCount = 0;
  const maxNoNewElementsAttempts = 3;

  while (true) {
    // Lấy tất cả các phần tử hiện tại
    const newElements = await page.$$eval(
      "body",
      async (elements, xpathToEvaluate, cookieString) => {
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
            id: 0,
            gender: "",
            phone: "",
            type: "like",
            message: "",
            group_id: 0,
            is_send: 0,
          };
          if (linkElement) {
            const tmp = cleanFacebookUrl(linkElement.href || "");
            item = {
              link: tmp.url,
              name: linkElement.textContent?.trim() || "",
              uid: tmp.uid,
              id: parseInt(tmp.uid),
              gender: "",
              phone: "",
              type: "like",
              message: "",
              group_id: 0,
              is_send: 0,
            };
          }

          results.push(item);
        }
        return results;
      },
      xpath,
      cookieString
    );

    for (let item of newElements) {
      const itemCheck = await dbOps.findByLinkAndGroupID(item.link, group_id);
      if (itemCheck == null) {
        const profile_tmp = await facebookGetUIDFromProfile(
          item.link,
          cookieString,
          mainWindow
        );
        if (profile_tmp != null) {
          item = profile_tmp;
        }
        await sleep(2000);
      }
      if (option.isStopRequested()) {
        break;
      }
      if (item.name != "" && item.uid != "") {
        item.group_id = group_id;
        await dbOps.addData(item);
      }
      console.log("getListURLProfileFromPopupUser", item.link);
      if (mainWindow) {
        mainWindow.webContents.send("update-data-get-uid-article", [item]);
      }
    }

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

    if (option.isStopRequested()) {
      break;
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
  }

  return { status: true };
}

export async function onSendMessageToUser(
  option: ScrapingOptions,
  mainWindow: any | null,
  cookies: string,
  dataSend: any,
  group_id: number
) {
  let result: any = {
    status: false,
    message: "",
  };
  try {
    const delay = dataSend.delay;
    const file = dataSend.file;
    let message = dataSend.message;
    while (1) {
      const data = await dbOps.getDataNotSendInGroup(group_id);
      console.log("Data", data);
      if (data) {
        const url = data.link;

        const replacements = {
          gender:
            data.gender == "Nam"
              ? "Anh"
              : data.gender == "Nữ"
              ? "Chị"
              : "Anh/Chị",
          name: data.name,
        };

        message = replaceKeywords(message, replacements);

        let tmp = null;
        try {
          tmp = await newPageAndAddCookie(url, cookies);
        } catch (error) {
          console.log("onSendMessageToUser", error);
        }
        if (tmp) {
          const browser = tmp.browser;
          const page: Page = tmp.page;
          //page.on("console", (msg) => console.log("PAGE PROFILE:", msg.text()));

          //console.log("Start", url);

          const check_login: boolean = await checkLogin(page);

          if (check_login) {
            result.message =
              "Cookie hết hiệu lực. Vui lòng cập nhật cookie mới";

            await browser.close();
            console.log("browser.close();");
            break;
          }

          result = {
            status: false,
            message: "Chuẩn bị gửi đến " + data.name,
          };
          if (mainWindow) {
            mainWindow.webContents.send("update-chat-function-to-view", result);
          }

          // Đóng tất cả các popup chat
          while (1) {
            try {
              const elementHandle = await page.$(
                'xpath=//div[@aria-label="Close chat" and @role="button"]'
              );
              if (elementHandle) {
                await sleep(2000);
                await page.click(
                  'xpath=//div[@aria-label="Close chat" and @role="button"]'
                );
              } else {
                break;
              }
            } catch (error) {
              break;
            }
          }

          //Scroll giả lập như người  thật

          // Lấy vị trí scroll hiện tại
          const initialPosition = await page.evaluate(() => window.pageYOffset);
          const d = getRandomInt(5, 10) * 100;
          // Scroll xuống 100px
          await smoothScroll(page, d, 1000);
          // Đợi 2 giây
          await sleep(2000);
          // Scroll trở lại vị trí ban đầu
          await smoothScroll(page, -d, 1000);

          //Tìm và mở nút chat
          await sleep(2000);
          const tmpClick = await page.click(
            'xpath=//div[@aria-label="Message" and @role="button"]'
          );
          console.log("tmpClick", tmpClick);

          const xpath =
            'xpath=//div[@aria-label="Message" and @contenteditable="true" and @role="textbox"]';

          await sleep(2000);
          try {
            const elementHandle = await page.$(xpath);
            console.log("elementHandle", elementHandle);
            if (elementHandle) {
              await sleep(1000);

              if (file != "") {
                // Upload hình ảnh
                await uploadImage(page, file);
              }

              await sleep(1000);
              for (const char of message) {
                if (char === "\n") {
                  // Mô phỏng Shift + Enter cho xuống dòng
                  await page.keyboard.down("Shift");
                  await page.keyboard.press("Enter");
                  await page.keyboard.up("Shift");
                } else {
                  await elementHandle.type(char, { delay: 50 });
                }
              }
              await sleep(1000);
              await elementHandle.press("Enter", {
                delay: 100,
              });
              console.log("press Enter");
              result = {
                status: false,
                message: "Đã gửi đến " + data.name,
              };
              if (mainWindow) {
                mainWindow.webContents.send(
                  "update-chat-function-to-view",
                  result
                );
              }
              await sleep(3000);
              while (1) {
                try {
                  const elementHandle = await page.$(
                    'xpath=//div[@aria-label="Close chat" and @role="button"]'
                  );
                  if (elementHandle) {
                    await sleep(2000);
                    await page.click(
                      'xpath=//div[@aria-label="Close chat" and @role="button"]'
                    );
                  } else {
                    break;
                  }
                } catch (error) {
                  break;
                }
              }
            }
            await sleep(2000);
            await browser.close();
          } catch (error) {
            console.log("elementHandle error", error);
          }
        }
      } else {
        result = {
          status: false,
          message: "Đã hoàn thành",
        };
        break;
      }
      await dbOps.updateIsSend(data.id, 1);
      if (mainWindow) {
        mainWindow.webContents.send("update-chat-function-to-view", result);
      }
      await sleep(delay * 1000);
      if (option.isStopRequested()) {
        break;
      }
    }
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    throw error;
  }
}

function removeDuplicatesWithLink(items: any[]): any[] {
  const uniqueMap = new Map<string, any>();

  for (const item of items) {
    //console.log("removeDuplicates", item.link);
    if (item.link != null && item.link != "") {
      //console.log("removeDuplicates set 0", item.link);
      if (!uniqueMap.has(item.link)) {
        uniqueMap.set(item.link, item);
        //console.log("removeDuplicates set 1", item.link);
      }
    }
  }

  return Array.from(uniqueMap.values());
}
function removeDuplicatesWithUID(items: any[]): any[] {
  const uniqueMap = new Map<string, any>();

  for (const item of items) {
    //console.log("removeDuplicates uid[", item.uid, "]", item.link);
    if (item.uid != null && item.uid != "") {
      //console.log("removeDuplicates set 0", item.link);
      if (!uniqueMap.has(item.uid)) {
        uniqueMap.set(item.uid, item);
        //console.log("removeDuplicates set 1", item.link);
      }
    } else {
      if (!uniqueMap.has(item.link)) {
        uniqueMap.set(item.link, item);
        //console.log("removeDuplicates set 2", item.link);
      }
    }
  }

  return Array.from(uniqueMap.values());
}

async function isItemInArray(item: ScrapedItem): Promise<boolean> {
  const tmp = await dbOps.findByLinkAndGroupID(item.link, item.group_id);
  return tmp ? true : false;
}

async function checkLogin(page: Page) {
  const xpath = '//form[@id="login_popup_cta_form"]';
  let result: boolean = await page.evaluate((xpath) => {
    const element = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (element) {
      return true;
    }
    return false;
  }, xpath);

  return result;
}

export async function onOpenBrowerWithAccountFacebook(
  mainWindow: any | null,
  cookieString: string,
  isGetCookie: boolean
) {
  const url = "https://facebook.com";
  try {
    let tmp = null;
    try {
      tmp = await newPageAndAddCookie(url, cookieString, false);

      if (tmp) {
        const browser = tmp.browser;
        const page: Page = tmp.page;
        //page.on("console", (msg) => console.log("PAGE PROFILE:", msg.text()));

        //console.log("Start", url);

        const check_login: boolean = await checkLogin(page);

        if (!check_login) {
          if (isGetCookie) {
            let lastCookieString: string = "";
            // Bắt đầu theo dõi network requests
            await page.setRequestInterception(true);

            page.on("request", async (request) => {
              if (request.isNavigationRequest()) {
                // Kiểm tra cookies sau mỗi navigation request
                const cookie = await handleBrowserClosing(page);
                if (cookie != "") {
                  if (cookie != lastCookieString) {
                    lastCookieString = cookie;
                    //console.log("lastCookieString", lastCookieString);
                    if (mainWindow) {
                      //console.log("update-cookie-to-view", lastCookieString);
                      mainWindow.webContents.send(
                        "update-cookie-to-view",
                        cookie
                      );
                    }
                  }
                }
              }
              request.continue();
            });
          }

          browser.on("targetdestroyed", async (target) => {
            const openPages = await browser.pages();
            if (openPages.length == 0) {
              await browser.close();
              console.log("Browser closed");
            }
          });
        }
      }
    } catch (error) {
      console.log("onOpenBrowerWithAccountFacebook", error);
    }
  } catch (error) {
    console.error("Error in onOpenBrowerWithAccountFacebook:", error);
    return null;
  }
}

async function newPageAndAddCookie(
  url: string,
  cookieString: string,
  headless: boolean = true
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
    //console.log("executablePath main", executablePath);
  } else {
    // Đường dẫn khi đang phát triển
    executablePath = path.join(
      __dirname,
      "..",
      "..",
      chromiumConfig.executablePath
    );
    executablePath =
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    //console.log("executablePath dev", executablePath);
  }

  if (!fs.existsSync(executablePath)) {
    throw new Error(`Chromium executable not found at ${executablePath}`);
  }

  const browser = await puppeteer.launch({
    headless: headless,
    executablePath: executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 768, height: 1024 });
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
    // try {
    //   await browser.disconnect();
    // } catch (error) {}
    await browser.close();
    throw error;
  }
}

async function smoothScroll(page: Page, distance: number, duration: number) {
  await page.evaluate(
    async (distance, duration) => {
      await new Promise((resolve) => {
        const start = performance.now();
        const startPosition = window.pageYOffset;

        function step() {
          const elapsed = performance.now() - start;
          const progress = Math.min(elapsed / duration, 1);

          // Hàm easing để tạo hiệu ứng mượt mà
          const easeInOutQuad = (t: number) =>
            t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          window.scrollTo(
            0,
            startPosition + distance * easeInOutQuad(progress)
          );

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve(true);
          }
        }

        requestAnimationFrame(step);
      });
    },
    distance,
    duration
  );
}

async function pasteImage(page: Page, selector: ElementHandle<Element>) {
  await selector.focus();

  await page.keyboard.down("ControlLeft");
  await page.keyboard.down("V");

  await page.keyboard.up("V");
  await page.keyboard.up("ControlLeft");
  // Đợi một chút để đảm bảo hình ảnh đã được paste
  await sleep(2000);
}

async function uploadImage(page: Page, link_file: string) {
  try {
    const input: any = await page.$(
      'xpath=//input[@type="file" and @multiple=""]'
    );
    console.log("Input", input);
    await input.uploadFile(link_file);

    console.log("File uploaded successfully");
  } catch (error) {
    console.error("Error in uploadImage:", error);
    throw error;
  }
}

async function getCookies(page: Page, domain?: string) {
  let cookies: Cookie[] = [];

  if (domain) {
    cookies = await page.cookies();
    cookies = cookies.filter((cookie) => cookie.domain.includes(domain));

    // Kiểm tra xem có cookie 'c_user' hay không
    const hasUserCookie = cookies.some((cookie) => cookie.name === "c_user");

    if (hasUserCookie) {
      return cookies;
    } else {
      return []; // Trả về mảng rỗng nếu không tìm thấy 'c_user'
    }
  }

  return cookies;
}
function cookiesToString(cookies: Cookie[]): string {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

async function handleBrowserClosing(page: Page): Promise<string> {
  try {
    if (page && !page.isClosed()) {
      const facebookCookies = await getCookies(page, "facebook.com");
      if (facebookCookies.length > 0) {
        const cookie = cookiesToString(facebookCookies);
        //console.log("Facebook cookies:", cookie);
        return cookie;
      } else {
        //console.log("Facebook cookies: Rỗng");
      }
      return "";
    }
  } catch (error) {
    console.error("Lỗi khi xử lý đóng browser:", error);
    return "";
  }

  return "";
}
