// 모바일 키패드 관련 함수

// 지금 글자를 입력 중인 칸(키패드가 떠 있는 상태)인지 — 체크박스·파일 선택 등은 키패드가 안 뜨므로 제외
export function isTypingElement(el) {
  if (!el) return false;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName !== "INPUT") return false;
  return !["checkbox", "radio", "file", "button", "submit"].includes(el.type);
}
