export function normalizeShopeeUrl(input) {
  if (!input || typeof input !== "string") return null;

  let s = input.trim().replace(/\\/g, "/");

  // 1. Nếu đã có dạng hợp lệ -> trả về luôn
  if (/^https?:\/\/(s\.)?shopee\.vn\/[A-Za-z0-9]+/.test(s)) {
    return s;
  }

  // 2. Trường hợp sai protocol "httpss" -> sửa lại
  s = s.replace(/^httpss?:\/+/, "https://");

  // 3. Nếu thiếu dấu "/" giữa domain và path (ví dụ: "httpss.shopee.vn11IkLbG5Y")
  const match = s.match(
    /^(?:https?:\/\/)?([A-Za-z0-9.-]*shopee\.vn)([A-Za-z0-9]+)/
  );
  if (match) {
    return `https://s.shopee.vn/${match[2]}`;
  }

  return null;
}

export function formatShopeeText(input) {
  if (!input || typeof input !== "string") return input;
  const parts = input.split("/");
  if (parts.length < 2) return input;
  const text = parts[0].trim();
  const rawUrl = parts[1].trim();
  const url = normalizeShopeeUrl(rawUrl);
  if (!url) return input;
  return `${text}\nLink mua 👉 ${url}`;
}

// Test thử
console.log(formatShopeeText("gạt tàn không khói/httpss.shopee.vn11IkLbG5Y"));
