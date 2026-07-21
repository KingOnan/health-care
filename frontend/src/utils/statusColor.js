// 저혈압/정상/주의/고혈압(혹은 저혈당/정상/주의/고혈당) 판정은 항상 코드가 계산해서 status로 넘겨준다 — 여기서는 색만 매핑
export const STATUS_TEXT_CLASS = {
  low: "text-low",
  normal: "text-text",
  caution: "text-caution",
  warning: "text-warning",
};
