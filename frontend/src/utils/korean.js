export function eulReul(word) {
  const lastChar = word?.trim().slice(-1) ?? "";
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) return "를";

  const hasBatchim = (code - 0xac00) % 28 !== 0;
  return hasBatchim ? "을" : "를";
}
