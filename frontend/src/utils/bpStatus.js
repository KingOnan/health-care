// 저혈압/정상/주의/고혈압 4단계 기준값 — 대한고혈압학회·질병관리청 기준 참고.
// 추후 백엔드 config로 이전 예정.
export const SYSTOLIC_LOW_MAX = 90; // 미만이면 저혈압
export const SYSTOLIC_NORMAL_MAX = 120; // 미만이면 정상
const SYSTOLIC_CAUTION_MAX = 140; // 미만이면 주의, 이상이면 고혈압

const DIASTOLIC_LOW_MAX = 60;
const DIASTOLIC_NORMAL_MAX = 80;
const DIASTOLIC_CAUTION_MAX = 90;

// 수축기/이완기 중 더 심각한 쪽을 최종 판정으로 채택 (고혈압 > 저혈압 > 주의 > 정상 순 우선)
const PRIORITY = ["normal", "caution", "low", "warning"];

function classify(value, lowMax, normalMax, cautionMax) {
  if (value < lowMax) return "low";
  if (value < normalMax) return "normal";
  if (value < cautionMax) return "caution";
  return "warning";
}

export function getBpStatus(systolic, diastolic) {
  const systolicStatus = classify(
    systolic,
    SYSTOLIC_LOW_MAX,
    SYSTOLIC_NORMAL_MAX,
    SYSTOLIC_CAUTION_MAX,
  );
  const diastolicStatus = classify(
    diastolic,
    DIASTOLIC_LOW_MAX,
    DIASTOLIC_NORMAL_MAX,
    DIASTOLIC_CAUTION_MAX,
  );

  return PRIORITY.indexOf(systolicStatus) >= PRIORITY.indexOf(diastolicStatus)
    ? systolicStatus
    : diastolicStatus;
}
