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
