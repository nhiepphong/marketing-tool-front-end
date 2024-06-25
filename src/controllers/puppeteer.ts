import puppeteer from "puppeteer";
import { parseCookieString } from "../utils/utils";

export async function scrapeFacebook(
  url: string,
  cookieString: string,
  searchType: string,
  interactions: number
): Promise<any> {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Set cookies if provided
  try {
    const cookies = parseCookieString(cookieString);
    console.log("Parsed cookies:", cookies); // Log để kiểm tra

    for (const cookie of cookies) {
      if (cookie.name != "") {
        try {
          await page.setCookie(cookie);
          console.log(`Successfully set cookie: ${cookie.name}`);
        } catch (error) {
          console.error(`Failed to set cookie [${cookie.name}]:`, error);
        }
      }
    }

    await page.goto(url, { waitUntil: "networkidle0" });
    const result = await page.evaluate(() => {
      const pageContent = document.body.innerHTML;

      // Tìm chuỗi cụ thể
      const regex = /"restrictable_profile_owner":(\{[^}]+\})/;
      const match = pageContent.match(regex);

      if (match && match[1]) {
        try {
          const profileData = JSON.parse(match[1]);
          return {
            id: profileData.id,
            gender: profileData.gender,
            name: profileData.name,
          };
        } catch (error) {
          console.error("Error parsing profile data:", error);
        }
      }

      return null;
    });

    console.log("Profile Owner ID:", result?.id);
    console.log("Profile Owner Gender:", result?.gender);
    console.log("Profile Owner Name:", result?.name);

    //await browser.close();
    return result;
  } catch (error) {
    console.error("Error in scrape-facebook:", error);
    await browser.close();
    throw error;
  }
}
