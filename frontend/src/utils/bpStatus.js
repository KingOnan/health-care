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

// 서버가 계산해서 내려주는 level(저혈압/정상/주의/고혈압)을 화면에서 쓰는 status 키로 변환.
// 서버 API가 아직 없는 화면(통계 탭 등)은 위 getBpStatus로 클라이언트에서 직접 계산하는 예전 방식을 그대로 씀.
const LEVEL_TO_STATUS = {
  저혈압: "low",
  정상: "normal",
  주의: "caution",
  고혈압: "warning",
};

export function levelToStatus(level) {
  return LEVEL_TO_STATUS[level] ?? "normal";
}
