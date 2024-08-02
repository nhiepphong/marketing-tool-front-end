import { DataUser } from "./interface.global";

export function getRandomElement(array: any) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function d2(n: number) {
  if (n < 10) {
    return "0" + n.toString();
  } else {
    return n.toString();
  }
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function getDateNowWithString(): string {
  const date = new Date();
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function getTimeNowToString(): string {
  const date = new Date();
  return date.getTime().toString();
}

export function parseCookieString(cookieString: string) {
  return cookieString.split(";").map((pair) => {
    let [name, ...values] = pair.trim().split("=");
    let value = values.join("="); // Kết hợp lại các phần của giá trị nếu nó chứa dấu '='

    // Loại bỏ các ký tự không hợp lệ và giới hạn độ dài
    name = name.trim().substring(0, 255);
    value = value.trim().substring(0, 1024);

    return {
      name,
      value,
      domain: ".facebook.com",
      path: "/",
      expires: Math.floor(Date.now() / 1000) + 86400, // expires in 1 day
      httpOnly: false,
      secure: true,
      sameSite: "None" as const,
    };
  });
}

export function getGenderParsed(gender: string) {
  if (gender.toUpperCase() == "FEMALE") {
    return "Nữ";
  } else if (gender.toUpperCase() == "MALE") {
    return "Nam";
  } else if (gender.toUpperCase() == "NAM") {
    return "Nam";
  } else if (gender.toUpperCase() == "NỮ") {
    return "Nữ";
  }

  return gender;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function cleanFacebookUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const searchParams = new URLSearchParams(parsedUrl.search);
    searchParams.delete("__tn__");
    parsedUrl.search = searchParams.toString();
    return parsedUrl.toString();
  } catch (error) {
    console.error("Error cleaning URL:", error);
    return url; // Trả về URL gốc nếu có lỗi
  }
}

export function replaceKeywords(
  message: string,
  replacements: Record<string, string>
): string {
  let msg = Object.entries(replacements).reduce((acc, [key, value]) => {
    const regex = new RegExp(`{${key}}`, "g");
    return acc.replace(regex, value);
  }, message);
  return msg;
}

export const calculateRemainingDays = (expireDateStr: string): number => {
  const expireDate = new Date(expireDateStr);
  const today = new Date();

  // Chuyển đổi Date thành timestamp (số)
  const diffTime = expireDate.getTime() - today.getTime();

  // Chuyển đổi milliseconds thành số ngày và làm tròn
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
