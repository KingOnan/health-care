const DOT_CLASS = { low: "bg-low", normal: "bg-text", caution: "bg-caution", warning: "bg-warning" };

function StatusLegend({ lowLabel = "저혈압", highLabel = "고혈압" }) {
  const items = [
    { key: "low", label: lowLabel },
    { key: "normal", label: "정상" },
    { key: "caution", label: "주의" },
    { key: "warning", label: highLabel },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-5">
      {items.map((item) => (
        <span
          key={item.key}
          className="flex items-center gap-1.5 text-lg font-semibold text-text-muted"
        >
          <span className={`h-3.5 w-3.5 rounded-full ${DOT_CLASS[item.key]}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default StatusLegend;
