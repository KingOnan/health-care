// 저혈당/정상/주의/고혈당 4단계 기준값 — 대한당뇨병학회 기준 참고.
// 추후 백엔드 config로 이전 예정.
const LOW_MAX = 70; // 이하이면 저혈당 (공복·식후 2시간 공통)

const FASTING_NORMAL_MAX = 100; // 미만이면 정상(공복)
const FASTING_CAUTION_MAX = 126; // 미만이면 주의(공복혈당장애), 이상이면 고혈당

const POST_MEAL_NORMAL_MAX = 140; // 미만이면 정상(식후 2시간)
const POST_MEAL_CAUTION_MAX = 200; // 미만이면 주의(내당능장애), 이상이면 고혈당

function classify(value, normalMax, cautionMax) {
  if (value <= LOW_MAX) return "low";
  if (value < normalMax) return "normal";
  if (value < cautionMax) return "caution";
  return "warning";
}

export function getGlucoseStatus(timing, value) {
  return timing === "공복"
    ? classify(value, FASTING_NORMAL_MAX, FASTING_CAUTION_MAX)
    : classify(value, POST_MEAL_NORMAL_MAX, POST_MEAL_CAUTION_MAX);
}
