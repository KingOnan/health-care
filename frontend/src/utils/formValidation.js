// 입력 화면 공통 필수값·형식 확인 — 저장 전에 화면에서 먼저 걸러서 바로 안내하기 위한 함수들
// (서버도 같은 기준으로 한 번 더 검증함)

// 빈 칸이거나 공백만 있는지
export function isBlank(text) {
  return String(text ?? "").trim() === "";
}

// 빈 칸이 아니고, 정수이며, 범위 안인지
export function isIntInRange(text, min, max) {
  if (isBlank(text)) return false;
  const n = Number(text);
  return Number.isInteger(n) && n >= min && n <= max;
}

// 실제로 있는 날짜인지 (예: 2월 30일, 13월은 false)
export function isValidDate(year, month, day) {
  if (!isIntInRange(year, 2000, 2100) || !isIntInRange(month, 1, 12) || !isIntInRange(day, 1, 31)) return false;
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.getMonth() === Number(month) - 1 && d.getDate() === Number(day);
}
