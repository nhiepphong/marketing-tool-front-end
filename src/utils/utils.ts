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
