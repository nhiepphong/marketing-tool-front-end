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
