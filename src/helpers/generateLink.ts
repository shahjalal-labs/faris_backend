import { nanoid } from "nanoid";

export function generateNanoLink(baseUrl = "https://shaara.com") {
  const id = nanoid(12);
  return `${baseUrl}/${id}`;
}