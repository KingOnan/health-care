// 4단계 판정 색 범례 — 기준표 화면과 같은 알약 모양(옅은 단계 색 배경 + 단계 색 글자 + 단계 색 50% 테두리)
const PILL_CLASS = {
  low: "bg-low/10 text-low border-low/50",
  normal: "bg-text/5 text-text border-text/50",
  caution: "bg-caution/10 text-caution border-caution/50",
  warning: "bg-warning/10 text-warning border-warning/50",
};

function StatusLegend({ lowLabel = "저혈압", highLabel = "고혈압" }) {
  const items = [
    { key: "low", label: lowLabel },
    { key: "normal", label: "정 상" },
    { key: "caution", label: "주 의" },
    { key: "warning", label: highLabel },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className={`rounded-full border-2 py-1 text-center text-[21px] font-bold ${PILL_CLASS[item.key]}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default StatusLegend;
